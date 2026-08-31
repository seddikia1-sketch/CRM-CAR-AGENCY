import { useState, useCallback, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';

export type PaymentType = 'deposit' | 'installment' | 'final' | 'refund' | 'other';

export interface Payment {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  vehicleLabel?: string;
  type: PaymentType;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'other';
  date: string;
  notes: string;
  createdAt: string;
}

export interface PaymentFormData {
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  vehicleLabel?: string;
  type: PaymentType;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'other';
  date: string;
  notes: string;
}

function generateId() {
  return crypto.randomUUID();
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setPayments(storage.get<Payment[]>(STORAGE_KEYS.PAYMENTS) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback((list: Payment[]) => {
    storage.set(STORAGE_KEYS.PAYMENTS, list);
    setPayments(list);
  }, []);

  const addPayment = useCallback((data: PaymentFormData) => {
    const payment: Payment = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    save([payment, ...payments]);
    return payment;
  }, [payments, save]);

  const deletePayment = useCallback((id: string) => {
    save(payments.filter((p) => p.id !== id));
  }, [payments, save]);

  const totalReceived = payments
    .filter((p) => p.type !== 'refund')
    .reduce((s, p) => s + (p.amount || 0), 0);

  const totalDeposits = payments
    .filter((p) => p.type === 'deposit')
    .reduce((s, p) => s + (p.amount || 0), 0);

  const byClient = useCallback((clientId: string) => {
    return payments.filter((p) => p.clientId === clientId);
  }, [payments]);

  return {
    payments,
    loading,
    addPayment,
    deletePayment,
    totalReceived,
    totalDeposits,
    byClient,
    refresh: load,
  };
}
