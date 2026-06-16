const STORAGE_KEY = "wereklub.checkout.contact";

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
}

function readRaw(): CheckoutContact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutContact>;
    if (
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.phone !== "string"
    ) {
      return null;
    }
    return {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
    };
  } catch {
    return null;
  }
}

export function readCheckoutContact(): CheckoutContact | null {
  return readRaw();
}

export function writeCheckoutContact(contact: Partial<CheckoutContact>): void {
  if (typeof window === "undefined") return;
  const current = readRaw() ?? { name: "", email: "", phone: "" };
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: contact.name ?? current.name,
        email: contact.email ?? current.email,
        phone: contact.phone ?? current.phone,
      }),
    );
  } catch {
    // Ignore quota / privacy errors
  }
}

export function clearCheckoutContact(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
