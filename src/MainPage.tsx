import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/useAuth";
import classes from "./MainPage.module.css";
import { FormEvent, useEffect, useState } from "react";

import axios from "axios";

interface CommanderImageResponse {
    commanderImageURI: string;
}

export function MainPage() {
    const { user } = useAuth();
    let navigate = useNavigate();
    const [commanderImageURI, setCommanderImageURI] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommanderImageURI = async () => {
            try {
                const response = await axios.get<CommanderImageResponse>(`/commander/${user?.name}`);

                if (response.data && response.data.commanderImageURI) {
                    setCommanderImageURI(response.data.commanderImageURI);
                } else {
                    console.error('Commander image URI not found in response');
                }
            } catch (error) {
                console.error('Error fetching commander image URI:', error);
            }
        };

        fetchCommanderImageURI();
    }, []);

    const changeReq = async (e: FormEvent) => {
        e.preventDefault();
        navigate("/DeckChange");
    }

    return (        
        <>
            <div>
                {/* <h1>EdhOnline</h1> */}
                <h2>Welcome, {user?.name}</h2>
                
                <div className={classes["mainCont"]}>
                    <div>
                        <p>Current Deck</p>
                        {commanderImageURI && (
                            <img src={commanderImageURI} alt="Commander" style={{ maxWidth: '200px' }} />
                        )}
                        <button onClick={changeReq}>Update/Change Deck</button>
                    </div>

                    <div>
                        <p>Friends</p>
                    </div>

                    <div>
                        <button>Add Friends</button>
                    </div>

                    <div>
                        <button>Start Game</button>
                    </div>

                    <div>
                        <button>How To</button>
                    </div>
                </div>
            </div>
        </>
    );
}