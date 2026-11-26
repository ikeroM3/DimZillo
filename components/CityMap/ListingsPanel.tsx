import { X } from 'lucide-react';

import { formatPrice, formatRange } from '@/lib/format';
import type { BuildingSummary, ListingItem } from '@/types/map';
import css from './CityMap.module.css';

type Props = {
  building: BuildingSummary;
  items: ListingItem[] | null; // null = ще вантажиться
  error: boolean;
  onClose: () => void;
};

export default function ListingsPanel({ building, items, error, onClose }: Props) {
  return (
    <aside className={css.panel} aria-label="Оголошення в будинку">
      <header className={css.panelHead}>
        <div className={css.panelInfo}>
          <span className={css.panelAddress}>{building.address}</span>
          <span className={css.panelRange}>
            {formatRange(building.minPrice, building.maxPrice)}
          </span>
          <span className={css.panelCount}>Оголошень: {building.count}</span>
        </div>

        <button type="button" className={css.close} onClick={onClose} aria-label="Закрити">
          <X size={18} />
        </button>
      </header>

      <div className={css.list}>
        {error && <p className={css.state}>Не вдалося завантажити оголошення. Спробуйте ще раз.</p>}
        {!error && items === null && <p className={css.state}>Завантаження…</p>}
        {!error && items?.length === 0 && (
          <p className={css.state}>В цьому будинку немає активних оголошень.</p>
        )}

        {items?.map(item => (
          <article key={item.id} className={css.card}>
            {item.photos[0] && (
              <div className={css.photoWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className={css.photo}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {item.photos.length > 1 && (
                  <span className={css.photoCount}>{item.photos.length} фото</span>
                )}
              </div>
            )}
            <span className={css.cardPrice}>{formatPrice(item.price)}</span>
            <h3 className={css.cardTitle}>{item.title}</h3>
            <p className={css.cardMeta}>
              {item.rooms} кімн. · {item.area} м² · {item.floor} поверх
            </p>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={css.cardLink}>
                Відкрити на DOM.RIA
              </a>
            )}
          </article>
        ))}
      </div>
    </aside>
  );
}
