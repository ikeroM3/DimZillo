import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { loadDataset, mapItems, runActor } from '@/lib/domria';
import Building from '@/models/Building';
import Listing from '@/models/Listing';

export const maxDuration = 300;

const keyOf = (it: { lng: number; lat: number }) => `${it.lng.toFixed(4)}:${it.lat.toFixed(4)}`;

export async function POST(req: NextRequest) {
  if (
    !process.env.IMPORT_SECRET ||
    req.headers.get('x-import-secret') !== process.env.IMPORT_SECRET
  ) {
    return NextResponse.json({ error: 'Forbidden (перевірте IMPORT_SECRET)' }, { status: 403 });
  }

  try {
    const { datasetId, urls } = await req.json().catch(() => ({}));

    const raw = datasetId
      ? await loadDataset(datasetId)
      : await runActor(urls?.length ? urls : ['https://dom.ria.com/uk/orenda-kvartir/kiev/']);

    const { items, skipped } = mapItems(raw);
    if (!items.length) {
      return NextResponse.json({
        error: 'Немає придатних оголошень',
        received: raw.length,
        skipped,
      });
    }

    await connectDB();

    // 1) будинки (групуємо за координатами)
    const buildings = new Map<string, (typeof items)[number]>();
    for (const it of items) if (!buildings.has(keyOf(it))) buildings.set(keyOf(it), it);

    await Building.bulkWrite(
      [...buildings].map(([key, b]) => ({
        updateOne: {
          filter: { key },
          update: {
            $setOnInsert: {
              key,
              address: b.address,
              location: { type: 'Point', coordinates: [b.lng, b.lat] },
            },
          },
          upsert: true,
        },
      }))
    );

    const docs = await Building.find({ key: { $in: [...buildings.keys()] } })
      .select('_id key')
      .lean();
    const idByKey = new Map(docs.map(d => [d.key as string, d._id]));

    // 2) оголошення
    const result = await Listing.bulkWrite(
      items.map(it => ({
        updateOne: {
          filter: { source: 'domria', externalId: it.externalId },
          update: {
            $set: {
              building: idByKey.get(keyOf(it)),
              title: it.title,
              price: it.price,
              deal: it.deal,
              rooms: it.rooms,
              area: it.area,
              floor: it.floor,
              photos: it.photos,
              url: it.url,
              status: 'active',
            },
          },
          upsert: true,
        },
      }))
    );

    return NextResponse.json({
      received: raw.length,
      valid: items.length,
      skipped,
      buildings: buildings.size,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (e) {
    console.error('IMPORT ERROR:', e);
    return NextResponse.json(
      { error: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
