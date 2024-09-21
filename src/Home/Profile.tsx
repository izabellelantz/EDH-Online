import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";

export function ProfilePage() {
    const { user } = useAuth();
    let navigate = useNavigate();
    const [blockList, setBlockList] = useState<string[]>([]);
    
    useEffect(() => {
        async function fetchBlockList() {
            try {
                const response = await fetch(`/blockList?username=${user?.name}`);
                const data = await response.json();
                setBlockList(data.blockList);
            } catch (error) {
                console.error("Error fetching block list:", error);
            }
        }
        
        if (user?.name) {
            fetchBlockList();
        }
    }, [user?.name]);

    const handleUnblock = async (friendUser: string) => {
        try {
            await fetch("/blockList/unblock", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currUser: user?.name, friendUser }),
            });
            // Refresh block list after unblocking
            setBlockList(blockList.filter(user => user !== friendUser));
        } catch (error) {
            console.error("Error unblocking user:", error);
        }
    };

    const backtoHome = () => {
        navigate("/Home");
    }

    return (
        <>
            <div className="bg-cont">
                <button className="xbuttons" onClick={backtoHome}>Home</button>
                <p style={{ borderTop:"1px solid lightgray", borderBottom:"1px solid lightgray", padding:"10px" }}>Preferred Name: {user?.preferredName}</p>
                <p style={{ borderBottom:"1px solid lightgray", paddingBottom:"10px"  }}>Username: {user?.name}</p>
                
                <h3>Block List</h3>
                {blockList.length === 0 ? (
                    <p>No blocked users.</p>
                ) : (
                    <ul style={{ padding: 0, margin: "0 auto", display: "inline-block", textAlign: "center" }}>
                        {blockList.map((blockedUser, index) => (
                            <li key={index} style={{ listStyle:"none", margin: "10px 0", backgroundColor:"white", borderRadius:"10px", padding: "5px" }}>
                                <p>{blockedUser}</p>
                                <button className="friend-buttons" style={{ border:"1px solid lightgray" }} onClick={() => handleUnblock(blockedUser)}>Unblock</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
