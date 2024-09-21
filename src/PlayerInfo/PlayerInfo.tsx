import { PlayerInfoProps, BoardCard, Deck } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { socket } from "../Socket/Socket";
import { useNavigate } from "react-router-dom";

interface Counters {
    [cardName: string]: string[];
}

interface CommanderResponse {
    commanderImageURI: string;
    name: string;
    type_line: string;
    power?: string;
    toughness?: string;
    tapped?: false;
}

export function PlayerInfo({ lifeCount, playerColor, deckCount, position, currentHandSize, roomCode, isActive }: PlayerInfoProps) {
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);
    let navigate = useNavigate();

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
    const [oppNumCards, setOppNumCards] = useState(deckCount);
    const [oppHandSize, setOppHandSize] = useState(0);
    
    const [handSize, setHandSize] = useState(currentHandSize);

    const [playerCounters, setPlayerCounters] = useState<string[]>([]);
    const [oppCounters, setOppCounters] = useState<string[]>([]);

    const steps = ["....", "Upkeep", "Main", "Combat: Declaring Attackers", "Combat: Declaring Blockers", "Combat: Damage", "Main 2.0", "End"];
    const [currentStep, setCurrentStep] = useState(0);
    const [step, setStep] = useState(steps[0]);

    function goHome() {
        navigate("/Home");
    }


    console.log(isActive);

    useEffect(() => {
        const fetchDeck = async () => {
            try {
                const response = await axios.get<{ deck: DeckCard[] }>(`/deck/${user?.name}`);
    
                // Expand the deck based on card quantities
                const expandedDeck: DeckCard[] = response.data.deck.flatMap(card => 
                    Array(card.quantity).fill(card)
                );
    
                // Shuffle the expanded deck
                const shuffled = shuffleDeck(expandedDeck);
    
                setDeck(shuffled);
            } catch (error) {
                console.error('Error fetching deck:', error);
            }
        };
    
        fetchDeck();
    }, [user?.name]);

    const [opponentCommander, setOpponentCommander] = useState<CommanderResponse | null>(null);
    const [oppCommanderImageURI, setOppCommanderImageURI] = useState<string | null>(null);

    useEffect(() => {
        // Listen for the opponent's commander data
        socket.on('oppCommander', (data: { player: string, commander: CommanderResponse }) => {
            console.log("Getting opponent commander");
            const { player, commander } = data;
        
            // Only update if the player is not the current user
            if (player !== user?.name) {
                setOpponentCommander(commander);
                if (commander && commander.commanderImageURI) {
                    setOppCommanderImageURI(commander.commanderImageURI);
                }
            }
        });

    return () => {
        socket.off('oppCommander');
    };
}, [user?.name]);
    

    useEffect(() => {
        const fetchCommanderCard = async () => {
            try {
                const response = await axios.get<CommanderResponse>(`/commander/${user?.name}`);
                console.log('API Response:', response);
                console.log(user?.name);
                console.log(response.data.commanderImageURI);

                if (response.data.commanderImageURI) {
                    setCommanderImageURI(response.data.commanderImageURI);
                }

                socket.emit('oppCommander', {
                    player: user?.name,
                    commander: {
                        commanderImageURI: response.data.commanderImageURI,
                        type_line: response.data.type_line,
                        power: response.data.power,
                        toughness: response.data.toughness,
                    }
                });

            } catch (error) {
                console.error('Error fetching commander image URI:', error);
            }
        };

        fetchCommanderCard();
    }, [user?.name]);
    
    const [oppPhase, setOppPhase] = useState(steps[0]);

    useEffect(() => {
        socket.on('changePhase', (data) => {
            const { player, phase } = data;
            console.log(player, " switched to ", phase);

            if (player !== user?.name) {
                setOppPhase(phase);
            }
        });

        return () => {
            socket.off("changePhase");
        };
    }, [user?.name]);

    useEffect(() => {
        socket.on('drewCard', (data) => {
            const { player } = data;

            if (player !== user?.name) {
                setOppNumCards((prevNumCards) => {
                    const newNum = prevNumCards - 1;
                    console.log("Opps cards: ", newNum);
                    return newNum;
                });

                setOppHandSize((prevHandSize) => {
                    const newNum = prevHandSize + 1;
                    console.log("Opps hand size: ", newNum);
                    return newNum;
                });
            }

        });

        return () => {
            socket.off("drewCard");
        };
    }, [user?.name]);

    const handleNextStep = () => {
        setCurrentStep(prevStep => {
            const nextStep = prevStep + 1 >= steps.length ? 0 : prevStep + 1;
            setStep(steps[nextStep]);

            // come back to this emission late -> needs some refactoring
            socket.emit('changePhase', {
                player: user?.name,
                phase: steps[nextStep],
                roomCode,
            });

            return nextStep;
        });

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

        socket.emit('drawCard', {
            player: user?.name,
            roomCode,
        });
    };

    const [ commanderOnBoard, setCommanderOnBoard] = useState<boolean>(false);
    const [ commanderTapped, setCommanderTapped ] = useState<boolean>(false);

    const [ commanderFocused, setCommanderFocused ] = useState<boolean>(false);

    useEffect(() => {
        socket.on('commanderPlayed', (data) => {
            const { player, commander } = data;

            if (player !== user?.name) {
                setOppCommanderImageURI(commander);
            }
        })
        return () => {
            socket.off('commanderPlayed');
        };
    }, [user?.name]);  

    const [ oppCommanderTapped, setOppCommanderTapped ] = useState<boolean>(false);

    useEffect(() => {
        socket.on('tapCommCard', (data) => {
            const { player, tapped } = data;
    
            if (player !== user?.name) {
                setOppCommanderTapped(tapped);
            }
        });
        return () => {
            socket.off('tapCommCard');
        };
    }, [user?.name]);
      

    const handleCommanderFocus = (focused: boolean) => {
        if (!isActive || !roomCode) return;
    
        setCommanderFocused(focused);
    };
    

    const handleCommanderClick = (roomCode: string) => {
        if (!isActive || !roomCode) return;

        setCommanderOnBoard(true);

        socket.emit('commanderPlayed', {
            player: user?.name,
            commander: commanderImageURI,
            roomCode,
        });
    }

    const handleCommanderCardClick = () => {
        if (!isActive || !roomCode) return;
    
        const newTappedState = !commanderTapped;

        socket.emit('tapCommCard', {
            player: user?.name,
            tapped: newTappedState, // Emit the new state
            roomCode,
        });

        setCommanderTapped(newTappedState);
    
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
    
            }, 7000);
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
        
    
    
        return () => {
            socket.off('pendingPlayCard');
            socket.off('playCard');
            socket.off('denyPlayCard');
        };
    }, [user?.name]);    

    useEffect(() => {
        socket.on('moveCard', (data) => {
            const { card, moveTo, player } = data;
    
            if (player !== user?.name && moveTo === 'graveyard') {
                setOpponentGyCards(prev => [...prev, card]);
                setOpponentBoardCards(prev => prev.filter((bc) => bc.card.name !== card.name));
            }
    
            if (player !== user?.name && moveTo === 'exile') {
                setOpponentExileCards(prev => [...prev, card]);
                setOpponentBoardCards(prev => prev.filter((bc) => bc.card.name !== card.name));
            }
    
            if (player !== user?.name && moveTo === 'hand') {
                setOpponentBoardCards(prev => prev.filter((bc) => bc.card.name !== card.name));
                setOppHandSize(prev => prev + 1);
            }
        });
    
        return () => {
            socket.off('moveCard');
        };
    }, [user?.name]);    


    useEffect(() => {

        socket.on('changeLife', (data) => {
            const { sender, player, lifeChange } = data;
            console.log("Sender: ", sender, "Player: ", player, "Change in life: ", lifeChange);

            if (sender !== user?.name) {
                if (player === "opp") {
                    setLives((prevLives) => {
                        const newLives = prevLives + lifeChange;
                        console.log("Lives: ", newLives);
                        return newLives;
                    });
                } else {
                    setOpponentLives((prevLives) => {
                        const newLives = prevLives + lifeChange;
                        console.log("Opps lives: ", newLives);
                        return newLives;
                    });
                }
            }
        });

        return () => {
            socket.off('changeLife');
        }
    }, [user?.name]);


    const handleLifeUp = (roomCode: string) => {
        if (!isActive || !roomCode) return;

        setLives(lives + 1);

        socket.emit('changeLife', {
            sender: user?.name,
            player: user?.name,
            lifeChange: 1,
            roomCode,
        });
    };

    const handleLifeDown = (roomCode: string) => {
        if (!isActive || !roomCode) return;

        setLives(lives - 1);

        socket.emit('changeLife', {
            sender: user?.name,
            player: user?.name,
            lifeChange: -1,
            roomCode,
        });
    };

    const handleOppLifeUp = (roomCode: string) => {
        if (!isActive || !roomCode) return;

        setOpponentLives(opponentLives + 1);

        socket.emit('changeLife', {
            sender: user?.name,
            player: "opp",
            lifeChange: 1,
            roomCode,
        });
    };

    const handleOppLifeDown = (roomCode: string) => {
        if (!isActive || !roomCode) return;

        setOpponentLives(opponentLives - 1);

        socket.emit('changeLife', {
            sender: user?.name,
            player: "opp",
            lifeChange: -1,
            roomCode,
        });
    };

    const handleDiscardCard = (card: DeckCard) => {
        // Remove the card from the hand
        setDrawnCards(drawnCards.filter(c => c !== card));
      
        // Add the card to the graveyard
        setGraveyardCards([...graveyardCards, card]);
      
        // Update the hand size
        setHandSize(handSize - 1);

        console.log("Emitting move to gy");
        socket.emit('moveCard', {
            card,
            action: 'move',
            moveTo: 'graveyard',
            player: user?.name,
            roomCode
        });
      };

    
    useEffect(() => {
        const handleTapCard = (data: { card: DeckCard; player: string; }) => {
            console.log("Receiving tap event");
    
            const { card, player } = data;
            console.log("Player: ", player, "Card tapped: ", card.name);
    
            if (player !== user?.name) {
                setOpponentBoardCards(prevCards =>
                    prevCards.map(bc =>
                        bc.card.name === card.name ? { ...bc, tapped: !bc.tapped } : bc
                    )
                );
                console.log("Tapped");
            }
        };
    
        socket.on('tapCard', handleTapCard);
    
        return () => {
            socket.off('tapCard');
        };
    }, [user?.name]);
    
      

    const handleBoardCardClick = (card: DeckCard, roomCode: string) => {
        if (!isActive || !roomCode) return; // Prevent interaction if not active

        console.log("Emitting tap event");

        const updatedBoardCards = boardCards.map(bc => 
            bc.card === card ? { ...bc, tapped: !bc.tapped } : bc
        );
        setBoardCards(updatedBoardCards);
    
        // Emit the event to the server
        socket.emit('tapCard', {
            card,
            player: user?.name,
            roomCode,
        });
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

    const focusCard = (card: DeckCard | null) => {    
        setBoardCards(boardCards.map(bc =>
            bc.card === card ? { ...bc, focused: true } : { ...bc, focused: false }
        ));
    };

    const focusOppCards = (card: DeckCard | null) => {    
        setOpponentBoardCards(opponentBoardCards.map(bc =>
            bc.card === card ? { ...bc, focused: true } : { ...bc, focused: false }
        ));
    };

    
    // Kill the card (move to graveyard)
    const handleKillCard = (card: DeckCard) => {
        setGraveyardCards([...graveyardCards, card]);
        setBoardCards(boardCards.filter(bc => bc.card !== card));

        socket.emit('moveCard', {
            card,
            action: 'move',
            moveTo: 'graveyard',
            player: user?.name,
            roomCode
        });
    };
  

    const handleExileCard = (card: DeckCard) => {
        setExiledCards([...exiledCards, card]);
        setBoardCards(boardCards.filter(bc => bc.card !== card));

        socket.emit('moveCard', {
            card,
            action: 'move',
            moveTo: 'exile',
            player: user?.name,
            roomCode
        });
    };

    const backToHand = (card: DeckCard) => {
        setBoardCards(boardCards.filter(bc => bc.card !== card));
        setDrawnCards([...drawnCards, card]);

        socket.emit('moveCard', {
            card,
            action: 'move',
            moveTo: 'hand',
            player: user?.name,
            roomCode
        });
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

    const getPT = (card: DeckCard, counters: string[]): string => {
        const power = calculateTotalPower(card, counters);
        const toughness = calculateTotalToughness(card, counters);        

        return (`${power} / ${toughness}`);
    };

    const colorIndexMap: { [key: string]: number } = {
        white: 0,
        red: 1,
        blue: 2,
        green: 3,
        black: 4,
        colorless: 5,
    };
    

    // in order: white, red, blue, green, black, colorless
    const [manaTracking, setManaTracking] = useState<number[]>([0, 0, 0, 0, 0, 0]);

    const [oppManaTracking, setOppManaTracking] = useState<number[]>([0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        const handleManaChange = (data: { player: string; color: string; amount: number }) => {
            const { player, color, amount } = data;
            if (player !== user?.name) {
                const index = colorIndexMap[color];
                setOppManaTracking((prevTracking) => {
                    const updatedTracking = [...prevTracking];
                    updatedTracking[index] = amount;
                    return updatedTracking;
                });
            }
        };
    
        socket.on('changeMana', handleManaChange);
    
        return () => {
            socket.off('changeMana');
        };
    }, [user?.name]);
    
    const handleManaChange = (color: string, action: "increment" | "decrement") => {
        const index = colorIndexMap[color];
    
        setManaTracking((prevTracking) => {
            const updatedTracking = [...prevTracking];
            if (action === "increment") {
                updatedTracking[index] += 1;
            } else if (action === "decrement" && updatedTracking[index] > 0) {
                updatedTracking[index] -= 1;
            }
    
            // Emit the change to other players with the updated value
            socket.emit('changeManaPool', {
                player: user?.name,
                color,
                amount: updatedTracking[index], // Use the updated value
                roomCode,
            });
    
            return updatedTracking;
        });
    };
    
    const [ mulliganOption, setMulliganOption] = useState<boolean>(true);
    const [ oppCommanderFocused, setOppCommanderFocused] = useState<boolean>(false);

    const handleMulligan = () => {
        if (!isActive) return; // Prevent interaction if not active
    
        // Combine the current hand with the deck
        const newDeck = [...deck, ...drawnCards];
    
        // Shuffle the deck after adding the cards back
        const shuffledDeck = shuffleDeck(newDeck);
    
        // Update the deck and reset the hand
        setDeck(shuffledDeck);
        setDrawnCards([]);
        setNumCards(99);
        setHandSize(0);
    
        socket.emit('mulligan', {
            player: user?.name,
            roomCode,
        });
    };

    useEffect(() => {
        socket.on('mulligan', (data) => {
            const { player } = data;
    
            if (player !== user?.name) {
                setOppHandSize(0);
            }
        });
    
        return () => {
            socket.off("mulligan");
        };
    }, [user?.name]);
    
    const [pCounterDropdown, setPCounterDropdown] = useState<boolean>(false);

    return (
        <>
        {isActive && roomCode &&
        <div className={classes["player-side"]}>
            {commanderImageURI && commanderOnBoard === false && (
                <img 
                    src={commanderImageURI}
                    className={classes["commander-card"]}
                    style={{ marginBottom:"40px" }}
                    onClick={() => handleCommanderClick(roomCode)}
                /> 
            )}

            { mulliganOption && (
                <div className={classes["mulligan"]}>
                <button className="xbuttons" onClick={handleMulligan}>Mulligan</button>
                <button className="xbuttons" onClick={() => setMulliganOption(false)}>Pass Mulligan</button>
                </div>
            )}

            <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                <span>
                    <button className={classes["change-life"]} onClick={() => handleLifeDown(roomCode)}>-</button>
                    {lives}
                    <button className={classes["change-life"]} onClick={() => handleLifeUp(roomCode)}>+</button>
                    <button className={classes["player-counters"]} onClick={() => setPCounterDropdown(!pCounterDropdown)}>⚙️</button>
                    { pCounterDropdown && (
                        <div className={classes["counter-box"]}>
                        <button className={classes["player-counters-button"]}>Poison +1</button>
                        <button className={classes["player-counters-button"]}>Poison -1</button>
                        <button className={classes["player-counters-button"]}>Rad +1</button>
                        <button className={classes["player-counters-button"]}>Rad -1</button>
                        <button className={classes["player-counters-button"]}>Other +1</button>
                        <button className={classes["player-counters-button"]}>Other -1</button>
                        </div>
                    )}
                </span>
            </div>

            <div className={classes["next-step"]}>
                <button 
                onClick={handleNextStep} 
                style={{ backgroundColor: "rgba(0, 0, 0, 0.538)", padding: "10px", borderRadius: "15px", color: "red", fontWeight: "bold" }}>
                    {step} ➡
                </button>
            </div>

            <div
                className={classes["deck"]}
                onClick={handleDrawCard}
                style={{ cursor: isActive ? 'pointer' : 'default' }}
            >
                {numCards}
            </div>

            <div className={classes["mana-rack"]}>
    {["white", "red", "blue", "green", "black", "colorless"].map((color) => (
        <div key={color} className={classes[`${color}-mana`]}>
            <button
                className={classes["mana-adjust"]}
                onClick={() => handleManaChange(color, "increment")}
            >
                +
            </button>
            <div
                style={{
                    backgroundColor: color === "colorless" ? "lightgrey" : color,
                    width: "30px",
                    height: "30px",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color === "black" ? "white" : "black",
                    fontWeight: "bold",
                    fontSize: "16px",
                    margin: "0 5px",
                }}
            >
                {manaTracking[colorIndexMap[color]]}
            </div>
            <button
                className={classes["mana-adjust"]}
                onClick={() => handleManaChange(color, "decrement")}
            >
                -
            </button>
        </div>
    ))}
</div>



            <div className={classes["drawn-cards-container"]}>
                {isActive && drawnCards.length > 0 && drawnCards.map((card, index) => (
                    <div key={index} className={classes["hand-card-wrapper"]}>
                            <img 
                                src={card.image_uris.small || 'default-image-url'} 
                                alt={card.name} 
                                className={classes["drawn-card"]}
                                onClick={() => handleCardClick(card, roomCode)} 
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
                {commanderImageURI && commanderOnBoard && (
                    <img src={commanderImageURI}
                    className={`${classes["commander-board"]} ${commanderTapped ? classes["tapped"] : ""} ${commanderFocused ? classes["focused"] : ""}`}
                    onClick={() => handleCommanderCardClick()}
                    onPointerEnter={() => handleCommanderFocus(true)}
                    onPointerLeave={() => handleCommanderFocus(false)}
                    ></img>
                )}
                <div className={classes["non-land-cards"]}>
                    {boardCards
                        .filter(bc => !bc.card.type_line.toLowerCase().includes("land"))
                        .map((bc, index) => (
                            <div key={index} className={classes["card-wrapper"]}>
                                <img
                                    src={bc.card.image_uris.small}
                                    alt={bc.card.name}
                                    className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                                    onClick={() => handleBoardCardClick(bc.card, roomCode)}
                                    onPointerEnter={() => focusCard(bc.card)}
                                    onPointerLeave={() => focusCard(null)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Display total power/toughness */}
                                {bc.card.type_line.toLowerCase().includes("creature") && (
                                    <div className={classes["power-toughness-display"]}>
                                        <span className={classes["power-toughness"]}>{getPT(bc.card, counters[bc.card.name] || [])}</span>
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
                                        <button onClick={() => backToHand(bc.card)}>Return to Hand</button>
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
                                    onClick={() => handleBoardCardClick(bc.card, roomCode)}
                                    onPointerEnter={() => focusCard(bc.card)}
                                    onPointerLeave={() => focusCard(null)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {/* Display total power/toughness if needed */}
                                {bc.card.type_line.toLowerCase().includes("creature") && (
                                    <div className={classes["power-toughness-display"]}>
                                        <span className={classes["power-toughness"]}>{getPT(bc.card, counters[bc.card.name] || [])}</span>
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
                                        <button onClick={() => backToHand(bc.card)}>Return to Hand</button>
                                        <button onClick={() => toggleButtons(index)}>Done</button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>

            <div className={classes["graveyard-container"]}>
                <div className={classes["graveyard"]}>
                    {/* Graveyard cards */}
                    <p>Graveyard:</p>
                    {graveyardCards.map(card => (
                        <div key={card.name}>
                            <img  className={classes["graveyard-card"]} src={card.image_uris.small} alt={card.name} />
                        </div>
                    ))}
                </div>
            </div>

            <div className={classes["exile-container"]}>
                <div className={classes["exile"]}>
                    {/* Exile cards */}
                    <p>Exile:</p>
                    {exiledCards.map(card => (
                        <div key={card.name}>
                            <img className={classes["exile-card"]} src={card.image_uris.small} alt={card.name} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    }

        { roomCode && 
        <div className={classes["opponent-side"]}>
            {oppCommanderImageURI && (
                <img 
                src={oppCommanderImageURI} 
                className={`${classes["op-commander-card"]} ${oppCommanderTapped ? classes["tapped"] : ""} ${oppCommanderFocused ? classes["focused"]: ""}`} 
                alt="Opponent's Commander"
                onPointerEnter={() => setOppCommanderFocused(true)}
                onPointerLeave={() => setOppCommanderFocused(false)}
            />
            )}

            <div className={classes["op-drawn-cards-container"]}>
                <div className={classes["hand-card-wrapper"]} style={{ flexDirection:"row" }}>
                    {oppHandSize > 0 && (
                        <>
                        {Array.from({ length: oppHandSize }).map((_, index) => (
                            <div
                                key={index}
                                className={classes["drawn-card"]}
                                style={{ backgroundColor: "black", border: "1px solid white", width: "60px", height: "70px", margin: "5px", borderRadius: "4px", boxShadow: "3px 4px 2px black"}}
                            />
                        ))}
                    </>
                )}
                </div>
            </div>

            <div
                className={classes["op-deck"]}
                 
            >
                {oppNumCards}
            </div>

    

            <div className={classes["next-step"]}>
                <span 
                style={{ backgroundColor: "rgba(0, 0, 0, 0.538)", padding: "10px", borderRadius: "15px", color: "red", fontWeight: "bold" }}>
                    {oppPhase}
                </span>
            </div>

            <div className={classes["op-mana-rack"]}>
    {["white", "red", "blue", "green", "black", "colorless"].map((color) => (
        <div key={color} className={classes[`${color}-mana`]}>
            <div
                style={{
                    backgroundColor: color === "colorless" ? "lightgrey" : color,
                    width: "30px",
                    height: "30px",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color === "black" ? "white" : "black",
                    fontWeight: "bold",
                    fontSize: "16px",
                    margin: "0 5px",
                    opacity: 0.7,
                }}
            >
                {oppManaTracking[colorIndexMap[color]]}
            </div>
        </div>
    ))}
</div>


            <div className={classes["op-non-land-cards"]}>
                <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                    <span>
                        <button className={classes["change-life"]} onClick={() => handleOppLifeDown(roomCode)}>-</button>
                        {opponentLives}
                        <button className={classes["change-life"]} onClick={() => handleOppLifeUp(roomCode)}>+</button>
                        <button className={classes["player-counters"]} onClick={() => setPCounterDropdown(!pCounterDropdown)}>⚙️</button>
                    </span>
                </div>

                <div className={classes["op-board-cont"]}>
                {opponentBoardCards
                    .map((bc, index) => (
                        <div key={index} className={classes["card-wrapper"]}>
                            <img
                                src={bc.card.image_uris.small}
                                alt={bc.card.name}
                                className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""} ${bc.focused ? classes["focused"] : ""}`}
                                onPointerEnter={() => focusOppCards(bc.card)}
                                onPointerLeave={() => focusOppCards(null)}
                            />
                            {/* Power/Toughness if needed */}
                            {bc.card.type_line.toLowerCase().includes("creature") && (
                                <div className={classes["power-toughness-display"]}>
                                    <span className={classes["power-toughness"]}>
                                        {getPT(bc.card, counters[bc.card.name] || [])}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
            </div>
            </div>
        </div>
        }
        <>
            <button 
            className="xbuttons"
            style={{ position: "absolute", bottom: "-470px" }}
            onClick={goHome}>Home</button>
        </>
    </>
)};


