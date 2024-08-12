import { PlayerInfoProps, BoardCard } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { CommanderImageResponse } from "../MainPage";

interface Counters {
    [cardName: string]: string[];
}


export function PlayerInfo({ lifeCount, playerColor, deckCount, position, currentHandSize }: PlayerInfoProps) {
    const currentMaxHandSize = 7;
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);
    

    const isTopRow = position === "top";
    const isActive = position == "bottom";
    // const [isActive, setIsActive] = useState(false);

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

    const steps = ["Main", "Combat", "Main 2.0", "End"];
    const [currentStep, setCurrentStep] = useState(0);
    const [step, setStep] = useState(steps[0]);

    const [attackers, setAttackers] = useState<BoardCard[]>([]);
    const [blockers, setBlockers] = useState<BoardCard[]>([]);
    const [totalDamage, setTotalDamage] = useState<number>(0);

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
                const response = await axios.get<CommanderImageResponse>(`/commander/${user?.name}`);
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

    const handleAttackClick = (card: BoardCard) => {
        if (!combatMode || !attackSubPhase) return;
    
        setAttackers(prevAttackers => {
            const isAttacking = prevAttackers.some(attacker => attacker.card === card.card);
            if (isAttacking) {
                return prevAttackers.filter(attacker => attacker.card !== card.card);
            } else {
                return [...prevAttackers, card];
            }
        });
    };

    const handleConfirmAttackers = () => {
        if (combatMode) {
            const totalDamage = attackers.reduce((sum, attacker) => 
                sum + calculateTotalPower(attacker.card, counters[attacker.card.name] || []), 0
            );
            setTotalDamage(totalDamage);
        }
    };

    const handleAttackPhase = () => {
        if (combatMode && attackSubPhase) {
            setAttackSubPhase(false);
            setShowAttackers(true);
            setBlockSubPhase(true);
        }
    }

    const [selectedAttacker, setSelectedAttacker] = useState<BoardCard | null>(null);

    //const handleBlockClick = (blocker: BoardCard) => {
    //    if (!combatMode || !blockSubPhase || !selectedAttacker) return;
    
    //    setBlockers(prevBlockers => {
    //        const isBlocking = prevBlockers.some(b => b.blocker.card === blocker.card && b.attacker.card === selectedAttacker.card);
            
    //        if (isBlocking) {
    //            // If blocker is already blocking the selected attacker, remove it
    //            return prevBlockers.filter(b => b.blocker.card !== blocker.card || b.attacker.card !== selectedAttacker.card);
    //        } else {
                // Otherwise, add the blocker to the selected attacker
    //            return [...prevBlockers, { attacker: selectedAttacker, blocker }];
    //       }
    //    });
    //};
    

    //const handleBlockClick = (attacker: BoardCard, blocker: BoardCard) => {
    //    if (!combatMode || !blockSubPhase) return;

    //    setBlockers(prevBlockers => {
    //        const isBlocking = prevBlockers.some(b => b.card === blocker.card);
    //        if (isBlocking) {
    //            return prevBlockers.filter(b => b.card !== blocker.card);
    //        } else {
    //            return [...prevBlockers, blocker];
    //        }
    //    });
    //};

    const handleConfirmBlocks = () => {
        if (combatMode && blockSubPhase) {
            setBlockSubPhase(false); // End the block sub-phase
            finalizeCombat(); // Move to the combat resolution
        }
    };

    const finalizeCombat = () => {
        // Resolve combat, calculate damage, and apply any effects
        setShowAttackers(false); // Hide attackers after combat is resolved
        setStep("NextPhase"); // Move to the next phase, whatever that may be
    };

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
    
        if (card.type_line.toLowerCase().includes("instant") || card.type_line.toLowerCase().includes("sorcery")) {
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
    };

    const handleMulligan = (cards: DeckCard[]) => {
        setDrawnCards([]);

    };

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
        <div className={`${classes["player-info"]} ${isTopRow ? classes["top-row"] : classes["bottom-row"]}`}>
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
                        <img 
                            src={card.image_uris.small} 
                            alt={card.name} 
                            className={classes["drawn-card"]}
                            onClick={() => handleCardClick(card)}
                            style={{ cursor: 'pointer' }}
                        />
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

            {/* Combat Phase UI */}
        {combatMode && (
            <div className={classes["combat-phase"]}>
                <h3>Select Attackers</h3>
                        {boardCards
                            .filter(bc => bc.card.type_line.toLowerCase().includes("creature"))
                            .map((bc, index) => (
                                <div key={index} className={classes["combat-card"]}>
                                    <img
                                        src={bc.card.image_uris.small}
                                        alt={bc.card.name}
                                        className={classes["combat-card-img"]}
                                        onClick={() => handleAttackClick(bc)}
                                        style={{ cursor: 'pointer', border: attackers.includes(bc) ? '2px solid green' : 'none' }}
                                    />
                                    <span>{calculateTotalPower(bc.card, counters[bc.card.name] || [])}</span>
                                </div>
                            ))}
                        <div>
                            <h4>Total Damage: {totalDamage}</h4>
                            <button onClick={handleConfirmAttackers}>Confirm Selection</button>
                            <button onClick={() => setCombatMode(false)}>Cancel</button>
                            <button onClick={() => handleAttackPhase}>Attack!</button>
                    </div>
            </div>
        )}
            
            {graveyardCards.length > 0 || exiledCards.length > 0 ? (
                <div className={classes["side-areas"]}>
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
                </div>
            ) : null}
        </div>
)};


