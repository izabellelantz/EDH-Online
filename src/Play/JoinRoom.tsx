import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../Socket/Socket";
import { useAuth } from "../Auth/useAuth";

export function WaitingRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const [players, setPlayers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (roomCode && user) {
      // Log to confirm that this hook is running
      console.log(`Room code in WaitingRoom: ${roomCode}`);

      socket.emit("joinRoom", roomCode, user.name, (response: {msg: string}) => {
        console.log(response.msg);
      })

      // Listen for player list updates
      socket.on('playerList', (updatedPlayers: string[]) => {
        console.log("Received player list:", updatedPlayers); // Debug
        setPlayers(updatedPlayers);
      });

      // Listen for game start
      socket.on('gameStart', () => {
        navigate(`/Play/${roomCode}`);
      });

      return () => {
        socket.off('playerList');
        socket.off('gameStart');
      };
    }
  }, [roomCode, navigate]);

  const handleStartGame = () => {
    socket.emit('startGame', roomCode);
  };

  return (
    <div className="waiting-room">
      <h1>Waiting Room</h1>
      <h2>Room Code: {roomCode}</h2>
      <div className="player-list">
        <h3>Players:</h3>
        {players.length === 0 ? (
          <p>No players yet.</p>
        ) : (
          players.map((player, idx) => (
            <p key={idx}>{player}</p>
          ))
        )}
      </div>
      <button onClick={handleStartGame} disabled={players.length < 2}>Start Game</button>
    </div>
  );
}



export function RoomSelection() {
    const [roomCode, setRoomCode] = useState<string>("");
    const { user } = useAuth();
    const navigate = useNavigate();
  
    const handleJoin = () => {
      if (roomCode.trim() && user?.name) {
        console.log(`Joining room ${roomCode} with username ${user.name}`); // Debugging line
        socket.emit('joinRoom', roomCode, user.name, (response: { msg: string }) => {
          console.log(response.msg);
          // Redirect to waiting room
          navigate(`/WaitingRoom/${roomCode}`);
        });
      } else {
        alert("Room code and username are required!");
      }
    };
  
    return (
      <div className="room-selection">
        <h1>Join Room</h1>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code or create new."
          style={{ width: "40%", marginRight: "15px", borderRadius: "10px", padding: "10px" }}
        />
        <button onClick={handleJoin} style={{ padding: "8px" }}>Join</button>
      </div>
    );
  }