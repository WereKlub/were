"use client";

import { PlusCircleIcon, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useCart } from "./cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Bouncer";
import { CartItemCard } from "./cart-item-card";
import Link from "next/link";
import { cn } from "@/lib/actions/utils";
import { createPortal } from "react-dom";
import CartPurchaseForm from "./cart-purchase-form";
import { useTranslation } from "@/lib/contexts/TranslationContext";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { t } from "@/lib/i18n/translations";
import { useIsMobile } from "@/lib/utils/use-is-mobile";

const CartContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("px-1 md:px-4", className)}>{children}</div>;
};

const CartItems = ({
  closeCart,
  onProceedToCheckout,
}: {
  closeCart: () => void;
  onProceedToCheckout: () => void;
}) => {
  const { cart } = useCart();
  const { currentLanguage } = useTranslation();

  if (!cart) return <></>;

  const hasItems = cart.lines.length > 0;

  return (
    <div className="flex flex-col justify-between h-full overflow-hidden">
      <CartContainer className="flex justify-between items-center px-2 text-sm text-muted-foreground mb-4">
        <span className="font-medium">
          {t(currentLanguage, "cartModal.products")}
        </span>
        <span className="bg-muted/50 px-2 py-1 rounded-sm text-xs">
          {t(
            currentLanguage,
            cart.totalQuantity !== 1
              ? "cartModal.itemCountPlural"
              : "cartModal.itemCount",
            { count: cart.totalQuantity },
          )}
        </span>
      </CartContainer>
      <div className="relative flex-1 min-h-0 py-4 overflow-x-hidden">
        <CartContainer className="overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] flex flex-col gap-y-3 h-full scrollbar-hide">
          <AnimatePresence>
            {cart.lines.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.1, ease: "easeOut" }}
              >
                <CartItemCard item={item} onCloseCart={closeCart} />
              </motion.div>
            ))}
          </AnimatePresence>
        </CartContainer>
      </div>
      <CartContainer>
        <div className="py-3 text-sm shrink-0">
          <CartContainer className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <p className="text-muted-foreground">
                {t(currentLanguage, "cartModal.subtotal")}
              </p>
              <p className="text-foreground">
                {Number(cart.cost.subtotalAmount.amount).toLocaleString(
                  "fr-FR",
                )}{" "}
                F CFA
              </p>
            </div>
            {hasItems && (
              <div className="flex justify-between items-center py-1">
                <p className="text-muted-foreground">
                  {t(currentLanguage, "cartModal.shipping")}
                </p>
                <p className="text-foreground">
                  {cart.cost.shippingAmount &&
                  Number(cart.cost.shippingAmount.amount) > 0
                    ? `${Number(cart.cost.shippingAmount.amount).toLocaleString(
                        "fr-FR",
                      )} F CFA`
                    : t(currentLanguage, "cartModal.freeShipping")}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center py-2 pt-3 border-t border-border/40">
              <p className="text-lg font-bold text-foreground">
                {t(currentLanguage, "cartModal.total")}
              </p>
              <p className="text-xl font-bold text-primary">
                {Number(cart.cost.totalAmount.amount).toLocaleString("fr-FR")} F
                CFA
              </p>
            </div>
          </CartContainer>
        </div>
        <CheckoutButton onProceedToCheckout={onProceedToCheckout} />
      </CartContainer>
    </div>
  );
};

const serializeCart = (cart: { lines: { id: string; quantity: number }[] }) => {
  return JSON.stringify(
    cart.lines.map((line) => ({
      merchandiseId: line.id,
      // Don't include quantity changes for auto-open logic
    })),
  );
};

// Shared state to prevent duplicate cart opens across multiple CartModal instances
let lastCartOpenTime = 0;
let cartOpenLock: string | null = null;
let activePortalInstance: string | null = null;
const CART_OPEN_DEBOUNCE_MS = 500; // Prevent duplicate opens within 500ms
const CART_PORTAL_ID = "cart-modal-portal";

type CartModalInstance = {
  id: string;
  open: () => void;
};

const cartModalInstances: CartModalInstance[] = [];

const registerCartModalInstance = (instance: CartModalInstance) => {
  cartModalInstances.push(instance);
};

const unregisterCartModalInstance = (id: string, open: () => void) => {
  const index = cartModalInstances.findIndex(
    (inst) => inst.id === id && inst.open === open,
  );
  if (index !== -1) {
    cartModalInstances.splice(index, 1);
  }
};

export const openCartExternally = () => {
  const target =
    cartModalInstances.find((inst) => inst.id === activePortalInstance) ??
    cartModalInstances[0];
  if (target) {
    target.open();
  }
};

// Helper to check if a cart drawer is already visible in the DOM
const isCartDrawerVisible = (): boolean => {
  if (typeof document === "undefined") return false;
  const portal = document.getElementById(CART_PORTAL_ID);
  if (portal) {
    const style = window.getComputedStyle(portal);
    const rect = portal.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }
  return false;
};

