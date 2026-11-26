const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 1 });
const short = (n: number) =>
  n >= 1_000_000 ? `${fmt(n / 1_000_000)} млн` : `${fmt(n / 1000)} тис`;

export function formatRange(min: number, max: number) {
  return min === max ? `${short(min)} $` : `${short(min)} – ${short(max)} $`;
}

export function formatPrice(n: number, deal: 'rent' | 'sale' = 'sale') {
  return deal === 'rent' ? `${n.toLocaleString('uk-UA')} $/міс` : `${n.toLocaleString('uk-UA')} $`;
}
