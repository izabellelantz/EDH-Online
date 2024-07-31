import { Deck, PlayerInfoProps } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { BoardCard } from "../Common/types"; 

interface Counters {
    [cardName: string]: string[];
}

export function PlayerInfo({ lifeCount, playerColor, deckCount, position, currentHandSize }: PlayerInfoProps) {
    const currentMaxHandSize = 7;

    const isTopRow = position === "top";
    const isActive = position === "bottom";

    const { user } = useAuth();

    const [lives, setLives] = useState(lifeCount);

    const [exiledCards, setExiledCards] = useState<DeckCard[]>([]);
    const [graveyardCards, setGraveyardCards] = useState<DeckCard[]>([]);

    const [counters, setCounters] = useState<Counters>({});

    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<DeckCard[]>([]);
    const [numCards, setNumCards] = useState(deckCount);
    const [boardCards, setBoardCards] = useState<BoardCard[]>([]);
    
    const [handSize, setHandSize] = useState(currentHandSize);
    const [maxHandSize, setMaxHandSize] = useState(currentMaxHandSize);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get<{ deck: DeckCard[] }>(`/deck/${user?.name}`);
                const shuffled = shuffleDeck(response.data.deck);
                setDeck(shuffled);
            } catch (error) {
                console.error('Error fetching deck:', error);
            }
        };

        fetchDeck();
    }, [user?.name]);

    const handleDrawCard = () => {
        if (!isActive) return; // Prevent interaction if not active
    
        const [card, remainingDeck] = drawCard(deck);
        console.log('Deck before draw:', deck);
        console.log('Drawn card:', card);
        console.log('Remaining deck:', remainingDeck);
    
        if (card && handSize < maxHandSize) {
            setDrawnCards([...drawnCards, card]); // Add drawn card to hand
            setDeck(remainingDeck);
            setNumCards(numCards - 1); // Update deck count
            setHandSize(handSize + 1);
        }
    };

    const handleCardClick = (card: DeckCard) => {
        if (!isActive) return; // Prevent interaction if not active
    
        if (card.type_line.toLowerCase().includes("instant")) {
            // Add the instant card to the board in a focused state and send it to graveyard
            setBoardCards([...boardCards, { card, tapped: false, focused: true }]);
            
            setTimeout(() => {
                setGraveyardCards((prev) => [...prev, card]);
                setBoardCards((prev) => prev.filter((bc) => bc.card !== card));
            }, 2500);
        } else {
            // Handle other card types normally
            setBoardCards([...boardCards, { card, tapped: false, focused: false }]);
        }
        
        setDrawnCards(drawnCards.filter(c => c !== card)); // Remove card from drawn cards
        setHandSize(handSize - 1);
    
        axios.post('/playCard', { card })
            .then(response => {
                // Handle successful card play
                console.log('Card played successfully:', response.data);
            })
            .catch(error => {
                console.error('Error playing card:', error);
            });
    };

    const handleBoardCardClick = (card: DeckCard) => {
        if (!isActive) return; // Prevent interaction if not active

        // Toggle the tapped state
        setBoardCards(boardCards.map(bc => 
          bc.card === card ? { ...bc, tapped: !bc.tapped } : bc
        ));
    };

    const [visibleButtons, setVisibleButtons] = useState<boolean[]>(new Array(boardCards.length).fill(false));

    useEffect(() => {
        setVisibleButtons(new Array(boardCards.length).fill(false));
    }, [boardCards]);

    
    const toggleButtons = (index: number) => {
        setVisibleButtons(prev => {
            const newVisibleButtons = [...prev];
            newVisibleButtons[index] = !newVisibleButtons[index];
            return newVisibleButtons;
        });
    };

    const handleLifeUp = () => {
        setLives(lives + 1);
    };

    const handleLifeDown = () => {
        setLives(lives - 1);
    };

    const focusCard = (card: DeckCard | null) => {
        if (!isActive) return;
    
        setBoardCards(boardCards.map(bc =>
            bc.card === card ? { ...bc, focused: true } : { ...bc, focused: false }
        ));
    };
    
    // Kill the card (move to graveyard)
    const handleKillCard = (card: DeckCard) => {
        setGraveyardCards([...graveyardCards, card]);
        setBoardCards(boardCards.filter(bc => bc.card !== card));
    };
  

    const handleExileCard = (card: DeckCard) => {
        setExiledCards([...exiledCards, card]);
        setBoardCards(boardCards.filter(bc => bc.card !== card));
      };

      const handleAddCounter = (card: DeckCard, counter: string) => {
        setCounters((prevCounters) => {
            const currentCounters = prevCounters[card.name] || [];
            return {
                ...prevCounters,
                [card.name]: [...currentCounters, counter]
            };
        });
    };
    
    const handleRemoveCounter = (card: DeckCard, counter: string) => {
        // AKA Adding a negative counter
        const negativeCounter = counter.replace("+", "-");
    
        setCounters((prevCounters) => {
            const currentCounters = prevCounters[card.name] || [];
            return {
                ...prevCounters,
                [card.name]: [...currentCounters, negativeCounter]
            };
        });
    };
    
    

    return (
        <div className={`${classes["player-info"]} ${isTopRow ? classes["top-row"] : classes["bottom-row"]}`}>
            <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                <span>
                    <button className={classes["change-life"]} onClick={handleLifeUp}>+</button>
                    {lives}
                    <button className={classes["change-life"]} onClick={handleLifeDown}>-</button>
                </span>
            </div>

            <div
                className={classes["deck"]}
                onClick={handleDrawCard}
                style={{ cursor: isActive ? 'pointer' : 'default' }}
            >
                {numCards}
            </div>

            <div className={classes["drawn-cards-container"]}>
                {isActive && drawnCards.length > 0 && drawnCards.map((card, index) => (
                    <img 
                        key={index} 
                        src={card.image_uris.small} 
                        alt={card.name} 
                        className={classes["drawn-card"]}
                        onClick={() => handleCardClick(card)}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
            </div>

            <div className={classes["board-container"]}>
                {boardCards.map((bc, index) => {
                    const isCreature = bc.card.type_line.toLowerCase().includes("creature");
                    const totalPower = calculateTotalPower(bc.card, counters[bc.card.name] || []);
                    const totalToughness = calculateTotalToughness(bc.card, counters[bc.card.name] || []);

                    return (
                    <div key={index} className={classes["card-wrapper"]}>
                        <img
                            src={bc.card.image_uris.small}
                            alt={bc.card.name}
                            className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                            onClick={() => handleBoardCardClick(bc.card)}
                            onPointerEnter={() => focusCard(bc.card)}
                            onPointerLeave={() => focusCard(null)} // Remove focus on mouse leave
                            style={{ cursor: 'pointer' }}
                        />
                        
                        {/* Display total power/toughness IF it's a creature */}
                        {isCreature && (
                            <div className={classes["power-toughness-display"]}>
                                <span className={classes["power-toughness"]}>{totalPower}/{totalToughness}</span>
                            </div>
                        )}

                        <button
                            className={classes["toggle-buttons-button"]}
                            onClick={() => toggleButtons(index)}
                        >
                            ⚙️
                        </button>

                        {visibleButtons[index] && (
                            <div className={classes["card-buttons"]}>
                                <button onClick={() => handleAddCounter(bc.card, "+1/+1")}>+1/+1</button>
                                <button onClick={() => handleRemoveCounter(bc.card, "-1/-1")}>-1/-1</button>
                                <button onClick={() => handleAddCounter(bc.card, "+1/+0")}>+1/+0</button>
                                <button onClick={() => handleRemoveCounter(bc.card, "-1/-0")}>-1/-0</button>
                                <button onClick={() => handleKillCard(bc.card)}>Graveyard</button>
                                <button onClick={() => handleExileCard(bc.card)}>Exile</button>
                                <button onClick={() => toggleButtons(index)}>Done</button>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            
            {graveyardCards.length > 0 || exiledCards.length > 0 ? (
                <div className={classes["side-areas"]}>
                    {graveyardCards.length > 0 && (
                        <div className={classes["graveyard"]}>
                            <h3>Graveyard</h3>
                            {graveyardCards.map((card, index) => (
                                <img
                                    key={index}
                                    src={card.image_uris.small}
                                    alt={card.name}
                                    className={classes["graveyard-card"]}
                                />
                            ))}
                        </div>
                    )}
                    {exiledCards.length > 0 && (
                        <div className={classes["exile"]}>
                            <h3>Exile</h3>
                            {exiledCards.map((card, index) => (
                                <img
                                    key={index}
                                    src={card.image_uris.small}
                                    alt={card.name}
                                    className={classes["exile-card"]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
    </div>
    );
}

const calculateTotalPower = (card: DeckCard, counters: string[]): number => {
    const basePower = parseInt(card.power || '0', 10);
    const powerAdjustment = counters.reduce((total, counter) => {
        const [powerPart] = counter.split("/");
        const powerValue = parseInt(powerPart, 10);
        return total + (isNaN(powerValue) ? 0 : powerValue);
    }, 0);
    return basePower + powerAdjustment;
};


const calculateTotalToughness = (card: DeckCard, counters: string[]): number => {
    const baseToughness = parseInt(card.toughness || '0', 10);
    const toughnessAdjustment = counters.reduce((total, counter) => {
        const [, toughnessPart] = counter.split("/");
        const toughnessValue = parseInt(toughnessPart, 10);
        return total + (isNaN(toughnessValue) ? 0 : toughnessValue);
    }, 0);
    return baseToughness + toughnessAdjustment;
};
