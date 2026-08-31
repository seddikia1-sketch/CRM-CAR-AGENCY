import { useState, useCallback, useEffect } from 'react';
import type { Booking, BookingFormData, BookingStatus } from '../types';
import { storage, STORAGE_KEYS } from '../services/storage';

function generateId() {
  return crypto.randomUUID();
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setBookings(storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback((list: Booking[]) => {
    storage.set(STORAGE_KEYS.BOOKINGS, list);
    setBookings(list);
  }, []);

  const addBooking = useCallback((data: BookingFormData) => {
    const now = new Date().toISOString();
    const booking: Booking = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    save([booking, ...bookings]);
    return booking;
  }, [bookings, save]);

  const updateBooking = useCallback((id: string, data: Partial<BookingFormData>) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
    );
    save(updated);
  }, [bookings, save]);

  const deleteBooking = useCallback((id: string) => {
    save(bookings.filter((b) => b.id !== id));
  }, [bookings, save]);

  const setStatus = useCallback((id: string, status: BookingStatus) => {
    updateBooking(id, { status });
  }, [updateBooking]);

  const todayBookings = bookings.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today && b.status !== 'cancelled';
  });

  const upcomingBookings = bookings
    .filter((b) => {
      const today = new Date().toISOString().split('T')[0];
      return b.date >= today && (b.status === 'pending' || b.status === 'confirmed');
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    today: todayBookings.length,
    upcoming: upcomingBookings.length,
  };

  return {
    bookings,
    loading,
    addBooking,
    updateBooking,
    deleteBooking,
    setStatus,
    todayBookings,
    upcomingBookings,
    stats,
    refresh: load,
  };
}
