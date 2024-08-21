import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";
import { useState } from "react";
import axios from "axios";

import tutorialA from "../Assets/tutorial-image-1.png";
import tutorialB from "../Assets/tutorial-image-2.png";

interface CardInfo {
    name: string;
    quantity: number;
}

export function DeckAddingTutorial() {
    const navigate = useNavigate();

    const confirm = () => {
        navigate("/DeckChange");
    }

    const backToMain = () => {
        navigate("/Home");
    }

    const [howToDeck, setHowToDeck] = useState(false);

    return (
        <>
            <p>EDH is a popular format of Magic the Gathering, also known as Commander format, upload your deck on the next page to begin playing.</p>
            
            <p>If you don't yet have a deck, a sample one is provided below. You may copy this deck to use for learning the game.</p>

            <p>If you do have a deck, refer to the format below for how your deck should look on the next page.</p>

            <p>Remember: Commander goes in the last line!</p>

            <textarea style={{ width: "400px", height: "400px", border: "none", borderRadius: "3px", margin: "5px" }}
            contentEditable="false"
            spellCheck="false"
            value="1 Akroma's Will
1 Apex Altisaur
1 Arcane Signet
1 Arch of Orazca
1 Atzocan Seer
1 Bellowing Aegisaur
1 Bronzebeak Foragers
1 Canopy Vista
1 Chandra's Ignition
1 Cinder Glade
1 Clifftop Retreat
1 Command Tower
1 Cultivate
1 Curious Altisaur
1 Deathgorge Scavenger
1 Descendants' Path
1 Dinosaur Egg
1 Drover of the Mighty
1 Earthshaker Dreadmaw
1 Etali, Primal Storm
1 Evolving Wilds
1 Exotic Orchard
1 Farseek
1 Fiery Confluence
8 Forest
1 Fortified Village
1 From the Rubble
1 Furycalm Snarl
1 Game Trail
1 Generous Gift
1 Itzquinth, Firstborn of Gishath
1 Ixalli's Lorekeeper
1 Jungle Shrine
1 Kessig Wolf Run
1 Kinjalli's Sunwing
1 Lifecrafter's Bestiary
1 Majestic Heliopterus
1 Marauding Raptor
1 Migration Path
1 Mosswort Bridge
4 Mountain
1 Myriad Landscape
1 Otepec Huntmaster
1 Path of Ancestry
1 Path to Exile
4 Plains
1 Progenitor's Icon
1 Quartzwood Crasher
1 Raging Regisaur
1 Raging Swordtooth
1 Rampaging Brontodon
1 Rampant Growth
1 Ranging Raptors
1 Regal Behemoth
1 Regisaur Alpha
1 Return of the Wildspeaker
1 Rhythm of the Wild
1 Ripjaw Raptor
1 Rishkar's Expertise
1 Rogue's Passage
1 Runic Armasaur
1 Savage Stomp
1 Scion of Calamity
1 Secluded Courtyard
1 Shifting Ceratops
1 Sol Ring
1 Sunfrill Imitator
1 Temple Altisaur
1 Temple of the False God
1 Terramorphic Expanse
1 Thrashing Brontodon
1 Thriving Bluff
1 Thriving Grove
1 Thriving Heath
1 Thunderherd Migration
1 Thundering Spineback
1 Topiary Stomper
1 Unclaimed Territory
1 Verdant Sun's Avatar
1 Wakening Sun's Avatar
1 Wayta, Trainer Prodigy
1 Wayward Swordtooth
1 Wrathful Raptors
1 Xenagos, God of Revels
1 Zacama, Primal Calamity
1 Zetalpa, Primal Dawn

1 Pantlaza, Sun-Favored"/>

            <br></br>
            <button className="xbuttons" onClick={confirm}>Ready</button>

            <br></br>
            <button className="xbuttons" onClick={backToMain}>Back</button>

            <br></br>
            <button style={{ background: "none", textDecoration: "underline", color: "green" }} onClick={() => setHowToDeck(true)}>
                Where can I get a deck in this format?
            </button>

            { howToDeck && (
                <div style={{ display: "inline-flex" }}>
                    <span style={{ margin: "10px", padding: "10px" }}>
                        <h2>1.</h2>
                        <p>Go to Moxfield.com</p>
                        <p>Find or create your deck.</p>
                    </span>

                    <span style={{ margin: "10px", padding: "10px" }}>
                        <img src={tutorialA} style={{ width: "50%"}}></img>
                        <h2>2.</h2>
                        <p>Select More.</p>

                        <h2>3.</h2>
                        <p>From the dropdown, select Export.</p>
                    </span>

                    <span style={{ margin: "10px", padding: "10px" }}>
                        <img src={tutorialB} style={{ width: "50%"}}></img>
                        <h2>4.</h2>
                        <p>Select Copy for MTGO (plain text export)</p>

                        <button style={{ height:"30px", borderRadius:"12px"}} onClick={() => setHowToDeck(false)}>Got It!</button>
                    </span>
                </div>
            )}
        </>
    )
}

export function AddDeck() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deckInput, setDeckInput] = useState<string>("");

    const backToMain = () => {
        navigate("/Home");
    }

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
    }
        

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
    }

    return (
        <>
            <p>Make sure your deck is in the format of "quantity name", for example:</p>
            <p>"4 Forest</p>
            <p>3 Lightning Bolt</p>
            <p>1 Sol Ring" etc.</p>
            <p>Make sure your commander is in the last line!</p>
            <textarea style={{ borderRadius: "10px" }} value={deckInput} onChange={(e) => setDeckInput(e.target.value)} rows={10} cols={50} />
            <br />
            <button className="xbuttons" onClick={addToDeck}>Add Deck</button>
            <button className="xbuttons" onClick={backToMain}>Back</button>
        </>
    )
}
