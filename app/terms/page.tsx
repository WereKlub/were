import type { Metadata } from "next";
import TermsClientPage from "./terms-client";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms and Conditions for using wereklub.com and attending Wêrê Klub events.",
};

export default function Page() {
  return <TermsClientPage />;
}
