import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/sanity/queries";
import LoadingComponent from "@/components/ui/Bouncer";
import MerchContentClient from "./merch-content-client";

export const metadata: Metadata = {
  title: "Merch | Wêrê Klub",
  description:
    "Shop exclusive Wêrê Klub merchandise, apparel, and collectibles.",
};

async function MerchContent() {
  const products = await getAllProducts();
  return <MerchContentClient products={products || []} />;
}

export default async function MerchPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <MerchContent />
    </Suspense>
  );
}
