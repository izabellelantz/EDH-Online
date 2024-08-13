import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/useAuth";
import classes from "./MainPage.module.css";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { socket } from "./Socket/Socket";
import { AddFriend, FriendRequests, FriendsList } from "./Friends/Friends";

export interface CommanderImageResponse {
    commanderImageURI: string;
}

interface SocketResponse {
    status: string;
    msg: string;
}

export function MainPage() {
    const { user } = useAuth();
    let navigate = useNavigate();
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);

    const [ room, setRoom ] = useState('Game');
    
    const ConnectRoom = () => {
        socket.emit("joinRoom", room, (response: SocketResponse) => {
          console.log(response.status);
          alert(response.msg);
        });
      }
      

    useEffect(() => {
        const fetchCommanderImageURI = async () => {
            try {
                const response = await axios.get<CommanderImageResponse>(`/commander/${user?.name}`);
                console.log('API Response:', response);
                console.log(user?.name);
                console.log(response.data.commanderImageURI);

                if (response.data.commanderImageURI) {
                    setCommanderImageURI(response.data.commanderImageURI);
                }
            } catch (error) {
                console.error('Error fetching commander image URI:', error);
            }
        };

        fetchCommanderImageURI();
    }, [user?.name]);

    const changeReq = async (e: FormEvent) => {
        e.preventDefault();
        navigate("/DeckChange");
    }

    const startPlay = async (e: FormEvent) => {
        e.preventDefault();
        ConnectRoom();
        navigate("/Play");
    }

    const viewDeck = () => {
        navigate("/Deck")
    }

    return (        
        <>
            <div>
                {/* <h1>EdhOnline</h1> */}
                <h2>Welcome, {user?.name}</h2>
                
                <div className={classes["mainCont"]}>
                    <div>
                        <p style={{fontSize:"24px"}}>Current Deck</p>
                        {commanderImageURI && (
                            <img 
                                src={commanderImageURI} 
                                alt="Commander" 
                                style={{ maxWidth: '200px' }} 
                            />
                        )}
                        <br />
                        <button style={{fontSize:"16px", padding:"5px"}} onClick={changeReq}>Update/Change Deck</button>
                        <button style={{fontSize:"16px", padding:"5px"}} onClick={viewDeck}>View Deck</button>
                    </div>

                    <div>
                        <FriendsList/>
                        <AddFriend/>
                        <FriendRequests/>
                    </div>

                    <div>
                        <button style={{fontSize:"16px", padding:"5px"}}>Add Friends</button>
                    </div>

                    <div>
                        <button style={{fontSize:"16px", padding:"5px"}} onClick={startPlay}>Start Game</button>
                    </div>

                    <div>
                        <button style={{fontSize:"16px", padding:"5px"}}>How To</button>
                    </div>
                </div>
            </div>
        </>
    );
}