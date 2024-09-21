import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/useAuth';
import { useNavigate } from 'react-router-dom';
import classes from '../DeckDisplay.module.css';
import { CommanderImageResponse } from '../MainPage';

export interface DeckCard {
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
    color_identity?: string[];
    keywords?: string[];
    rarity?: string;
};

export function shuffleDeck(deck: DeckCard[]): DeckCard[] {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
}

// Draw function
export function drawCard(deck: DeckCard[]): [DeckCard | null, DeckCard[]] {
    if (deck.length === 0) return [null, deck];
    const [card, ...remainingDeck] = deck;
    return [card, remainingDeck];
}

export function DeckPage() {
    let navigate = useNavigate();

    const { user } = useAuth();
    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [groupedDeck, setGroupedDeck] = useState<Record<string, DeckCard[]>>({});
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommanderImageURI = async () => {
            try {
                const response = await axios.get<CommanderImageResponse>(`/commanderImg/${user?.name}`);
                console.log('API Response:', response);
                console.log(user?.name);
                console.log(response.data.commanderImageURI);

                if (response.data.commanderImageURI) {
                    setCommanderImageURI(response.data.commanderImageURI);
                }
            } catch (error) {
                console.error('Error fetching commander image URI:', error);
            }
        };

        fetchCommanderImageURI();
    }, [user?.name]);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get<{ deck: DeckCard[] }>(`/deck/${user?.name}`);
                const deckData = response.data.deck;
                
                // Grouping cards by type_line
                const grouped = deckData.reduce((acc: Record<string, DeckCard[]>, card) => {
                    const type = card.type_line;
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push(card);
                    return acc;
                }, {});

                setDeck(deckData);
                setGroupedDeck(grouped);
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
            <button  className="xbuttons" onClick={backToMain}>Back</button>
            <h1 style={{ fontSize: "25px" }}>Your Deck</h1>
            {commanderImageURI === "" ? (
                <></>
            ) : (
                <div className={classes["commander-img"]}>
                    {commanderImageURI && (
                            <img 
                                src={commanderImageURI} 
                                alt="Commander" 
                                style={{ maxWidth: '200px' }} 
                            />
                        )}
                </div>
            )}
            {deck.length === 0 ? (
                <p>No deck data available</p>
            ) : (
                Object.keys(groupedDeck).map((type, index) => (
                    <div key={index} className={classes["type-section"]}>
                        <h2 style={{ textDecoration: "underline", fontSize: "18px" }}>{type}</h2>
                        <div className={classes["deck-grid"]}>
                            {groupedDeck[type].map((card, cardIndex) => (
                                <div key={cardIndex} className={classes["card-item"]}>
                                    <p className={classes["card-info"]}>{card.name} (x{card.quantity})</p>
                                    {card.image_uris?.small && (
                                        <img src={card.image_uris.small} alt={card.name} style={{ maxWidth: '150px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
