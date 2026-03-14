import { Hero, FeaturedPieces } from "@/components/home";
import {
  getFeaturedProducts,
  getFeaturedGalleryPieces,
  getSiteSettings,
} from "@/lib/data/queries";

export default async function Home() {
  const [products, galleryPieces, settings] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedGalleryPieces(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero
        heading={settings.heroHeading}
        subheading={settings.heroSubheading}
      />
      <FeaturedPieces products={products} galleryPieces={galleryPieces} />
    </>
  );
}
