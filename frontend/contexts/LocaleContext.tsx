"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logger } from "@/backend/lib/logger";

type Language = "en" | "fr" | "es" | "de";
type Currency = "EUR" | "USD" | "GBP" | "JPY";

interface LocaleContextType {
    language: Language;
    currency: Currency;
    setLanguage: (lang: Language) => void;
    setCurrency: (cur: Currency) => void;
    convertPrice: (amount: number, fromCurrency?: string) => { amount: number; formatted: string };
    t: (key: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
    en: {
        gallery: "Gallery",
        workshops: "Workshops",
        collaborate: "Collaborate",
        journal: "Journal",
        mission: "Mission",
        available: "Available",
        collected: "Collected",
        direct_to_artist: "Direct-to-Artist Platform",
        acquisition: "Acquisition",
        profile: "Profile",
        secure_acquisition: "Secure Acquisition",
        price_architecture: "Price Architecture",
        artist_direct: "Artist Direct",
        material_sourcing: "Material Sourcing",
        community_fund: "Community Fund",
        platform_ops: "Platform Ops",
        collection: "Collection",
        studio_journal: "Studio Journal",
        my_events: "My Events",
        activity_history: "Activity History",
        available_for_sale: "Available for Sale",
        add_piece: "Add Piece",
        private_collection: "Private Collection",
        listed: "Listed!",
        list_item: "List Item",
        cancel: "Cancel",
        no_artworks: "No artworks collected yet.",
        start_collecting: "Start Collecting",
        explore: "Explore",
        support: "Support",
        legal: "Legal",
        brand_tagline: "An ecosystem for emerging artists to achieve economic dignity."
    },
    es: {
        gallery: "Galería",
        workshops: "Talleres",
        collaborate: "Colaborar",
        journal: "Diario",
        mission: "Misión",
        available: "Disponible",
        collected: "Coleccionado",
        direct_to_artist: "Plataforma Directa al Artista",
        acquisition: "Adquisición",
        profile: "Perfil",
        secure_acquisition: "Adquisición Segura",
        price_architecture: "Arquitectura de Precios",
        artist_direct: "Directo al Artista",
        material_sourcing: "Suministro de Materiales",
        community_fund: "Fondo Comunitario",
        platform_ops: "Ops de la Plataforma",
        collection: "Colección",
        studio_journal: "Diario del Estudio",
        my_events: "Mis Eventos",
        activity_history: "Historial de Actividad",
        available_for_sale: "Disponible para la Venta",
        add_piece: "Añadir Pieza",
        private_collection: "Colección Privada",
        listed: "¡Publicado!",
        list_item: "Publicar Artículo",
        cancel: "Cancelar",
        no_artworks: "Aún no hay obras coleccionadas.",
        start_collecting: "Empezar a Coleccionar",
        explore: "Explorar",
        support: "Soporte",
        legal: "Legal",
        brand_tagline: "Un ecosistema para que artistas emergentes logren dignidad económica."
    },
    fr: {
        gallery: "Galerie",
        workshops: "Ateliers",
        collaborate: "Collaborer",
        journal: "Journal",
        mission: "Mission",
        available: "Disponible",
        collected: "Collectionné",
        direct_to_artist: "Plateforme Directe à l'Artiste",
        acquisition: "Acquisition",
        profile: "Profil",
        secure_acquisition: "Acquisition Sécurisée",
        price_architecture: "Architecture des Prix",
        artist_direct: "Direct à l'Artiste",
        material_sourcing: "Sourcing des Matériaux",
        community_fund: "Fonds Communautaire",
        platform_ops: "Ops de Plateforme",
        collection: "Collection",
        studio_journal: "Journal d'Atelier",
        my_events: "Mes Événements",
        activity_history: "Historique d'Activité",
        available_for_sale: "Disponible à la Vente",
        add_piece: "Ajouter une Pièce",
        private_collection: "Collection Privée",
        listed: "Publié!",
        list_item: "Publier l'Article",
        cancel: "Annuler",
        no_artworks: "Aucune œuvre collectée pour l'instant.",
        start_collecting: "Commencer à Collecter",
        explore: "Explorer",
        support: "Assistance",
        legal: "Juridique",
        brand_tagline: "Un écosystème pour les artistes émergents afin d'atteindre la dignité économique."
    },
    de: {
        gallery: "Galerie",
        workshops: "Workshops",
        collaborate: "Kollaborieren",
        journal: "Journal",
        mission: "Mission",
        available: "Verfügbar",
        collected: "Gesammelt",
        direct_to_artist: "Exklusiv vom Künstler",
        acquisition: "Erwerb",
        profile: "Profil",
        secure_acquisition: "Sicherer Erwerb",
        price_architecture: "Preis-Architektur",
        artist_direct: "Künstler Direkt",
        material_sourcing: "Materialbeschaffung",
        community_fund: "Gemeinschaftsfonds",
        platform_ops: "Plattformbetrieb",
        collection: "Kollektion",
        studio_journal: "Atelier-Journal",
        my_events: "Meine Events",
        activity_history: "Aktivitätsverlauf",
        available_for_sale: "Verfügbar zum Verkauf",
        add_piece: "Stück Hinzufügen",
        private_collection: "Privatsammlung",
        listed: "Gelistet!",
        list_item: "Artikel Listen",
        cancel: "Abbrechen",
        no_artworks: "Noch keine Kunstwerke gesammelt.",
        start_collecting: "Sammeln Starten",
        explore: "Entdecken",
        support: "Support",
        legal: "Rechtliches",
        brand_tagline: "Ein Ökosystem für aufstrebende Künstler zur wirtschaftlichen Würde."
    }
};

const CONVERSION_RATES: Record<Currency, number> = {
    EUR: 1,      // Base
    USD: 1.08,
    GBP: 0.84,
    JPY: 164.50
};

const SYMBOLS: Record<Currency, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥"
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");
    const [currency, setCurrency] = useState<Currency>("EUR");

    // Load from local storage if available (respecting user preference)
    useEffect(() => {
        const savedLang = localStorage.getItem("artisan_lang") as Language;
        const savedCur = localStorage.getItem("artisan_cur") as Currency;
        if (savedLang) setLanguage(savedLang);
        if (savedCur) setCurrency(savedCur);
    }, []);

    useEffect(() => {
        console.log(`[LocaleContext] State Updated: Lang=${language}, Cur=${currency}`);
    }, [language, currency]);

    const updateLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("artisan_lang", lang);
        logger.info("Language preference updated", { language: lang });
    };

    const updateCurrency = (cur: Currency) => {
        setCurrency(cur);
        localStorage.setItem("artisan_cur", cur);
        logger.info("Currency preference updated", { currency: cur });
    };

    const convertPrice = (amount: number, fromCurrency: string = "EUR") => {
        // Simple mock conversion (Base is always EUR for now)
        // If from is not EUR, we'd first normalize to EUR, then convert to target
        const amountInEur = fromCurrency === "EUR" ? amount : amount / (CONVERSION_RATES[fromCurrency as Currency] || 1);
        const targetAmount = amountInEur * CONVERSION_RATES[currency];
        
        return {
            amount: targetAmount,
            formatted: `${SYMBOLS[currency]}${targetAmount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })} ${currency}`
        };
    };

    const t = (key: string): string => {
        return DICTIONARY[language][key] || key;
    };

    return (
        <LocaleContext.Provider value={{ 
            language, 
            currency, 
            setLanguage: updateLanguage, 
            setCurrency: updateCurrency,
            convertPrice,
            t
        }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error("useLocale must be used within a LocaleProvider");
    }
    return context;
}
