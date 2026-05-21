import { Suspense } from "react";
import AdminClient from "./admin-client";
import CardioLoader from "@/components/ui/cardio-loader";

export default function AdminPage() {
  return (
    <Suspense fallback={<CardioLoader />}>
      <AdminClient />
    </Suspense>
  );
}
