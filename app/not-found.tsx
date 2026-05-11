"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md text-center">
            <h1 className="font-display text-8xl md:text-9xl text-foreground mb-4 tracking-tight">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Oops! Page Not Found!
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              It seems like the page you&apos;re looking for does not exist or
              might have been removed.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="h-10"
              >
                Go Back
              </Button>
              <Button asChild className="h-10">
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
