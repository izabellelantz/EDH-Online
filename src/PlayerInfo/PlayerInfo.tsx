import { PlayerInfoProps, BoardCard } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { CommanderImageResponse } from "../MainPage";
import { socket } from "../Socket/Socket";

interface Counters {
    [cardName: string]: string[];
}


export function PlayerInfo({ lifeCount, playerColor, deckCount, position, currentHandSize, roomCode, isActive }: PlayerInfoProps) {
    const currentMaxHandSize = 7;
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);

    const { user } = useAuth();

    const [lives, setLives] = useState(lifeCount);

    const [exiledCards, setExiledCards] = useState<DeckCard[]>([]);
    const [graveyardCards, setGraveyardCards] = useState<DeckCard[]>([]);

    const [counters, setCounters] = useState<Counters>({});

    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<DeckCard[]>([]);
    const [numCards, setNumCards] = useState(deckCount);
    const [boardCards, setBoardCards] = useState<BoardCard[]>([]);

    const [opponentLives, setOpponentLives] = useState(lifeCount);
    const [opponentBoardCards, setOpponentBoardCards] = useState<BoardCard[]>([]);
    const [opponentGyCards, setOpponentGyCards] = useState<BoardCard[]>([]);
    const [opponentExileCards, setOpponentExileCards] = useState<BoardCard[]>([]);
    
    const [handSize, setHandSize] = useState(currentHandSize);

    const steps = ["Upkeep", "Main", "Combat", "Main 2.0", "End"];
    const [currentStep, setCurrentStep] = useState(0);
    const [step, setStep] = useState(steps[0]);

    const [attackers, setAttackers] = useState<BoardCard[]>([]);
    const [blockers, setBlockers] = useState<BoardCard[]>([]);
    const [totalDamage, setTotalDamage] = useState<number>(0);

    console.log(isActive);

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

    const [combatMode, setCombatMode] = useState(false);
    const [attackSubPhase, setAttackSubPhase] = useState(false);
    const [blockSubPhase, setBlockSubPhase] = useState(false);
    const [showAttackers, setShowAttackers] = useState(false);

    const handleNextStep = () => {
        setCurrentStep(prevStep => {
            const nextStep = prevStep + 1 >= steps.length ? 0 : prevStep + 1;
            setStep(steps[nextStep]);

            if (step === "Combat") {
                setCombatMode(true);
                setAttackSubPhase(true);
                combatPhase();
            } else {
                setCombatMode(false);
            }

            return nextStep;
        });
    };

    const combatPhase = () => {
        setTotalDamage(0);
        setAttackers([]);
        setBlockers([]);
        setShowAttackers(false); // Attackers are hidden initially
    };    

    const handleDrawCard = () => {
        if (!isActive) return; // Prevent interaction if not active
    
        const [card, remainingDeck] = drawCard(deck);
        console.log('Deck before draw:', deck);
        console.log('Drawn card:', card);
        console.log('Remaining deck:', remainingDeck);
    
        if (card) {
            setDrawnCards([...drawnCards, card]); // Add drawn card to hand
            setDeck(remainingDeck);
            setNumCards(numCards - 1); // Update deck count
            setHandSize(handSize + 1);
        }
    };

    const handleCardClick = (card: DeckCard, roomCode: string) => {
        if (!isActive || !roomCode) return; // Prevent interaction if not active or roomCode is missing
        console.log(roomCode);


        socket.emit('requestPlayCard', {
            card,
            player: user?.name,
            roomCode
        });
        
        // Handle instants and sorceries
        if (card.type_line.toLowerCase().includes("instant") || card.type_line.toLowerCase().includes("sorcery")) {
            setBoardCards([...boardCards, { card, tapped: false, focused: true }]);
            
            // Emit the event to play the card for other players
            socket.emit('playCard', {
                card,
                action: 'play',
                moveTo: 'board',
                player: user?.name, 
                roomCode
            });
    
            setTimeout(() => {
                setGraveyardCards((prev) => [...prev, card]);
                setBoardCards((prev) => prev.filter((bc) => bc.card !== card));
    
                // Emit the event to move the card to the graveyard for other players
                socket.emit('moveCard', {
                    card,
                    action: 'move',
                    moveTo: 'graveyard',
                    player: user?.name,
                    roomCode
                });
    
            }, 2500);
        } else {
            // Handle other card types normally
            setBoardCards([...boardCards, { card, tapped: false, focused: false }]);
    
            // Emit the event to play the card for other players
            socket.emit('playCard', {
                card,
                action: 'play',
                moveTo: 'board',
                player: user?.name,
                roomCode
            });
        }
    
        setDrawnCards(drawnCards.filter(c => c !== card)); // Remove card from drawn cards
        setHandSize(handSize - 1);
    };
    

    useEffect(() => {

        // Listen for card actions from other players
        socket.on('playCard', (data) => {
            const { card, moveTo, player } = data;
            console.log("Player:", player, "User:", user?.name);
        
            if (player !== user?.name && moveTo === 'board') {
                console.log("Adding card to opponent's board:", card.name);
                setOpponentBoardCards(prev => [...prev, { card, tapped: false, focused: false }]);
            }
            console.log("My board cards:", boardCards);
            console.log("Opponent's board cards:", opponentBoardCards);

        });
        
    
        socket.on('moveCard', (data) => {
            const { card, moveTo, player } = data;
    
            if (player !== user?.name && moveTo === 'graveyard') {
                setOpponentGyCards(prev => [...prev, { card, tapped: false, focused: false}]);
                setOpponentBoardCards(prev => prev.filter((bc) => bc.card !== card));
            }
        });
    
        return () => {
            socket.off('pendingPlayCard');
            socket.off('playCard');
            socket.off('denyPlayCard');
        };
    }, [user?.name]);    

    const handleDiscardCard = (card: DeckCard) => {
        // Remove the card from the hand
        setDrawnCards(drawnCards.filter(c => c !== card));
      
        // Add the card to the graveyard
        setGraveyardCards([...graveyardCards, card]);
      
        // Update the hand size
        setHandSize(handSize - 1);
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

    const handleOppLifeUp = () => {
        setOpponentLives(opponentLives + 1);
    };

    const handleOppLifeDown = () => {
        setOpponentLives(opponentLives - 1);
    };


    const focusCard = (card: DeckCard | null) => {    
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

    return (
        <>
        {isActive && 
        <div className={classes["player-side"]}>
            {commanderImageURI && isActive && (
                <img 
                    src={commanderImageURI}
                    className={classes["commander-card"]}
                    style={{ marginBottom:"40px" }}
                /> 
            )}

            <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                <span>
                    <button className={classes["change-life"]} onClick={handleLifeUp}>+</button>
                    {lives}
                    <button className={classes["change-life"]} onClick={handleLifeDown}>-</button>
                </span>
            </div>

            <div className={classes["next-step"]}>
                <button onClick={handleNextStep}>Move to {step}</button>
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
                    <div key={index} className={classes["hand-card-wrapper"]}>
                        {roomCode && (
                            <img 
                                src={card.image_uris.small || 'default-image-url'} 
                                alt={card.name} 
                                className={classes["drawn-card"]}
                                onClick={() => handleCardClick(card, roomCode)} 
                                style={{ cursor: 'pointer' }}
                            />
                        )}

                        <button 
                            className={classes["hand-card-button"]}
                            onClick={() => handleDiscardCard(card)}
                        >
                            Discard
                        </button>
                    </div>
                ))}
            </div>



            <div className={classes["board-container"]}>
                {/* Container for non-land cards */}
                <div className={classes["non-land-cards"]}>
                    {boardCards
                        .filter(bc => !bc.card.type_line.toLowerCase().includes("land"))
                        .map((bc, index) => (
                            <div key={index} className={classes["card-wrapper"]}>
                                <img
                                    src={bc.card.image_uris.small}
                                    alt={bc.card.name}
                                    className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                                    onClick={() => handleBoardCardClick(bc.card)}
                                    onPointerEnter={() => focusCard(bc.card)}
                                    onPointerLeave={() => focusCard(null)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Display total power/toughness */}
                                {bc.card.type_line.toLowerCase().includes("creature") && (
                                    <div className={classes["power-toughness-display"]}>
                                        <span className={classes["power-toughness"]}>{calculateTotalPower(bc.card, counters[bc.card.name] || [])}/{calculateTotalToughness(bc.card, counters[bc.card.name] || [])}</span>
                                    </div>
                                )}
                                {!bc.card.type_line.toLowerCase().includes("instant") && !bc.card.type_line.toLowerCase().includes("sorcery") && (
                                    <button
                                        className={classes["toggle-buttons-button"]}
                                        onClick={() => toggleButtons(index)}
                                    >
                                        ⚙️
                                    </button>
                                )}
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
                        ))}
                </div>

                {/* Container for land cards */}
                <div className={classes["land-cards"]}>
                    {boardCards
                        .filter(bc => bc.card.type_line.toLowerCase().includes("land"))
                        .map((bc, index) => (
                            <div key={index} className={classes["card-wrapper"]}>
                                <img
                                    src={bc.card.image_uris.small}
                                    alt={bc.card.name}
                                    className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                                    onClick={() => handleBoardCardClick(bc.card)}
                                    onPointerEnter={() => focusCard(bc.card)}
                                    onPointerLeave={() => focusCard(null)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Display total power/toughness if needed */}
                                {bc.card.type_line.toLowerCase().includes("creature") && (
                                    <div className={classes["power-toughness-display"]}>
                                        <span className={classes["power-toughness"]}>{calculateTotalPower(bc.card, counters[bc.card.name] || [])}/{calculateTotalToughness(bc.card, counters[bc.card.name] || [])}</span>
                                    </div>
                                )}
                                {!bc.card.type_line.toLowerCase().includes("instant") && !bc.card.type_line.toLowerCase().includes("sorcery") && (
                                    <button
                                        className={classes["toggle-buttons-button"]}
                                        onClick={() => toggleButtons(index)}
                                    >
                                        ⚙️
                                    </button>
                                )}
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
                        ))}
                </div>
            </div>
        </div>
}

        <div className={classes["opponent-side"]}>
            

            <div className={classes["op-non-land-cards"]}>
                <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                    <span>
                        <button className={classes["change-life"]} onClick={handleOppLifeUp}>+</button>
                        {opponentLives}
                        <button className={classes["change-life"]} onClick={handleOppLifeDown}>-</button>
                    </span>
                </div>
                {opponentBoardCards
                    .map((bc, index) => (
                        <div key={index} className={classes["card-wrapper"]}>
                            <img
                                src={bc.card.image_uris.small}
                                alt={bc.card.name}
                                className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                            />
                            {/* Power/Toughness if needed */}
                            {bc.card.type_line.toLowerCase().includes("creature") && (
                                <div className={classes["power-toughness-display"]}>
                                    <span className={classes["power-toughness"]}>
                                        {calculateTotalPower(bc.card, counters[bc.card.name] || [])}/{calculateTotalToughness(bc.card, counters[bc.card.name] || [])}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    </>
)};


