import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/useAuth";
import classes from "./MainPage.module.css";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { socket } from "./Socket/Socket";
import { AddFriend, FriendRequests, FriendsList, PendingRequests } from "./Friends/Friends";

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
                    <div className={classes["commanderCont"]}>
                        <p style={{fontSize:"18px"}}>Current Deck</p>
                        {commanderImageURI && (
                            <img 
                                src={commanderImageURI} 
                                alt="Commander" 
                                style={{ maxWidth: '200px' }} 
                            />
                        )}
                        <br />
                        <button className={classes["deckButtons"]} onClick={changeReq}>Update/Change Deck</button>
                        <button className={classes["deckButtons"]} onClick={viewDeck}>View Deck</button>
                    </div>

                    <div className={classes["sectionCont"]}>
                        <AddFriend/>
                        <PendingRequests/>
                        <FriendRequests/>
                    </div>

                    <div className={classes["friendCont"]}>
                        <FriendsList/>
                    </div>

                    <div>
                        <button className={classes["xtraButtons"]}>Add Friends</button>

                        <button className={classes["xtraButtons"]} onClick={startPlay}>Start Game</button>
                
                        <button className={classes["xtraButtons"]}>How To</button>
                    </div>
                </div>
            </div>
        </>
    );
}