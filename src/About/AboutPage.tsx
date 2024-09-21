import { useNavigate } from "react-router-dom"

export const About = () => {
    const navigation = useNavigate();

    const goHome = () => {
        navigation('/');
    }
    return (
        <div className="bg-cont">
            <p>EDH Online is in no way affiliated with WOTC. This website is unofficial fan content, created for fans to have a convenient place to play online.</p>

            <div className="bg-cont" style={{ border:"1px solid lightgray", boxShadow:"1px 2px 1px lightgray" }}>
                <p>EDH is a popular fan-created format of Magic the Gathering. Your deck should consist of 99 cards and one commander. The lands equal mana, and may be tapped to pay for other cards.</p>
                <p>Play other cards to defeat your opponents and attempt to win the game!</p>
            </div>

<br></br>
            <div className="bg-cont" style={{ border:"1px solid lightgray", boxShadow:"1px 2px 1px lightgray" }}>
                <p>In this verson of EDH, it is similar to paper magic. Buttons are available to help guide gameplay, but it is on you and your fellow players to decide what moves are and are not allowed.</p>

                <p>In game messaging is available and encouraged! It may make manual play easier to follow.</p>

                <p>Create an account, upload your deck (or use the one provided), add your friends, and begin playing immediately!</p>
            </div>

            <button className="xbuttons" onClick={() => goHome()}>Home</button>
        </div>
    )
}