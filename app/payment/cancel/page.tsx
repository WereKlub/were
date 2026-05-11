import { Suspense } from "react";
import { PaymentCancelClient } from "./payment-cancel-client";

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
    purchase_ids?: string;
    status?: string;
    flow?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: SearchParamsProps) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PaymentCancelClient purchaseId={params.purchase_id} flow={params.flow} />
    </Suspense>
  );
}
