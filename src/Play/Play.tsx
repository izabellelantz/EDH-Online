import { useNavigate } from "react-router-dom"
import { Board } from "../Board/Board"

export function Play() {

  const navigate = useNavigate();
  
  const backToMain = () => {
    navigate("/Home");
  };

  return (
    <>
      <button onClick={backToMain}>Back</button>
      <h1 className="title">EDH Online!</h1>
      <Board players={4}/>
    </>
  )
}