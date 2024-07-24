import { FormEvent, useRef } from "react";
import classes from "../InPages.module.css";
import axios from "axios";
import { useAuth } from "../Auth/useAuth";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
    jwt: string;
}

export function LogInPage() {
    const { setUser } = useAuth();
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    let navigate = useNavigate();
    
    const logIn = async (e: FormEvent) => {
        e.preventDefault();
        const username = usernameRef.current!.value;
        const password = passwordRef.current!.value;
        try {
            const user = await axios.post<LoginResponse>("/login", {
                username,
                password,
            });
            if (user.data.jwt) {
                setUser({ name: username, authToken: user.data.jwt });
                localStorage.setItem('jwt', user.data.jwt);
                console.log(user.data.jwt);
                navigate("/Home");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };
    
    return (
        <>
            <h1 style={{ fontSize:"30px", fontWeight:"bolder"}}>Log In</h1>

            <form className={classes["signUpForm"]} onSubmit={logIn}>
                <div className={classes["formArea"]}>
                    <label className={classes["usernameLabel"]}>Username:</label>
                    <input name="username" ref={usernameRef} autoComplete="username" className={classes["usernameInput"]}/>
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordLabel"]}>Password:</label>
                    <input name="password" type="password" ref={passwordRef} autoComplete="current-password" className={classes["passwordInput"]}/>
                </div>

                <button type="submit" className={classes["formSubmit"]}>Continue</button>
            </form>
        </>
    );
}