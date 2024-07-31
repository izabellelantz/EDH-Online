import { useState, useEffect } from 'react';
import { BoardProps } from "../Common/types";
import { PlayerInfo } from "../PlayerInfo/PlayerInfo";
import classes from "../Board.module.css";

export function Board({ players }: BoardProps) {
  const { numRows, numCols } = calculateGridSize(players);

  // blue, pink, red, green, yellow, black, purple, white
  const playmatColors = ["rgba(0, 0, 222, 0.6)", "rgba(240, 125, 179, 0.471)", "rgba(255, 0, 0, 0.53)", "rgba(11, 177, 11, 0.458)", "rgba(255, 255, 0, 0.30)", "rgba(0, 0, 0, 0.45)", "rgba(96, 3, 96, 0.511)", "rgba(255, 255, 255, 0.55)"];
  const [assignedColors, setAssignedColors] = useState<string[]>([]);
  
  useEffect(() => {
    const assigned = shuffleColors(players, playmatColors, numRows, numCols);
    setAssignedColors(assigned);
  }, [players, numRows, numCols]);
  
  const cells = [];
  
  for (let i = 0; i < numRows * numCols; i++) {
    const pos = i + 1 <= players / 2 ? "top" : "bottom";
  
    cells.push(
      <div key={i} className={classes["cell"]}>
        <PlayerInfo
        lifeCount={40}
        playerColor={assignedColors[i]}
        deckCount={99}
        position={pos}
        currentHandSize={0}
        />
        <div className={classes[`${pos}-playmat`]} style={{ backgroundColor: assignedColors[i] }}>
        </div>
      </div>
    );
  }
  
  return (
    <div className={classes["game-board"]}>
      <div className={classes["grid"]} style={{ gridTemplateRows: `repeat(${numRows}, 1fr)`, gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
        {cells}
      </div>
    </div>
  );
}


function calculateGridSize(players: number) {
  let numRows = 2;
  let numCols = 0;

  switch (players) {
    case 2:
    case 3:
      numCols = 1;
      break;
    case 4:
    case 5:
      numCols = 2;
      break;
    case 6:
      numCols = 3;
      break;
    default:
      numCols = 1;
      break;
  }

  return { numRows, numCols };
}

function shuffleColors(players: number, playmatColors: string[], numRows: number, numCols: number) {
  const shuffledColors = playmatColors.sort(() => Math.random() - 0.5);

  const assigned = [];
  for (let i = 0; i < numRows * numCols; i++) {
    assigned.push(shuffledColors[i % players]);
  }

  return assigned;
};