import classes from "../InPages.module.css";

export function LogInPage() {
    return (
        <>
            <h1 style={{ fontSize:"30px", fontWeight:"bolder"}}>Log In</h1>

            <form className={classes["signUpForm"]}>
                <div className={classes["formArea"]}>
                    <label className={classes["usernameLabel"]}>Username:</label>
                    <input className={classes["usernameInput"]}></input>
                </div>

                <div className={classes["formArea"]}>
                    <label className={classes["passwordLabel"]}>Password:</label>
                    <input className={classes["passwordInput"]}></input>
                </div>

                <button className={classes["formSubmit"]}>Continue</button>
            </form>
        </>
    );
}