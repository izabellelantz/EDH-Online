import { DeckCard } from "../Deck/Deck";

export interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export interface BoardProps {
    players: string[];
    roomCode?: string;
}

export interface PlayerInfoProps {
    lifeCount: number;
    playerColor: string;
    deckCount: number;
    position: string;
    currentHandSize: number;
    roomCode?: string;
    isActive: boolean;
}

export interface BoardCard {
    card: DeckCard;
    tapped: boolean;
    focused: boolean;
}

export interface Card {
    name: string;
    image_uris: {
        small?: string;
        normal?: string;
    };
    mana_cost: string;
    type_line: string;
    power?: string;
    toughness?: string;
    color_identity: string[];
    keywords?: string[];
    rarity: string;
}

export interface Deck {
    cards: Card[];
    commander?: Card;
    creatures?: Card[];
    lands?: Card[];
    artifacts?: Card[];
    instants?: Card[];
    enchantments?: Card[];
    sorceries?: Card[];
    planeswalkers?: Card[];
    tokens?: Card[];
}
