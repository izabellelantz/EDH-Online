import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import axios from "axios";

export function AddFriend() {
    const { user } = useAuth();
    const searchedUserRef = useRef<HTMLInputElement>(null);

    const searchForFriend = async (e: FormEvent) => {
        e.preventDefault();
        
        const searchedUser = searchedUserRef.current?.value;

        if (!searchedUser) {
            console.error("Search input is empty");
            return;
        }

        try {
            console.log(user?.name, searchedUser);
            const response = await axios.post('/friends/request', {
                currUser: user?.name,
                searchedUser,
            });

            if (response.data.message) {
                console.log("Request Sent: ", response.data.message);
            }
        } catch (error) {
            console.error("Error adding friend: ", error);
        }
    };

    return (
        <form onSubmit={searchForFriend}>
            <input name="friendSearch" ref={searchedUserRef} placeholder="Search for Friend" />
            <button type="submit">Search</button>
        </form>
    );
}

export function FriendRequests() {
    const { user } = useAuth();
    const [friendRequests, setFriendRequests] = useState<string[]>([]);
    
    useEffect(() => {

        const fetchFriendRequests = async () => {
            try {
                const response = await axios.get<{ friendRequests: string[] }>(`/friends/requests/${user?.name}`);
                setFriendRequests(response.data.friendRequests);
            } catch (e) {
                console.error("Error fetching friend requests: ", e);
            }
        };

        if (user?.name) {
            fetchFriendRequests();
        }
    }, [user?.name]);

    const acceptFriendRequest = async (requester: string) => {
        try {
            const response = await axios.post('/friends/accept', {
                currUser: user?.name,
                requester,
            });

            if (response.data.message) {
                console.log("Friend request accepted:", requester);
                setFriendRequests(friendRequests.filter((req) => req !== requester));
            }
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    return (
        <>
            <h2>Friend Requests</h2>
            {friendRequests.length === 0 ? (
                <p>No new friend requests</p>
            ) : (
                <ul>
                    {friendRequests.map((requester, index) => (
                        <li key={index}>
                            <h3>{requester}</h3>
                            <button onClick={() => acceptFriendRequest(requester)}>Accept</button>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}


export function FriendsList() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<string[]>([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await axios.get<{ friends: string[] }>('/friends/list', {
                    params: {
                        username: user?.name,
                    },
                });
                setFriends(response.data.friends);
            } catch (error) {
                console.error("Error fetching friends: ", error);
            }
        };

        if (user?.name) {
            fetchFriends();
        }
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
