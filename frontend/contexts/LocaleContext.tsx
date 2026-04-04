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
        brand_tagline: "An ecosystem for emerging artists to achieve economic dignity.",
        home_hero_title: "Artisan.",
        home_hero_subtitle: "A professional ecosystem built for emerging talent. Bridging the gap between universal talent and local opportunity.",
        explore_gallery: "Explore Gallery",
        find_collaborators: "Find Collaborators",
        featured_selection: "Featured Selection",
        featured_subtitle: "Hand-picked pieces from our global collective, curated monthly for technical excellence and cultural depth.",
        view_collection: "View Entire Collection",
        true_transparency: "True Transparency",
        transparency_desc: "Every price is broken down. Know exactly how much goes to materials, the artisan, and the community fund.",
        global_connection: "Global Connection",
        connection_desc: "We empower artists in underserved regions by giving them a premium global stage and immediate liquidity.",
        community_owned: "Community Owned",
        community_desc: "Artisan is more than a store. It's a cooperative ecosystem where every member shares in the collective growth.",
        read_stories: "Read Stories",
        journal_subtitle: "Stories of process, people, and place. Dive deep into the lives of the makers behind the work.",
        gallery_title: "Gallery",
        gallery_subtitle: "Emerging artists. Universal talent. A silent observation of cultural depth and technical excellence.",
        global_discovery: "Global Discovery",
        no_artworks_found: "No artworks found.",
        mission_title: "The Mission.",
        mission_subtitle: "We are a window to the world’s hidden heritage. Protecting the makers, preserving the craft, and bridging the gap between global demand and rural opportunity.",
        humanity_title: "Humanity First",
        humanity_desc: "We guarantee a living wage for every artisan. By eliminating middlemen, we ensure that creators receive the lion's share of the value they create.",
        env_title: "Environmental Stewardship",
        env_desc: "Zero-plastic packaging. Carbon-neutral shipping. We prioritize renewable materials and organic dyes.",
        culture_title: "Cultural Preservation",
        culture_desc: "We document the stories behind every craft. We don't just sell products; we safeguard the intangible heritage.",
        radical_transparency: "Radical Transparency",
        transparency_commitment: "Trust is earned, not given. That's why we show you exactly where your money goes.",
        artisan_share: "Artisan Share",
        platform_fee: "Platform Fee",
        impact_fund: "Impact Fund",
        join_movement: "Join the Movement",
        support_artisans: "Support Artisans",
        share_craft: "Share Your Craft",
        get_in_touch: "Get in Touch.",
        human_conversation: "We value human conversation above automation.",
        contact_form_title: "Direct Inquiry",
        contact_form_desc: "Expect a human response within 24-48 hours.",
        your_name: "Your Name",
        message: "Message",
        send_message: "Send Message",
        all: "All",
        search_placeholder: "Search by title or artist..."
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
        brand_tagline: "Un ecosistema para que artistas emergentes logren dignidad económica.",
        home_hero_title: "Artisan.",
        home_hero_subtitle: "Un ecosistema profesional construido para talentos emergentes. Puenteando la brecha entre el talento universal y la oportunidad local.",
        explore_gallery: "Explorar Galería",
        find_collaborators: "Buscar Colaboradores",
        featured_selection: "Selección Destacada",
        featured_subtitle: "Piezas seleccionadas a mano de nuestro colectivo global, curadas mensualmente por su excelencia técnica y profundidad cultural.",
        view_collection: "Ver Colección Completa",
        true_transparency: "Transparencia Real",
        transparency_desc: "Cada precio está desglosado. Sepa exactamente cuánto va a materiales, al artesano y al fondo comunitario.",
        global_connection: "Conexión Global",
        connection_desc: "Empoderamos a artistas en regiones desatendidas dándoles un escenario global premium y liquidez inmediata.",
        community_owned: "Propiedad de la Comunidad",
        community_desc: "Artisan es más que una tienda. Es un ecosistema cooperativo donde cada miembro comparte el crecimiento colectivo.",
        read_stories: "Leer Historias",
        journal_subtitle: "Historias de procesos, personas y lugares. Sumérgete en las vidas de los creadores detrás de la obra.",
        gallery_title: "Galería",
        gallery_subtitle: "Artistas emergentes. Talento universal. Una observación silenciosa de la profundidad cultural y la excelencia técnica.",
        global_discovery: "Descubrimiento Global",
        no_artworks_found: "No se encontraron obras.",
        mission_title: "La Misión.",
        mission_subtitle: "Somos una ventana al patrimonio oculto del mundo. Protegiendo a los creadores, preservando el oficio y acortando la brecha entre la demanda global y la oportunidad rural.",
        humanity_title: "Humanidad Primero",
        humanity_desc: "Garantizamos un salario digno para cada artesano. Al eliminar intermediarios, aseguramos que los creadores reciban la mayor parte del valor.",
        env_title: "Administración Ambiental",
        env_desc: "Embalaje sin plástico. Envío neutral en carbono. Priorizamos materiales renovables y tintes orgánicos.",
        culture_title: "Preservación Cultural",
        culture_desc: "Documentamos las historias detrás de cada oficio. No solo vendemos productos; protegemos el patrimonio intangible.",
        radical_transparency: "Transparencia Radical",
        transparency_commitment: "La confianza se gana, no se da. Por eso te mostramos exactamente a dónde va tu dinero.",
        artisan_share: "Cuota del Artesano",
        platform_fee: "Tarifa de Plataforma",
        impact_fund: "Fondo de Impacto",
        join_movement: "Únete al Movimiento",
        support_artisans: "Apoya a los Artesanos",
        share_craft: "Comparte tu Oficio",
        get_in_touch: "Ponte en Contacto.",
        human_conversation: "Valoramos la conversación humana por encima de la automatización.",
        contact_form_title: "Consulta Directa",
        contact_form_desc: "Espera una respuesta humana en 24-48 horas.",
        your_name: "Tu Nombre",
        message: "Mensaje",
        send_message: "Enviar Mensaje",
        all: "Todo",
        search_placeholder: "Buscar por título o artista..."
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
        brand_tagline: "Un écosystème pour les artistes émergents afin d'atteindre la dignité économique.",
        home_hero_title: "Artisan.",
        home_hero_subtitle: "Un écosystème professionnel conçu pour les talents émergents. Combler le fossé entre talent universel et opportunités locales.",
        explore_gallery: "Explorer la Galerie",
        find_collaborators: "Trouver des Collaborateurs",
        featured_selection: "Sélection Vedette",
        featured_subtitle: "Pièces choisies à la main par notre collectif mondial, sélectionnées chaque mois pour leur excellence technique et leur profondeur culturelle.",
        view_collection: "Voir la Collection Complète",
        true_transparency: "Vraie Transparence",
        transparency_desc: "Chaque prix est détaillé. Sachez exactement quelle part revient aux matériaux, à l'artisan et au fonds communautaire.",
        global_connection: "Connexion Mondiale",
        connection_desc: "Nous autonomisons les artistes des régions mal desservies en leur offrant une scène mondiale premium et une liquidité immédiate.",
        community_owned: "Propriété de la Communauté",
        community_desc: "Artisan est plus qu'un magasin. C'est un écosystème coopératif où chaque membre partage la croissance collective.",
        read_stories: "Lire les Histoires",
        journal_subtitle: "Histoires de processus, de personnes et de lieux. Plongez dans la vie des créateurs derrière l'œuvre.",
        gallery_title: "Galerie",
        gallery_subtitle: "Artistes émergents. Talent universel. Une observation silencieuse de la profondeur culturelle et de l'excellence technique.",
        global_discovery: "Découverte Mondiale",
        no_artworks_found: "Aucune œuvre trouvée.",
        mission_title: "La Mission.",
        mission_subtitle: "Nous sommes une fenêtre sur le patrimoine caché du monde. Protéger les créateurs, préserver le savoir-faire et combler le fossé entre la demande mondiale et les opportunités rurales.",
        humanity_title: "L'Humanité d'abord",
        humanity_desc: "Nous garantissons un salaire décent pour chaque artisan. En éliminant les intermédiaires, nous assurons que les créateurs reçoivent la plus grande part de la valeur.",
        env_title: "Gérance Environnementale",
        env_desc: "Emballage sans plastique. Expédition neutre en carbone. Nous privilégions les matériaux renouvelables et les colorants organiques.",
        culture_title: "Préservation Culturelle",
        culture_desc: "Nous documentons les histoires derrière chaque métier. Nous ne vendons pas seulement des produits ; nous protégeons le patrimoine immatériel.",
        radical_transparency: "Transparence Radicale",
        transparency_commitment: "La confiance se gagne, elle ne se donne pas. C'est pourquoi nous vous montrons exactement où va votre argent.",
        artisan_share: "Part de l'Artisan",
        platform_fee: "Frais de Plateforme",
        impact_fund: "Fonds d'Impact",
        join_movement: "Rejoignez le Mouvement",
        support_artisans: "Soutenir les Artisans",
        share_craft: "Partagez votre Savoir-faire",
        get_in_touch: "Contactez-nous.",
        human_conversation: "Nous privilégions la conversation humaine plutôt que l'automatisation.",
        contact_form_title: "Demande Directe",
        contact_form_desc: "Attendez-vous à une réponse humaine sous 24 à 48 heures.",
        your_name: "Votre Nom",
        message: "Message",
        send_message: "Envoyer le Message",
        all: "Tout",
        search_placeholder: "Rechercher par titre ou artiste..."
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
        brand_tagline: "Ein Ökosystem für aufstrebende Künstler zur wirtschaftlichen Würde.",
        home_hero_title: "Artisan.",
        home_hero_subtitle: "Ein professionelles Ökosystem für aufstrebende Talente. Überbrückung der Kluft zwischen universellem Talent und lokaler Chance.",
        explore_gallery: "Galerie Entdecken",
        find_collaborators: "Partner Finden",
        featured_selection: "Ausgewählte Stücke",
        featured_subtitle: "Handverlesene Stücke aus unserem globalen Kollektiv, monatlich kuratiert für technische Exzellenz und kulturelle Tiefe.",
        view_collection: "Gesamte Kollektion Anzeigen",
        true_transparency: "Echte Transparenz",
        transparency_desc: "Jeder Preis wird aufgeschlüsselt. Wissen Sie genau, wie viel für Materialien, den Künstler und den Gemeinschaftsfonds aufgewendet wird.",
        global_connection: "Globale Verbindung",
        connection_desc: "Wir stärken Künstler in unterversorgten Regionen, indem wir ihnen eine erstklassige globale Bühne und sofortige Liquidität bieten.",
        community_owned: "In Gemeinschaftsbesitz",
        community_desc: "Artisan ist mehr als ein Geschäft. Es ist ein kooperatives Ökosystem, in dem jedes Mitglied am gemeinsamen Wachstum teilhat.",
        read_stories: "Geschichten Lesen",
        journal_subtitle: "Geschichten über Prozesse, Menschen und Orte. Tauchen Sie tief in das Leben der Macher hinter der Arbeit ein.",
        gallery_title: "Galerie",
        gallery_subtitle: "Aufstrebende Künstler. Universelles Talent. Eine stille Beobachtung kultureller Tiefe und technischer Exzellenz.",
        global_discovery: "Globale Entdeckung",
        no_artworks_found: "Keine Kunstwerke gefunden.",
        mission_title: "Die Mission.",
        mission_subtitle: "Wir sind ein Fenster zum verborgenen Erbe der Welt. Wir schützen die Erzeuger, bewahren das Handwerk und schlagen die Brücke zwischen globaler Nachfrage und ländlichen Chancen.",
        humanity_title: "Menschlichkeit Zuerst",
        humanity_desc: "Wir garantieren jedem Handwerker einen existenzsichernden Lohn. Durch den Verzicht auf Zwischenhändler stellen wir sicher, dass die Schöpfer den Löwenanteil erhalten.",
        env_title: "Verantwortung für die Umwelt",
        env_desc: "Plastikfreie Verpackung. Klimaneutraler Versand. Wir bevorzugen erneuerbare Materialien und organische Farbstoffe.",
        culture_title: "Kulturelle Bewahrung",
        culture_desc: "Wir dokumentieren die Geschichten hinter jedem Handwerk. Wir verkaufen nicht nur Produkte; wir schützen das immaterielle Erbe.",
        radical_transparency: "Radikale Transparenz",
        transparency_commitment: "Vertrauen wird verdient, nicht gegeben. Deshalb zeigen wir Ihnen genau, wohin Ihr Geld fließt.",
        artisan_share: "Anteil des Künstlers",
        platform_fee: "Plattformgebühr",
        impact_fund: "Impact-Fonds",
        join_movement: "Tritt der Bewegung bei",
        support_artisans: "Künstler Unterstützen",
        share_craft: "Teile dein Handwerk",
        get_in_touch: "Kontakt Aufnehmen.",
        human_conversation: "Wir schätzen das menschliche Gespräch mehr als die Automatisierung.",
        contact_form_title: "Direkte Anfrage",
        contact_form_desc: "Erwarten Sie eine menschliche Antwort innerhalb von 24-48 Stunden.",
        your_name: "Dein Name",
        message: "Nachricht",
        send_message: "Nachricht Senden",
        all: "Alle",
        search_placeholder: "Suche nach Titel oder Künstler..."
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
        // Silent update to operational trace for state transitions if needed, 
        // but we avoid console.log noise in production code.
    }, [language, currency]);

    const updateLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("artisan_lang", lang);
        logger.info('PROFILE_UPDATE_SUCCESS', { language: lang, source: 'frontend' });
    };

    const updateCurrency = (cur: Currency) => {
        setCurrency(cur);
        localStorage.setItem("artisan_cur", cur);
        logger.info('PROFILE_UPDATE_SUCCESS', { currency: cur, source: 'frontend' });
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
