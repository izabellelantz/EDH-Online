import { PlayerInfoProps } from "../Common/types";
import classes from "../PlayerInfo.module.css";
import { shuffleDeck, drawCard, DeckCard } from '../Deck/Deck';
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";

export function PlayerInfo({ lifeCount, playerColor, deckCount, position }: PlayerInfoProps) {
    const isTopRow = position === "top";
    const isActive = position === "bottom"; // Allow interaction only for the bottom player
    const { user } = useAuth();
    const [deck, setDeck] = useState<DeckCard[]>([]);
    const [drawnCards, setDrawnCards] = useState<DeckCard[]>([]);
    const [numCards, setNumCards] = useState(deckCount);
  
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
      if (card) {
          setDrawnCards([...drawnCards, card]); // Add drawn card to hand
          setDeck(remainingDeck);
          setNumCards(numCards - 1); // Update deck count
      }
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
              {isActive && drawnCards.length > 0 && (
                <div className={classes["drawn-cards-container"]}>
                  {drawnCards.map((card, index) => (
                    <img key={index} src={card.image_uris.small} alt={card.name} className={classes["drawn-card"]} />
                  ))}
                </div>
              )}
          </div>
      </div>
    );
  }
