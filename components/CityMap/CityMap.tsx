'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  Map as MapLibreMap,
  Marker,
  GeoJSONSource,
  ExpressionSpecification,
} from 'maplibre-gl';
import type { Polygon, MultiPolygon } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getBuildings, getBuildingListings, seedBuilding } from '@/lib/api';
import { formatRange } from '@/lib/format';
import type { BuildingSummary, ListingItem } from '@/types/map';

import ListingsPanel from './ListingsPanel';
import css from './CityMap.module.css';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/fiord';
const CENTER: [number, number] = [30.5234, 50.4501]; // Київ
const PANEL_WIDTH = 500;
const BUILDINGS_LAYER = 'buildings-3d';

// ---- налаштування висоти будинків ----
const HEIGHT_SCALE = 2; // множник: 1 = реальна висота, 2 = вдвічі вищі
const DEFAULT_HEIGHT = 25; // метрів, якщо в тайлах немає висоти
const BASE_HEIGHT: ExpressionSpecification = [
  'coalesce',
  ['get', 'render_height'],
  ['get', 'height'],
  DEFAULT_HEIGHT,
];
const EMPTY = { type: 'FeatureCollection' as const, features: [] };

// MapLibre 6: воркер віддається з public/maplibre (див. scripts/copy-maplibre-worker.mjs)
let workerReady = false;

