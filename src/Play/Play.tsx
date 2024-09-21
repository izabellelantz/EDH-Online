import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Board } from "../Board/Board";
import { roll } from "./RollDice";
import { socket } from "../Socket/Socket";
import { useAuth } from "../Auth/useAuth";

interface ChatMessage {
  username: string;
  message: string;
}

export function ChatBox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [seeMessages, setSeeMessages] = useState(true);

  useEffect(() => {
    const handleChatMessage = (chatMessage: ChatMessage) => {
      console.log(`Received chat message: ${chatMessage}`);
      setMessages(prevMessages => [...prevMessages, chatMessage]);
    };
  
    socket.on('chatMessage', handleChatMessage);
  
    return () => {
      socket.off('chatMessage', handleChatMessage);
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit('chatMessage', user?.name, inputMessage);
      setInputMessage(""); // Clear input after sending
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  
  const howToPg = () => {
    navigate("/HowTo")
  }

  return (
    <>
    <button style={{ position: "fixed", top: "0", left: "0", zIndex: "4" }} onClick={() => setSeeMessages(prevState => !prevState)}>
      Toggle Messages
    </button>


    { seeMessages && (
      <div className="chat-container">
      <button className="xbuttons" style={{ position:"absolute", right:"0", top:"0", fontSize:"8px" }} onClick={() => howToPg()}>Game FAQ here</button>

      <div className="messages">
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.username}: </strong>
            {msg.message}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={inputMessage}
        onChange={handleInputChange}
        placeholder="Type your message here..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
    )}
    </>
  );
}

export function Play() {
  const { user } = useAuth();
  const { roomCode } = useParams<{ roomCode: string }>();
  const [players, setPlayers] = useState<string[]>([]);
  const [rolls, setRolls] = useState<number[]>([]);

  useEffect(() => {
    if (roomCode) {
      socket.emit('joinRoom', roomCode, user?.name, (response: { msg: string }) => {
        console.log(response.msg);
      });

      socket.on('playerList', (updatedPlayers: string[]) => {
        setPlayers(updatedPlayers);
      });

      return () => {
        socket.off('playerList');
      };
    }
  }, [roomCode, user?.name]);

  console.log("Players...", players);

  useEffect(() => {
    if (players.length > 0) {
      const newRolls = [];
      while (newRolls.length < players.length) {
        newRolls.push(roll());
      }
      setRolls(newRolls);
    }
  }, [players]);

  return (
    <>
      <h1 className="title">EDH Online!</h1>
      <Board players={players} roomCode={roomCode} />
      <ChatBox />
    </>
  );
}