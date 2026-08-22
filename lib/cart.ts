export interface CartQuoteItem {
  quoteId: string;
  quoteNumber: string; // e.g. "CAQ24640"
  variantId?: string;
  brandName: string;
  modelName: string;
  storage?: string;
  imageUrl?: string | null;
  category?: "MOBILE" | "TABLET" | "LAPTOP" | string;
  estimatedPrice: number;
  basePrice?: number;
  customerName?: string;
  customerPhone?: string;
  selectedAnswersJson?: string;
  breakdownJson?: string;
  createdAt: string;
}

export const CART_STORAGE_KEY = "cashall_cart_quotes";
export const CART_UPDATED_EVENT = "cashall_cart_updated";

export function getCartQuotes(): CartQuoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveQuoteToCart(item: CartQuoteItem): CartQuoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCartQuotes();
    const filtered = existing.filter(
      (q) => q.quoteNumber !== item.quoteNumber && q.quoteId !== item.quoteId
    );
    const updated = [item, ...filtered];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    return updated;
  } catch (e) {
    return [];
  }
}

export function removeQuoteFromCart(quoteNumberOrId: string): CartQuoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCartQuotes();
    const updated = existing.filter(
      (q) => q.quoteNumber !== quoteNumberOrId && q.quoteId !== quoteNumberOrId
    );
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  } catch (e) {}
}
