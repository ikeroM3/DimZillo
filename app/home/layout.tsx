import CityMap from '@/components/CityMap/CityMap';
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CityMap />
    </>
  );
}
