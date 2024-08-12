import { useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import axios from "axios";

export function FriendsList() {
    const { user } = useAuth();
    const [ friends, setFriends ] = useState([""]);
    
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get<{ friends: [] }>(`/friends/list/${user?.name}`);
                setFriends(response.data.friends);
            } catch (error) {
                console.error('Error fetching friends: ', error);
            }
        };

        fetchFriends();
    }, [user?.name]);

    return (
        <>
            <h2>Friends</h2>
            {friends.length === 0 ? (
                <p>No friends yet! Add some now to begin playing</p>
            ) : (
                <ul>
                    {friends.map((friend, index) => (
                        <li key={index}>
                            <h2>{friend}</h2>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}