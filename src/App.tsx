import "react";
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { HomePage } from "./Home/Home";
import { SignUpPage } from "./SignUp/SignUpPage";
import { LogInPage } from "./LogIn/LogInPage";
import { Play } from "./Play/Play";
import { MainPage } from "./MainPage";
import { AddDeck, DeckAddingTutorial } from "./Home/DeckUpload";
import { DeckPage } from "./Deck/Deck";
import { RoomSelection, WaitingRoom } from "./Play/JoinRoom";
import { ProfilePage } from "./Home/Profile";
import { About } from "./About/AboutPage";
import { Tutorial } from "./Home/Tutorial";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}></Route>

        <Route path="/SignUp" element={<SignUpPage/>}></Route>

        <Route path="/LogIn" element={<LogInPage/>}></Route>

        <Route path="/DeckChangingTutorial" element={<DeckAddingTutorial/>}></Route>

        <Route path="/About" element={<About/>}></Route>

        <Route path="/DeckChange" element={<AddDeck/>}></Route>

        <Route path="/Home" element={<MainPage/>}></Route>

        <Route path="/HowTo" element={<Tutorial/>}></Route>

        <Route path="/Profile" element={<ProfilePage/>}></Route>

        <Route path="/Deck" element={<DeckPage/>}></Route>

        <Route path="/SelectRoom" element={<RoomSelection />} />

        <Route path="/WaitingRoom/:roomCode" element={<WaitingRoom />} />

        <Route path="/Play/:roomCode" element={<Play />} />
      </Routes>
    </Router>
  )
}

export default App
