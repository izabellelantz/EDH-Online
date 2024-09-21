import { useState, useEffect } from 'react';
import { BoardProps } from "../Common/types";
import { PlayerInfo } from "../PlayerInfo/PlayerInfo";
import classes from "../Board.module.css";
import { useAuth } from '../Auth/useAuth';

export function Board({ players, roomCode }: BoardProps) {
  const { user } = useAuth();

  const { numRows, numCols } = calculateGridSize(players.length);
  
  const positions = players.map((player) => {
    return player === user?.name ? "bottom" : "top";
  });
  
  // Blue, Pink, Red, Green, Yellow, Black, Purple, White
  const playmatColors = [
    "rgba(0, 0, 222, 0.6)",
    "rgba(240, 125, 179, 0.471)",
    "rgba(255, 0, 0, 0.53)",
    "rgba(11, 177, 11, 0.458)",
    "rgba(255, 255, 0, 0.30)",
    "rgba(0, 0, 0, 0.45)",
    "rgba(96, 3, 96, 0.511)",
    "rgba(255, 255, 255, 0.55)"
  ];

  console.log("Players:", players);
  console.log(user?.name);

  const [assignedColors, setAssignedColors] = useState<string[]>([]);

  useEffect(() => {
    if (players.length > 0) {
      const assigned = shuffleColors(playmatColors, numRows, numCols);
      console.log("Assigned Colors:", assigned);
      setAssignedColors(assigned);
    }
  }, [players, numRows, numCols]); // Ensure this dependency is correct
  
  const cells = players.map((player, i) => (
    <div key={i} className={classes["cell"]}>
      <PlayerInfo
        lifeCount={40}
        playerColor={playmatColors[i]}
        deckCount={99}
        position={positions[i]}
        currentHandSize={0}
        roomCode={roomCode}
        isActive={player === user?.name}
      />
  <div className={positions[i] === 'top' ? classes['top-playmat'] : classes['bottom-playmat']} style={{ backgroundColor: playmatColors[5] }}>
  </div>
    </div>
  ));


  return (
    <div className={classes["game-board"]} style={{ marginTop: "20px" }}>
      <div className={classes["grid"]} style={{ gridTemplateRows: `repeat(${numRows}, 1fr)`, gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
        <div className={classes["cell"]}>
        <PlayerInfo
        lifeCount={40}
        playerColor={playmatColors[5]}
        deckCount={99}
        position={"bottom"}
        currentHandSize={0}
        roomCode={roomCode}
        isActive={true}
      />
        </div>
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

  console.log("Calculated Grid Size:", { numRows, numCols });
  
  return { numRows, numCols };
}


function shuffleColors(playmatColors: string[], numRows: number, numCols: number) {
  const shuffledColors = [...playmatColors].sort(() => Math.random() - 0.5);
  const assigned = [];
  
  for (let i = 0; i < numRows * numCols; i++) {
    assigned.push(shuffledColors[i % shuffledColors.length] || 'transparent');
  }
  
  console.log("Shuffled Colors:", shuffledColors);
  console.log("Assigned Colors:", assigned);
  
  return assigned;
}
