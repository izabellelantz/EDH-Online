import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";
import { useState } from "react";
import axios from "axios";

interface CardInfo {
    name: string;
    quantity: number;
}

export function AddDeck() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deckInput, setDeckInput] = useState<string>("");

    const parseDeckInput = (): { deck: CardInfo[], commander?: CardInfo } => {
        const entries = deckInput.split("\n").filter(entry => entry.trim() !== "");
        const deck: CardInfo[] = [];
        let commander: CardInfo | undefined;

        for (let i = 0; i < entries.length; i++) {
            const parts = entries[i].split(" ");
            const quantity = parseInt(parts[0], 10);
            const name = parts.slice(1).join(" ").trim();

            if (i === entries.length - 1) {
                commander = { name, quantity };
            } else {
                if (!isNaN(quantity) && name) {
                    deck.push({ name, quantity });
                }
            }
        }

        return { deck, commander };
    };
        

    const addToDeck = async () => {
        const { deck, commander } = parseDeckInput();

        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                console.error('No JWT found, user is not authenticated');
                return;
            }
            
            const response = await axios.post("/updateDeck", { username: user?.name, deck, commander }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.message) {
                console.log("Deck updated successfully:", response.data.message);
                navigate("/Home");
            }
        } catch (error) {
            console.error("Error adding deck:", error);
        }
    };

    return (
        <>
            <p>EDH is a popular format of Magic the Gathering, also known as Commander format, upload your deck here.</p>
            <p>Enter your deck here in the format: "4 Forest", "3 Lightning Bolt", etc.</p>
            <p>Make sure your commander is in the last line!</p>
            <textarea value={deckInput} onChange={(e) => setDeckInput(e.target.value)} rows={10} cols={50} />
            <br />
            <button onClick={addToDeck}>Add Deck</button>
        </>
    );
}
