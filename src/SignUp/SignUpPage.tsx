import classes from "../InPages.module.css";

export function SignUpPage() {   
    return (
        <>
            <h1 style={{ fontSize:"30px", fontWeight:"bolder"}}>Create An Account!</h1>

            <form className={classes["signUpForm"]}>
                <div className={classes["formArea"]}>
                    <label className={classes["nameLabel"]}>Preferred Name:</label>
                    <input className={classes["nameInput"]}></input>
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["usernameLabel"]}>Username:</label>
                    <input className={classes["usernameInput"]}></input>
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordLabel"]}>Password:</label>
                    <input className={classes["passwordInput"]}></input>
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordRLabel"]}>Confirm Password:</label>
                    <input className={classes["passwordInput"]}></input>
                </div>

                <p></p>
                <button className={classes["formSubmit"]}>Register</button>
            </form>
        </>
    );
}