'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings, getPaymentMethods } from '@/lib/api';

interface Settings {
    businessName: string;
    logoUrl: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxRate: number;
    currency: string;
    dateFormat: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    isActive: boolean;
}

interface SettingsContextType {
    settings: Settings | null;
    paymentMethods: PaymentMethod[];
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const [s, p] = await Promise.all([
                getSettings(),
                getPaymentMethods()
            ]);
            setSettings(s);
            setPaymentMethods(p);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, paymentMethods, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
