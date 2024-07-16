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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>}></Route>

        <Route path="/SignUp" element={<SignUpPage/>}></Route>

        <Route path="/LogIn" element={<LogInPage/>}></Route>

        <Route path="/Home" element={<MainPage/>}></Route>

        <Route path="/Play" element={<Play/>}></Route>
      </Routes>
    </Router>
  )
}

export default App
