import { PlayerInfoProps } from "../Common/types";
import classes from "../PlayerInfo.module.css";

export function PlayerInfo({ lifeCount, playerColor, deckCount, position}: PlayerInfoProps) {
    const isTopRow = position === "top";
  
    return (
        <div className={`${classes["player-info"]} ${isTopRow ? classes["top-row"] : classes["bottom-row"]}`}>
          <div className={classes["life-display"]} style={{ backgroundColor: playerColor }}>
            <span>{lifeCount}</span>
          </div>
          
          <div className={classes["deck"]}>{deckCount}</div>
        </div>
    );
};