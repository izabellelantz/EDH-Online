import { useNavigate } from "react-router-dom"
import { Board } from "../Board/Board"
import { roll } from "./RollDice";

export function Play() {
  const numPlayers = 2;
  const rolls = [];

  const navigate = useNavigate();
  let i = 0;
  
  const backToMain = () => {
    navigate("/Home");
  };

  while (i < numPlayers) {
    let rollTotal = roll();
    rolls.push(rollTotal);
    i += 1;
  }

  console.log(rolls);

  return (
    <>
      <button onClick={backToMain}>Back</button>
      <h1 className="title">EDH Online!</h1>
      <Board players={numPlayers}/>
    </>
  )
}