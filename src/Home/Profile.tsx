import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";

export function ProfilePage() {
    const { user } = useAuth();
    let navigate = useNavigate();

    const backtoHome = () => {
        navigate("/Home");
    }

    return (
        <>
            <div>
                <button className="xbuttons" onClick={backtoHome}>Home</button>
                <p>Preferred Name: {user?.preferredName}</p>
                <p>Username: {user?.name}</p>
                
            </div>
        </>
    );
}