import "react";
import { CardDisp } from "../Common/types";
import classes from "../Card.module.css";

export function DrawDisplay({ name, image}: CardDisp) {
    return (
        <div className={classes["top-card"]}>
            <img src={image} alt={name}></img>
        </div>
    );
};

export function PlayedDisplay({ name, image }: CardDisp) {
    return (
        <div className={classes["placed-card"]}>
            <img src={image} alt={name}></img>
        </div>
    );
};