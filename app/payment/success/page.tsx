import { Suspense } from "react";
import { PaymentSuccessClient } from "./payment-success-client";

interface SearchParamsProps {
  searchParams: Promise<{
    purchase_id?: string;
    purchase_ids?: string;
  }>;
}

function resolvePurchaseId(params: {
  purchase_id?: string;
  purchase_ids?: string;
}): string | undefined {
  if (params.purchase_id) return params.purchase_id;
  if (params.purchase_ids) {
    const first = params.purchase_ids.split(",")[0]?.trim();
    return first || undefined;
  }
  return undefined;
}

export default async function PaymentSuccessPage({
  searchParams,
}: SearchParamsProps) {
  const params = await searchParams;
  const purchaseId = resolvePurchaseId(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="animate-spin rounded-md h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PaymentSuccessClient purchaseId={purchaseId} />
    </Suspense>
  );
}
