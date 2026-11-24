export type BuildingSummary = {
  id: string;
  address: string;
  lng: number;
  lat: number;
  minPrice: number;
  maxPrice: number;
  count: number;
};

export type ListingItem = {
  id: string;
  title: string;
  price: number;
  rooms: number;
  area: number;
  floor: number;
};
