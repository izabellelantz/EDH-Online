import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/useAuth";
import classes from "./MainPage.module.css";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { AddFriend, FriendRequests, FriendsList, PendingRequests } from "./Friends/Friends";
import { ThemeProvider } from "./ThemeContext";
import ThemeToggleButton from "./ThemeToggleButton";

export interface CommanderImageResponse {
    commanderImageURI: string;
}

export function MainPage() {
    const { user } = useAuth();
    let navigate = useNavigate();
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);
      

    useEffect(() => {
        const fetchCommanderImageURI = async () => {
            try {
                const response = await axios.get<CommanderImageResponse>(`/commanderImg/${user?.name}`);
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
        
        navigate("/DeckChangingTutorial");
    }

    const startPlay = async (e: FormEvent) => {
        e.preventDefault();
        
        navigate("/SelectRoom");
      }
      

    const viewDeck = () => {
        navigate("/Deck");
    }

    const logOut = () => {
        navigate("/");
    }

    const profilePage = () => {
        navigate("/Profile");
    }

    return (
        <ThemeProvider>
        <>
            <div>
                <ThemeToggleButton></ThemeToggleButton>

                <button onClick={logOut} className={classes["xtraButtons"]}>Log Out</button>
                <button onClick={profilePage} className={classes["xtraButtons"]}>Profile Settings</button>
                <h2>Welcome, {user?.preferredName} ({user?.name})</h2>
                <div className={classes["mainCont"]}>
                    <div className={classes["topSection"]}>
                        <span className={classes["commanderCont"]}>
                            <p style={{fontSize:"18px", fontWeight: "bold"}}>Current Deck</p>
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
                        </span>
    
                        <span className={classes["sectionCont"]}>
                            <AddFriend/>
                            <PendingRequests/>
                            <FriendRequests/>
                        </span>
                    </div>
    
                    <span className={classes["friendCont"]}>
                        <FriendsList/>
                    </span>

                    <br></br>
    
                    <div>
                        <button className={classes["xtraButtons"]} onClick={startPlay}>Start Game</button>
                        <button className={classes["xtraButtons"]}>How To</button>
                    </div>
                </div>
            </div>
        </>
        </ThemeProvider>
    );    
}