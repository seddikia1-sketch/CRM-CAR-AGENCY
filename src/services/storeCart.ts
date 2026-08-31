import { storage } from './storage';
import type { CatalogCar } from '../data/storeCatalog';

const CART_KEY = 'crm_store_cart';

export interface CartItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image?: string;
  addedAt: string;
}

export function getCart(): CartItem[] {
  return storage.get<CartItem[]>(CART_KEY) || [];
}

export function cartCount(): number {
  return getCart().length;
}

export function addToCart(car: CatalogCar): CartItem[] {
  const list = getCart().filter((x) => x.id !== car.id);
  const item: CartItem = {
    id: car.id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: car.price || 0,
    image: car.images?.[0],
    addedAt: new Date().toISOString(),
  };
  const next = [item, ...list];
  storage.set(CART_KEY, next);
  return next;
}

export function removeFromCart(id: string): CartItem[] {
  const next = getCart().filter((x) => x.id !== id);
  storage.set(CART_KEY, next);
  return next;
}

export function clearCart(): void {
  storage.set(CART_KEY, []);
}

export function isInCart(id: string): boolean {
  return getCart().some((x) => x.id === id);
}
