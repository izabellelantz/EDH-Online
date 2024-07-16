import { Board } from "../Board/Board"

export function Play() {
    return (
      <>
        <h1 className="title">EDH Online!</h1>
        <Board players={4}/>
      </>
    )
  }