import { Suspense } from "react";
import { getAllProducts } from "@/lib/sanity/queries";
import CardioLoader from "@/components/ui/cardio-loader";
import MerchContentClient from "./merch-content-client";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata = buildPageMetadata({
  title: "Merch | Wêrê Klub",
  description:
    "Shop exclusive Wêrê Klub merchandise, apparel, and collectibles.",
  path: "/merch",
});

async function MerchContent() {
  const products = await getAllProducts();
  return <MerchContentClient products={products || []} />;
}

export default async function MerchPage() {
  return (
    <Suspense fallback={<CardioLoader />}>
      <MerchContent />
    </Suspense>
  );
}
