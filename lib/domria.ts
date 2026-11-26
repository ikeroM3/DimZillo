import { ApifyClient } from 'apify-client';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ImportedListing = {
  externalId: string;
  url?: string;
  title: string;
  price: number;
  deal: 'rent' | 'sale';
  rooms: number;
  area: number;
  floor: number;
  address: string;
  lng: number;
  lat: number;
  photos: string[];
};

const num = (v: unknown) => {
  if (v == null || v === '') return undefined;
  const n = typeof v === 'string' ? parseFloat(v.replace(/\s/g, '').replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function mapItems(rawItems: any[]) {
  const items: ImportedListing[] = [];
  const skipped = { noId: 0, noCoords: 0, noPrice: 0 };

  for (const raw of rawItems) {
    const externalId = String(raw.id ?? '');
    const lat = num(raw.latitude);
    const lng = num(raw.longitude);
    const price = num(raw.priceUSD) ?? (raw.currency === '$' ? num(raw.price) : undefined);

    if (!externalId) {
      skipped.noId++;
      continue;
    }
    if (lat == null || lng == null) {
      skipped.noCoords++;
      continue;
    }
    if (price == null) {
      skipped.noPrice++;
      continue;
    }

    const rooms = num(raw.rooms) ?? 1;
    const address = [raw.street, raw.district && `(${raw.district})`, raw.city]
      .filter(Boolean)
      .join(', ');

    items.push({
      externalId,
      url: raw.url,
      title: String(raw.title ?? `${rooms}-кімнатна квартира`),
      price,
      deal: String(raw.advertType ?? '')
        .toLowerCase()
        .includes('оренд')
        ? 'rent'
        : 'sale',
      rooms,
      area: num(raw.areaTotal) ?? 1,
      floor: num(raw.floor) ?? 0,
      address: address || 'Без адреси',
      lng,
      lat,
      photos:
        typeof raw.mainPhoto === 'string'
          ? [raw.mainPhoto.replace(/b\.(jpe?g|webp)$/i, 'f.$1')]
          : [],
    });
  }
  return { items, skipped };
}

const client = () => new ApifyClient({ token: process.env.APIFY_TOKEN });

/** Готовий датасет (без нового запуску актора) */
export async function loadDataset(datasetId: string) {
  const { items } = await client().dataset(datasetId).listItems({ limit: 1000 });
  return items;
}

/** Новий запуск актора (платно, повільно) */
export async function runActor(listingUrls: string[], maxItemsPerUrl = 100) {
  const c = client();
  const run = await c
    .actor('ivladimir/dom-ria-listings')
    .call({ listingUrls, maxItemsPerUrl, includeDescription: false });
  const { items } = await c.dataset(run.defaultDatasetId).listItems();
  return items;
}
