import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/useAuth';
import { useNavigate } from 'react-router-dom';

interface DeckCard {
    name: string;
    quantity: number;
    image_uris: {
        small?: string;
        normal?: string;
        large?: string;
    };
    mana_cost: string;
    type_line: string;
    power?: string;
    toughness?: string;
    color_identity: string[];
    keywords: string[];
    rarity: string;
};

export function shuffleDeck() {
    const { user } = useAuth();
    const [shuffledDeck, setShuffledDeck] = useState<DeckCard[]>([]);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get<{ deck: DeckCard[] }>(`/deck/${user?.name}`);
                setShuffledDeck(response.data.deck);
            } catch (error) {
                console.error('Error fetching deck:', error);
            }
        };

        fetchDeck();
    }, [user?.name]);

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
};

export function drawCard(deck: DeckCard[]): [DeckCard | null, DeckCard[]] {
    if (deck.length === 0) return [null, deck];

    const [card, ...remainingDeck] = deck;
    return [card, remainingDeck];
};

export function DeckPage() {
    let navigate = useNavigate();

    const { user } = useAuth();
    const [deck, setDeck] = useState<DeckCard[]>([]);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get<{ deck: DeckCard[] }>(`/deck/${user?.name}`);
                setDeck(response.data.deck);
            } catch (error) {
                console.error('Error fetching deck:', error);
            }
        };

        fetchDeck();
    }, [user?.name]);

    const backToMain = () => {
        navigate("/Home");
    }

    return (
        <div>
            <button onClick={backToMain}>Back</button>
            <h1>Your Deck</h1>
            {deck.length === 0 ? (
                <p>No deck data available</p>
            ) : (
                <ul>
                    {deck.map((card, index) => (
                        <li key={index}>
                            <h2>{card.name} (x{card.quantity})</h2>
                            {card.image_uris?.small && (
                                <img src={card.image_uris.small} alt={card.name} style={{ maxWidth: '150px' }} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
