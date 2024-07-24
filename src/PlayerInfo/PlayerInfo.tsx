import { PlayerInfoProps } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { BoardCard } from "../Common/types"; 

export function PlayerInfo({ lifeCount, playerColor, deckCount, position }: PlayerInfoProps) {
    const isTopRow = position === "top";
    const isActive = position === "bottom"; // Allow interaction only for the bottom player
    const { user } = useAuth();
    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<DeckCard[]>([]);
    const [numCards, setNumCards] = useState(deckCount);
    const [boardCards, setBoardCards] = useState<BoardCard[]>([]); // State to track cards on the board
  
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
    
        if (card) {
            setDrawnCards([...drawnCards, card]); // Add drawn card to hand
            setDeck(remainingDeck);
            setNumCards(numCards - 1); // Update deck count
        }
    };

    const handleCardClick = (card: DeckCard) => {
      if (!isActive) return; // Prevent interaction if not active

      // Move the card to the board
      setBoardCards([...boardCards, { card, tapped: false }]);
      setDrawnCards(drawnCards.filter(c => c !== card)); // Remove card from drawn cards

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

    return (
        <div className={`${classes["player-info"]} ${isTopRow ? classes["top-row"] : classes["bottom-row"]}`}>
            <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
                <span>{lifeCount}</span>
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
                {boardCards.map((bc, index) => (
                    <img 
                        key={index} 
                        src={bc.card.image_uris.small} 
                        alt={bc.card.name} 
                        className={`${classes["board-card"]} ${bc.tapped ? classes["tapped"] : ""}`}
                        onClick={() => handleBoardCardClick(bc.card)}
                        style={{ cursor: 'pointer' }}
                    />
                ))}
            </div>
        </div>
    );
}
