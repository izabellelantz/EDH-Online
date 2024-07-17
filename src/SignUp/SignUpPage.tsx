import { FormEvent, useEffect, useState } from "react";
import classes from "../InPages.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";

interface RegistrationResponse {
    userCreated: string;
    jwt: string;
}

export function SignUpPage() {
    const { setUser } = useAuth();
    const [preferredName, setPreferredName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordsMatch, setPasswordsMatch] = useState(false);

    let navigate = useNavigate();

    const registerUser = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post<RegistrationResponse>("/register", {
                username,
                password,
            });
            if (response.data.userCreated) {
                console.log(`created user ${response.data.userCreated}`);
                
                if (response.data.jwt) {
                    setUser({ name: username, authToken: response.data.jwt });
                }

                navigate("/Home");
            } else {
                console.log("User creation failed or no response data.");
            }
        } catch (e) {
            console.error("Error registering user:", e);
        }
    };
    const checkPasswords = () => {
        setPasswordsMatch(password === confirmPassword);
    };
    useEffect(() => checkPasswords(), [password, confirmPassword]);
       
    return (
        <>
            <h1 style={{ fontSize:"30px", fontWeight:"bolder"}}>Create An Account!</h1>

            <form className={classes["signUpForm"]}>
                <div className={classes["formArea"]}>
                    <label className={classes["nameLabel"]}>Preferred Name:</label>
                    <input 
                        className={classes["nameInput"]}
                        name="preferred-name"
                        onChange={(e) => setPreferredName(e.target.value)}
                    />
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["usernameLabel"]}>Username:</label>
                    <input 
                        className={classes["usernameInput"]}
                        name="username"
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordLabel"]}>Password:</label>
                    <input
                        className={classes["passwordInput"]}
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordRLabel"]}>Confirm Password:</label>
                    <input
                        className={classes["passwordInput"]}
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <p></p>
                <button className={classes["formSubmit"]} onClick={registerUser} disabled={!passwordsMatch}>Register</button>
            </form>
        </>
    );
}