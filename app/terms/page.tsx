import TermsClientPage from "./terms-client";
import { buildPageMetadata } from "@/lib/site-metadata";

export const metadata = buildPageMetadata({
  title: "Terms",
  description:
    "Terms and Conditions for using wereklub.com and attending Wêrê Klub events.",
  path: "/terms",
});

export default function Page() {
  return <TermsClientPage />;
}
