"use client";

import { useState, useEffect } from "react";
import { X, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/components/ui/FacebookPixel";
import { useTheme } from "@/lib/contexts/ThemeContext";

interface FloatingPromoProps {
  imageUrl?: string;
  onClose?: () => void;
  onButtonClick?: () => void;
  href?: string;
  title?: string;
  buttonText?: string;
}

export default function FloatingPromo({
  imageUrl = "/placeholder.webp",
  onClose = () => {},
  onButtonClick = () => {},
  href,
  title = "Promotional event flyer",
  buttonText = "Get your ticket",
}: FloatingPromoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { button } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={{ duration: 0.3 }}
      className="group fixed z-40 right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] w-[160px] sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:w-[180px] md:right-8 md:bottom-16 md:w-[200px] lg:right-10 lg:bottom-20 lg:w-[220px]"
    >
      <div className="absolute -top-3 -right-3 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted shadow-md transition-colors hover:bg-muted/80"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-center border-b border-border bg-muted/70 px-2 py-1.5">
          <div className="flex space-x-1.5">
            <div className="h-2 w-2 rounded-md bg-[#ff5f56]" />
            <div className="h-2 w-2 rounded-md bg-[#ffbd2e]" />
            <div className="h-2 w-2 rounded-md bg-[#27c93f]" />
          </div>
        </div>

        <div className="relative aspect-video w-full">
          <Image
            src={imageUrl || "/placeholder.webp"}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full">
          {href ? (
            <Link
              href={href}
              className={`flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors rounded-b-sm text-center ${button.primary}`}
              onClick={() => {
                trackEvent("Lead", {
                  content_name: title || "Floating Promo",
                  content_category: "promo",
                });
              }}
            >
              <PartyPopper className="mr-1.5 h-3.5 w-3.5" />
              {buttonText}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackEvent("Lead", {
                  content_name: title || "Floating Promo",
                  content_category: "promo",
                });
                onButtonClick();
              }}
              className={`flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium transition-colors rounded-b-sm ${button.primary}`}
            >
              <PartyPopper className="mr-1.5 h-3.5 w-3.5" />
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
