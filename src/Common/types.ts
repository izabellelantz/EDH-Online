export interface BoardProps {
    players: number;
}

export interface PlayerInfoProps {
    lifeCount: number;
    playerColor: string;
    deckCount: number;
    position: string;
}

export interface CardDisp {
    name: string;
    image?: string;
}

export interface Card {
    name: string;
    image?: string;
    type: string;
    manaCost: string;
    colorIdentity: string;
    abilities: string;
    legal: boolean;
}

export interface Creature extends Card {
    power: number;
    toughness: number;
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