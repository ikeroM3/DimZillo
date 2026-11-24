const k = (n: number) => (n / 1000).toLocaleString('uk-UA', { maximumFractionDigits: 1 });

/** 12 000–18 500 -> "12–18,5 тис ₴" */
export function formatRange(min: number, max: number) {
  return min === max ? `${k(min)} тис ₴` : `${k(min)}–${k(max)} тис ₴`;
}

export function formatPrice(n: number) {
  return `${n.toLocaleString('uk-UA')} ₴/міс`;
}
