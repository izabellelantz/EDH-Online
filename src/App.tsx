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
import { ProvideAuth } from "./Auth/useAuth";
import { AddDeck } from "./Home/DeckUpload";
import { DeckPage } from "./Deck/Deck";

function App() {
  return (
    <ProvideAuth>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage/>}></Route>

          <Route path="/SignUp" element={<SignUpPage/>}></Route>

          <Route path="/LogIn" element={<LogInPage/>}></Route>

          <Route path="/DeckChange" element={<AddDeck/>}></Route>

          <Route path="/Home" element={<MainPage/>}></Route>

          <Route path="/Deck" element={<DeckPage/>}></Route>

          <Route path="/Play" element={<Play/>}></Route>
        </Routes>
      </Router>
    </ProvideAuth>
  )
}

export default App