/* ---------- point in polygon ---------- */
function ringContains(ring: number[][], [x, y]: number[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function darkenBase(map: MapLibreMap) {
  for (const l of map.getStyle().layers) {
    if (l.type === 'background') {
      map.setPaintProperty(l.id, 'background-color', '#05070d');
    } else if (l.type === 'fill' && 'source-layer' in l && l['source-layer'] === 'water') {
      map.setPaintProperty(l.id, 'fill-color', '#0a0d18');
    }
  }
}
function polygonContains(g: Polygon | MultiPolygon, p: number[]) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.some(
    rings => ringContains(rings[0], p) && !rings.slice(1).some(hole => ringContains(hole, p))
  );
}

type Loaded = { buildingId: string; items: ListingItem[]; error: boolean };

export default function CityMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const buildingsRef = useRef<BuildingSummary[]>([]);
  const pillsRef = useRef(new Map<string, HTMLElement>());

  const [selected, setSelected] = useState<BuildingSummary | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  /* ---------- ініціалізація карти ---------- */
  useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | undefined;
    const markers: Marker[] = [];

    (async () => {
      const maplibregl = await import('maplibre-gl');
      if (cancelled || !containerRef.current) return;

      if (!workerReady) {
        maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
        workerReady = true;
      }

      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: CENTER,
        zoom: 15.6,
        pitch: 62,
        bearing: -17,
        maxPitch: 75,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      });
      mapRef.current = map;
      const m = map;

      m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left');

      const reload = async () => {
        const data = await getBuildings();
        if (cancelled) return;
        buildingsRef.current = data;

        markers.forEach(mk => mk.remove());
        markers.length = 0;
        pillsRef.current.clear();

        for (const b of data) {
          // wrapper отримує transform від MapLibre, hover-ефекти на внутрішній кнопці
          const wrap = document.createElement('div');
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = css.pill;
          pill.textContent = formatRange(b.minPrice, b.maxPrice);
          pill.setAttribute('aria-label', `${b.address}: ${formatRange(b.minPrice, b.maxPrice)}`);
          pill.addEventListener('click', e => {
            e.stopPropagation();
            setSelected(b);
          });
          wrap.appendChild(pill);
          pillsRef.current.set(b.id, pill);

          markers.push(
            new maplibregl.Marker({ element: wrap, anchor: 'bottom' })
              .setLngLat([b.lng, b.lat])
              .addTo(m)
          );
        }
      };

      m.on('load', async () => {
        darkenBase(m);
        const layers = m.getStyle().layers;

        // шукаємо джерело будівель у стилі та ховаємо його власні 3D-шари
        let buildingSource: string | undefined;
        for (const l of layers) {
          if ('source-layer' in l && l['source-layer'] === 'building') {
            buildingSource ??= l.source;
            if (l.type === 'fill-extrusion') m.setLayoutProperty(l.id, 'visibility', 'none');
          }
        }
        // запасний варіант: перше векторне джерело зі стилю
        if (!buildingSource) {
          buildingSource = Object.entries(m.getStyle().sources).find(
            ([, src]) => src.type === 'vector'
          )?.[0];
        }
        if (!buildingSource) {
          console.warn('У стилі немає векторного джерела');
          return;
        }

        const labelLayerId = layers.find(l => l.type === 'symbol' && l.layout?.['text-field'])?.id;
        const height: ExpressionSpecification = ['*', BASE_HEIGHT, HEIGHT_SCALE];
        const base: ExpressionSpecification = [
          '*',
          ['coalesce', ['get', 'render_min_height'], 0],
          HEIGHT_SCALE,
        ];

        m.addLayer(
          {
            id: BUILDINGS_LAYER,
            type: 'fill-extrusion',
            source: buildingSource,
            'source-layer': 'building',
            minzoom: 13,
            filter: ['!=', ['get', 'hide_3d'], true],
            layout: { 'fill-extrusion-rounded-corner-distance': 2 },
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                BASE_HEIGHT,
                0,
                '#1c2342',
                80,
                '#2d3b73',
                200,
                '#4b60b4',
              ],
              'fill-extrusion-height': height,
              'fill-extrusion-base': base,
              'fill-extrusion-opacity': 0.92,
            },
          },
          labelLayerId
        );

        // підсвітка вибраного будинку
        m.addSource('selected', { type: 'geojson', data: EMPTY });
        m.addLayer(
          {
            id: 'selected-3d',
            type: 'fill-extrusion',
            source: 'selected',
            layout: { 'fill-extrusion-rounded-corner-distance': 2 },
            paint: {
              'fill-extrusion-color': '#ff7a1a',
              'fill-extrusion-height': height,
              'fill-extrusion-base': base,
              'fill-extrusion-opacity': 0.95,
            },
          },
          labelLayerId
        );

        m.on('mouseenter', BUILDINGS_LAYER, () => (m.getCanvas().style.cursor = 'pointer'));
        m.on('mouseleave', BUILDINGS_LAYER, () => (m.getCanvas().style.cursor = ''));

        m.on('click', async e => {
          const hit = m.queryRenderedFeatures(e.point, { layers: [BUILDINGS_LAYER] })[0];
          const poly = hit?.geometry as Polygon | MultiPolygon | undefined;
          const found = poly
            ? buildingsRef.current.find(b => polygonContains(poly, [b.lng, b.lat]))
            : undefined;

          // dev: Alt + клік по будинку створює демо-оголошення
          if (e.originalEvent.altKey && process.env.NODE_ENV === 'development') {
            if (poly && !found) {
              await seedBuilding({ lng: e.lngLat.lng, lat: e.lngLat.lat });
              await reload();
            }
            return;
          }

          setSelected(found ?? null);
        });

        await reload();
      });
    })();

    return () => {
      cancelled = true;
      markers.forEach(mk => mk.remove());
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  /* ---------- вибір будинку: підсвітка, мітка, камера ---------- */
  useEffect(() => {
    pillsRef.current.forEach((el, id) => el.classList.toggle(css.pillActive, id === selected?.id));

    const map = mapRef.current;
    const src = map?.getSource('selected') as GeoJSONSource | undefined;
    if (!map || !src) return;

    if (!selected) {
      src.setData(EMPTY);
      map.easeTo({ padding: { top: 0, right: 0, bottom: 0, left: 0 }, duration: 600 });
      return;
    }

    const point: [number, number] = [selected.lng, selected.lat];
    const hit = map
      .queryRenderedFeatures(map.project(point), { layers: [BUILDINGS_LAYER] })
      .find(f => polygonContains(f.geometry as Polygon | MultiPolygon, point));

    src.setData(
      hit
        ? {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', geometry: hit.geometry, properties: hit.properties }],
          }
        : EMPTY
    );

    const wide = window.innerWidth > 900;
    map.easeTo({
      center: point,
      zoom: Math.max(map.getZoom(), 16.5),
      padding: wide
        ? { top: 0, right: PANEL_WIDTH, bottom: 0, left: 0 }
        : { top: 0, right: 0, bottom: 340, left: 0 },
      duration: 900,
    });
  }, [selected]);

  /* ---------- оголошення вибраного будинку ---------- */
  const selectedId = selected?.id;
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    getBuildingListings(selectedId)
      .then(items => !cancelled && setLoaded({ buildingId: selectedId, items, error: false }))
      .catch(() => !cancelled && setLoaded({ buildingId: selectedId, items: [], error: true }));

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const current = selected && loaded?.buildingId === selected.id ? loaded : null;

  return (
    <section className={css.wrap}>
      <div ref={containerRef} className={css.map} />

      {process.env.NODE_ENV === 'development' && (
        <p className={css.devHint}>Alt + клік по будинку: додати демо-оголошення</p>
      )}

      {selected && (
        <ListingsPanel
          building={selected}
          items={current ? current.items : null}
          error={current?.error ?? false}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
