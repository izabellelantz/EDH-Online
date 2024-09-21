import { useState } from "react";
import handTutorial from "../Assets/card hand tutorial.png";
import commandZoneTutorial from "../Assets/command zone.png";
import deckTutorial from "../Assets/deck tutorial.png";
import generalTutorial from "../Assets/general photo - tut.png";
import manaTutorial from "../Assets/mana tutorial.png";
import mulliganTutorial from "../Assets/mulligan tutorial.png";
import offBoardTutorial from "../Assets/off board tut.png";
import cardCountersTutorial from "../Assets/other tutorial.png";
import phaseTutorial from "../Assets/phase tutorial.png";
import playerCountersTutorial from "../Assets/player counters tutorial.png";
import tapTutorial from "../Assets/tap tutorial.png";
import zoomTutorial from "../Assets/zoom tutorial.png";
import { useNavigate } from "react-router-dom";

export const Tutorial = () => {

    const [ seeButtons, setSeeButtons ] = useState<boolean>(false);
    const [ seeCardUse, setSeeCardUse ] = useState<boolean>(false);
    const [ seeZones, setSeeZones ] = useState<boolean>(false);
    const [ seeGameplay, setSeeGameplay ] = useState<boolean>(false);

    const navigate = useNavigate();

    const home = () => {
        navigate("/Home");
    }

    return (
        <div className="bg-cont" style={{ padding: "20px" }}>
            <button className="xbuttons" onClick={() => home()}>Home</button>
            <br></br><br></br>

            <img src={generalTutorial} style={{ width: "50%", marginBottom: "20px" }} alt="General Tutorial"/>
            <p>How does this game setup work?</p>

            <button className="xbuttons" onClick={() => setSeeGameplay(!seeGameplay)}>How to play?</button>
            <br></br>
            { seeGameplay && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", border: "1px solid lightgray", padding: "10px" }}> 
                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={deckTutorial} style={{ width: "100%" }} alt="Deck Tutorial"/>
                        <p>First: Draw your seven cards</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={mulliganTutorial} style={{ width: "100%" }} alt="Mulligan Tutorial"/>
                        <p>Then: Mulligan if you must, if you don't want to, make sure to pass!</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={phaseTutorial} style={{ width: "100%" }} alt="Phase Tutorial"/>
                        <p>From here, gameplay flows as normal. Use the phase tracker to remind yourself and your fellow players where you are at in your turn.</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={manaTutorial} style={{ width: "100%" }} alt="Mana Tutorial"/>
                        <p>Keep track of your mana in your mana pool for convenience.</p>
                    </div>
                    
                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={cardCountersTutorial} style={{ width: "100%" }} alt="Card Counters Tutorial"/>
                        <p>Update your creatures or your own counters!</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={playerCountersTutorial} style={{ width: "100%" }} alt="Player Counters Tutorial"/>
                        <p>Keep track of your lives and opponent lives. Any updates or your opponent makes will be shown to both of you.</p>
                        <p>Use the chat to make the game more interactive!</p>
                    </div>
                </div>
            )}

            <button className="xbuttons" onClick={() => setSeeButtons(!seeButtons)}>What are all of these buttons?</button>
            <br></br>
            { seeButtons && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", border: "1px solid lightgray", padding: "10px" }}> 
                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={manaTutorial} style={{ width: "100%" }} alt="Mana Tutorial"/>
                        <p>Control your mana. After you tap a land for mana or pay for a card using mana, you can change your mana count here to help for more accurate gameplay.</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={cardCountersTutorial} style={{ width: "50%" }} alt="Card Counters Tutorial"/>
                        <p>Control your cards. Add or remove counters as needed, exile, send to graveyard, or return to hand.</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={phaseTutorial} style={{ width: "100%" }} alt="Phase Tutorial"/>
                        <p>Keep track of your current phase! The phase displayed is the phase you are currently in. You will also be able to see what phase your opponent is in!</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={playerCountersTutorial} style={{ width: "100%" }} alt="Player Counters Tutorial"/>
                        <p>Keep track of any counters you may get. Make sure they're being accounted for separately.</p>
                    </div>
                </div>
            )}

            <button className="xbuttons" onClick={() => setSeeCardUse(!seeCardUse)}>How do I use my cards?</button>
            <br></br>
            {seeCardUse && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", border: "1px solid lightgray", padding: "10px" }}>
                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={deckTutorial} style={{ width: "100%" }} alt="Deck Tutorial"/>
                        <p>Click the top of your deck to draw cards one by one. Your count will lower as you draw more.</p>
                    </div>

                    <div style={{ flex: "1 1 10%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={mulliganTutorial} style={{ width: "100%" }} alt="Mulligan Tutorial"/>
                        <p>You may mulligan before the first round. If you do, your cards will go back to your deck but remember to draw one less this time or discard.</p>
                    </div>

                    <div style={{ flex: "1 1 20%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={handTutorial} style={{ width: "100%" }} alt="Hand Tutorial"/>
                        <p>Click on cards from your hand to put them on the board. If you make a mistake, there's always the option to bring it back to hand!</p>
                    </div>

                    <div style={{ flex: "1 1 20%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={tapTutorial} style={{ width: "100%" }} alt="Tap Tutorial"/>
                        <p>Click on any card on your side of the board to tap it.</p>
                    </div>

                    <div style={{ flex: "1 1 20%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={zoomTutorial} style={{ width: "100%" }} alt="Zoom Tutorial"/>
                        <p>Focus your mouse on any card on the board and you will get a closer view of it.</p>
                    </div>
                </div>
            )}

            <button className="xbuttons" onClick={() => setSeeZones(!seeZones)}>Zones?</button>
            <br></br>
            {seeZones && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", border: "1px solid lightgray", padding: "10px" }}> 
                    <div style={{ flex: "1 1 20%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={commandZoneTutorial} style={{ width: "50%" }} alt="Command Zone Tutorial"/>
                        <p>Your commander will sit in your command zone until it is played.</p>
                    </div>

                    <div style={{ flex: "1 1 20%", border: "1px solid lightgray", padding: "10px" }}>
                        <img src={offBoardTutorial} style={{ width: "100%" }} alt="Off Board Tutorial"/>
                        <p>Cards you send to graveyard or to exile sit underneath your board in separate piles.</p>
                    </div>
                </div>
            )}
        </div>
    )
}