export default function CartModal() {
  const { cart } = useCart();
  const { currentLanguage } = useTranslation();
  const isMobile = useIsMobile();
  const [instanceId] = useState(
    () => `cart-${Math.random().toString(36).substring(7)}`,
  );
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [shouldRenderPortal, setShouldRenderPortal] = useState(false);
  const [mobileVisibleHeight, setMobileVisibleHeight] = useState<number | null>(
    null,
  );
  const serializedCart = useRef(cart ? serializeCart(cart) : undefined);

  const openCart = useCallback(() => {
    cartOpenLock = instanceId;
    activePortalInstance = instanceId;
    setShouldRenderPortal(true);
    setIsOpen(true);
  }, [instanceId]);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setIsMounted(true);
    // Create portal container if it doesn't exist
    if (typeof document !== "undefined") {
      let portalContainer = document.getElementById(CART_PORTAL_ID);
      if (!portalContainer) {
        portalContainer = document.createElement("div");
        portalContainer.id = CART_PORTAL_ID;
        document.body.appendChild(portalContainer);
      }
      setPortalNode(portalContainer);
    }
    registerCartModalInstance({
      id: instanceId,
      open: openCart,
    });
    return () => {
      setIsMounted(false);
      unregisterCartModalInstance(instanceId, openCart);
      if (cartOpenLock === instanceId) {
        cartOpenLock = null;
      }
      if (activePortalInstance === instanceId) {
        activePortalInstance = null;
      }
    };
  }, [instanceId, openCart]);

  useEffect(() => {
    if (!cart) return;

    const newSerializedCart = serializeCart(cart);
    const previousCartLinesCount = serializedCart.current
      ? JSON.parse(serializedCart.current).length
      : 0;
    const newCartLinesCount = cart.lines.length;

    // Initialize on first load
    if (serializedCart.current === undefined) {
      serializedCart.current = newSerializedCart;
      return;
    }

    // Only auto-open cart if items were ADDED (not removed or quantity changed) and cart has items
    const itemsWereAdded = newCartLinesCount > previousCartLinesCount;

    if (
      serializedCart.current !== newSerializedCart &&
      cart.totalQuantity > 0 &&
      itemsWereAdded
    ) {
      serializedCart.current = newSerializedCart;

      const now = Date.now();
      const timeSinceLastOpen = now - lastCartOpenTime;
      const drawerAlreadyVisible = isCartDrawerVisible();
      const canOpen =
        timeSinceLastOpen > CART_OPEN_DEBOUNCE_MS &&
        (cartOpenLock === null || cartOpenLock === instanceId) &&
        !isOpen &&
        !drawerAlreadyVisible;

      if (canOpen) {
        cartOpenLock = instanceId;
        activePortalInstance = instanceId;
        lastCartOpenTime = now;
        setShouldRenderPortal(true);
        setIsOpen(true);
        setTimeout(() => {
          if (cartOpenLock === instanceId) {
            cartOpenLock = null;
          }
        }, CART_OPEN_DEBOUNCE_MS);
      }
    } else {
      serializedCart.current = newSerializedCart;
    }
  }, [cart, isOpen, instanceId]);

  // Sync lock with isOpen state - release lock when closed
  useEffect(() => {
    if (!isOpen) {
      if (cartOpenLock === instanceId) {
        cartOpenLock = null;
      }
    } else {
      if (
        activePortalInstance === null ||
        activePortalInstance === instanceId
      ) {
        activePortalInstance = instanceId;
      }
    }
  }, [isOpen, instanceId]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobile || typeof window === "undefined") {
      setMobileVisibleHeight(null);
      return;
    }
    const vv = window.visualViewport;
    const apply = () => {
      setMobileVisibleHeight(
        vv ? Math.round(vv.height) : Math.round(window.innerHeight),
      );
    };
    apply();
    if (vv) {
      vv.addEventListener("resize", apply);
      vv.addEventListener("scroll", apply);
      return () => {
        vv.removeEventListener("resize", apply);
        vv.removeEventListener("scroll", apply);
      };
    }
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [isOpen, isMobile]);

  const closeCart = () => {
    setIsOpen(false);
    setShowPurchaseForm(false);
    if (cartOpenLock === instanceId) {
      cartOpenLock = null;
    }
    // Delay releasing portal ownership to allow exit animation to complete (300ms)
    setTimeout(() => {
      if (activePortalInstance === instanceId) {
        activePortalInstance = null;
        setShouldRenderPortal(false);
      }
    }, 350);
  };

  const renderCartContent = () => {
    if (!cart || cart.lines.length === 0) {
      return (
        <CartContainer className="flex w-full">
          <Link
            href="/merch"
            className="p-6 w-full bg-card/30 backdrop-blur-sm rounded-sm hover:bg-card/50 transition-all duration-300"
            onClick={closeCart}
          >
            <div className="flex flex-row gap-6 items-center">
              <div className="flex overflow-hidden relative justify-center items-center rounded-sm border border-dashed size-20 shrink-0 border-border/50 bg-muted/30">
                <PlusCircleIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <span className="text-xl font-bold text-foreground">
                  {t(currentLanguage, "cartModal.yourCartIsEmpty")}
                </span>
                <p className="text-muted-foreground hover:text-primary transition-colors">
                  {t(currentLanguage, "cartModal.startShopping")}
                </p>
              </div>
            </div>
          </Link>
        </CartContainer>
      );
    }

    return showPurchaseForm ? (
      <CartPurchaseForm />
    ) : (
      <CartItems
        closeCart={closeCart}
        onProceedToCheckout={() => setShowPurchaseForm(true)}
      />
    );
  };

  if (!cart) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        aria-label="Open cart"
        onClick={openCart}
        className="flex items-center gap-2 h-auto px-2 py-1.5 text-foreground hover:bg-transparent hover:text-foreground/80"
        size="sm"
        onClickCapture={(e) => {
          // Prevent event bubbling that might interfere with modal
          e.stopPropagation();
          openCart();
        }}
      >
        <ShoppingBag className="h-5 w-5 shrink-0" />
        <span className="text-sm tabular-nums">{cart.totalQuantity}</span>
      </Button>

      {/* Render modal at document body level using portal */}
      {isMounted &&
        shouldRenderPortal &&
        activePortalInstance === instanceId &&
        portalNode &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="cart-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="fixed inset-0 z-60 bg-foreground/30 will-change-auto"
                  onClick={closeCart}
                  aria-hidden="true"
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />

                {/* Panel - slides from bottom on mobile, from right on desktop */}
                <motion.div
                  key="cart-panel"
                  {...(isMobile
                    ? {
                        initial: { y: "100%" },
                        animate: { y: 0 },
                        exit: { y: "100%" },
                      }
                    : {
                        initial: { x: "100%" },
                        animate: { x: 0 },
                        exit: { x: "100%" },
                      })}
                  transition={{
                    duration: isMobile ? 0.22 : 0.3,
                    ease: isMobile ? [0.32, 0.72, 0, 1] : "easeInOut",
                  }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cart-modal-title"
                  className={cn(
                    "fixed z-70 will-change-transform overscroll-contain flex flex-col w-full",
                    isMobile
                      ? "inset-x-0 bottom-0 max-h-dvh"
                      : "top-0 bottom-0 right-0 md:w-[500px] md:p-4",
                  )}
                  style={
                    isMobile
                      ? { position: "fixed", left: 0, right: 0, bottom: 0 }
                      : { position: "fixed", top: 0, right: 0, bottom: 0 }
                  }
                  onClick={(e) => e.stopPropagation()} // Prevent event bubbling to cart button
                >
                  <div
                    className="flex flex-col py-4 px-2 md:px-4 w-full min-h-0 bg-card text-card-foreground backdrop-blur-xl rounded-t-xl md:rounded-sm shadow-2xl border border-border md:border-border h-[min(96dvh,100%)] md:h-full md:max-h-none dark:bg-[#1a1a1a]"
                    style={
                      isMobile && mobileVisibleHeight != null
                        ? { maxHeight: mobileVisibleHeight }
                        : undefined
                    }
                  >
                    <CartContainer className="flex justify-between items-center mb-6 md:mb-8">
                      <div>
                        <h2
                          id="cart-modal-title"
                          className="text-2xl md:text-3xl font-bold text-foreground"
                        >
                          {t(currentLanguage, "cartModal.cart")}
                        </h2>
                      </div>
                    </CartContainer>

                    <div className="flex flex-col flex-1 min-h-0">
                      {renderCartContent()}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalNode,
        )}
    </>
  );
}

function CheckoutButton({
  onProceedToCheckout,
}: {
  onProceedToCheckout: () => void;
}) {
  const { pending } = useFormStatus();
  const { cart, isPending } = useCart();
  const { currentLanguage } = useTranslation();
  const { button } = useTheme();

  const isLoading = pending;
  const isDisabled = !cart || cart.lines.length === 0 || isPending;

  return (
    <CartContainer className="mt-4">
      <Button
        type="submit"
        disabled={isDisabled}
        size="lg"
        className={`flex relative gap-3 justify-between items-center w-full ${button.secondary} rounded-sm font-semibold py-4`}
        onClick={onProceedToCheckout}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isLoading ? "loading" : "content"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex justify-center items-center w-full"
          >
            {isLoading ? (
              <Loader />
            ) : (
              <span className="font-semibold">
                {t(currentLanguage, "cartModal.proceedToCheckout")}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </CartContainer>
  );
}
