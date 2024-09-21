import { Link } from 'react-router-dom';
import classes from "../Home.module.css";
import demoPic from "../Assets/real edh main.png";

export function HomePage() {

    return (
        <div className={classes["mainpg-cont"]}>
            {/* <h1>EDH Online</h1> */}

            <div style={{ margin:"0px auto", alignSelf:"center" }}>
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


            <div className={classes["landing-logo"]}>
                <img src={demoPic}
                style={{ border:"none", boxShadow:"none" }}></img>
            </div>
    
        </div>
    );
}