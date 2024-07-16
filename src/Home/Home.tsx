import { Link } from 'react-router-dom';
import classes from "../Home.module.css";

export function HomePage() {

    return (
        <>
            {/* <h1>EDH Online</h1> */}

            <div className={classes["landing-logo"]}></div>
        
            <div style={{ margin:"200px" }}>
                <Link to="/LogIn">
                    <button className={classes["login-button"]}>Log In</button>
                </Link>

                <Link to="/SignUp">
                    <button className={classes["signup-button"]}>Sign Up</button>
                </Link>
                
                <Link to="/About">
                    <button className={classes["about-button"]}>About</button>
                </Link>
            </div>
        </>
    );
}