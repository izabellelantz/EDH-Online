import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import classes from "../Friends.module.css";
import axios from "axios";
import { useFriends } from "./FriendsContext";
import { useNavigate } from "react-router-dom";
import { socket } from "../Socket/Socket";

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
            <input name="friendSearch" className={classes["searchBar"]} ref={searchedUserRef} placeholder="Search for Friend" />
            <button className={classes["reqButton"]} type="submit">Send Request</button>
        </form>
    );
}

export function FriendRequests() {
    const { user } = useAuth();
    const { friends, fetchFriends, setFriends } = useFriends();
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
                fetchFriends();
            }
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    const declineFriendRequest = async (requester: string) => {
        try {
            const response = await axios.post('/friends/decline', {
                currUser: user?.name,
                friendUser: requester,
            });

            if (response.data.message) {
                console.log("Friend request declined:", requester);
                setFriendRequests(friendRequests.filter((req) => req !== requester));
            }
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <p style={{fontSize:"18px", fontWeight: "bold"}}>Friend Requests</p>
            {friendRequests.length === 0 ? (
                <p>No new friend requests</p>
            ) : (
                <ul style={{ padding: 0, margin: "0 auto", display: "inline-block", textAlign: "center" }}>
                    {friendRequests.map((requester, index) => (
                        <li key={index} style={{ listStyle:"none", margin: "10px 0"  }}>
                            <h3>{requester}</h3>
                            <button className={classes["friend-buttons"]} onClick={() => acceptFriendRequest(requester)}>Accept</button>
                            <button className={classes["friend-buttons"]} onClick={() => declineFriendRequest(requester)}>Decline</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function PendingRequests() {
    const { user } = useAuth();
    const [ pendingRequests, setPendingRequests ] = useState<string[]>([]);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await axios.get<{ pendingRequests: string[] }>('friends/pending', {
                    params: {
                        username: user?.name,
                    },
                });
                setPendingRequests(response.data.pendingRequests);
            } catch (error) {
                console.error("Error fetching pending requests: ", error);
            }
        };

        if (user?.name) {
            fetchPending();
        }
    }, [user?.name]);

    const unsendRequest = async (friendName: string) => {
        try {
            const response = await axios.post("/friends/unsendRequest", {
                username: user?.name,
                friendName,
            });

            if (response.data.message) {
                console.log("Friend request unsent:", friendName);
                setPendingRequests(pendingRequests.filter((req) => req !== friendName));
            }

        } catch (e) {
            console.log("Error unsending request: ", e);
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>Pending Requests</p>
            {pendingRequests.length === 0 ? (
            <p>No pending requests!</p>
        ) : (
            <ul style={{ padding: 0, margin: "0 auto", display: "inline-block", textAlign: "center" }}>
                {pendingRequests.map((pendingRequest, index) => (
                    <li key={index} style={{ listStyle: "none", margin: "10px 0" }}>
                        <p>{pendingRequest}</p>
                        <button className={classes["friend-buttons"]} onClick={() => unsendRequest(pendingRequest)}>Unsend</button>
                    </li>
                ))}
            </ul>
        )}
    </div>

    );
}

export function FriendsList() {
    const { user } = useAuth();
    const { friends, fetchFriends, setFriends } = useFriends();
    const [pendingInvites, setPendingInvites] = useState<string[]>([]);
    const [receivedInvites, setReceivedInvites] = useState<string[]>([]);
    const [acceptedInvites, setAcceptedInvites] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        if (user?.name) {
            fetchFriends();
        }
    }, [user?.name]);

    const UnaddFriend = async ( friendUser: string ) => {        
        try {
            const response = await axios.post('/friends/unadd', {
                currUser: user?.name,
                friendUser,
            });
    
            if (response.data.message) {
                console.log("Friend unadded:", friendUser);
                setFriends(friends.filter((req) => req !== friendUser));

                fetchFriends();
            }
        } catch (error) {
            console.error("Error unadding friend:", error);
        }
    };

    const BlockFriend = async ( friendUser: string ) => {
        try {
            const response = await axios.post("/friends/block", {
                currUser: user?.name,
                friendUser,
            });

            if (response.data.message) {
                console.log("Friend blocked:", friendUser);
                setFriends(friends.filter((req) => req !== friendUser));

                fetchFriends();
            }
        } catch (error) {
            console.error("Error blocking friend:", error);
        }
    };

    const InviteToGame = async (friendUser: string) => {
        try {    
            const response = await axios.post("/friends/inviteToGame", {
                username: user?.name,
                friendUser,
            });
    
            if (response.data.message) {
                console.log("Friend Invited: ", friendUser);
                setPendingInvites((prev: string[]) => [...prev, friendUser]); // Add to pendingInvites
            }
        } catch (error) {
            console.error("Error inviting friend:", error);
        }
    };

    const acceptGameInvite = async (friendUser: string) => {
        try {
            const response = await axios.post('/friends/acceptGameInvite', {
                currUser: user?.name,
                friendUser,
            });

            const generatedRoomCode = `${user?.name}-${friendUser}`;
            console.log("Room Code:", generatedRoomCode);


            if (response.data.message) {
                console.log("Game invite accepted from:", friendUser);
                setReceivedInvites(receivedInvites.filter((invite) => invite !== friendUser));

                socket.emit('joinRoom', generatedRoomCode, user?.name, (response: { msg: string }) => {
                    console.log(response.msg);
                    // Redirect to waiting room
                    navigate(`/WaitingRoom/${generatedRoomCode}`);
                });
            }
        } catch (error) {
            console.error("Error accepting game invite:", error);
        }
    };

    const declineGameInvite = async (friendUser: string) => {
        try {
            const response = await axios.post('/friends/declineGameInvite', {
                currUser: user?.name,
                friendUser,
            });

            if (response.data.message) {
                console.log("Game invite declined from:", friendUser);
                setReceivedInvites(receivedInvites.filter((invite) => invite !== friendUser));
            }
        } catch (error) {
            console.error("Error declining game invite:", error);
        }
    };

    const joiningFriend = async (friendName: string) => {
        const response = await axios.post('/friends/joinedFriend', {
            username: user?.name,
            friendName,
        });

        if (response.data.message) {
            console.log("Friend joined");
            setAcceptedInvites(receivedInvites.filter((invite) => invite !== friendName));
        }

        navigate(`/WaitingRoom/${friendName}-${user?.name}`);
    };

    useEffect(() => {
        const fetchInvites = async () => {
            try {
                const response = await axios.get<{ receivedInvites: string[] }>('/friends/gameInvites', {
                    params: {
                        username: user?.name,
                    },
                });
                setReceivedInvites(response.data.receivedInvites);
            } catch (error) {
                console.error("Error fetching pending requests: ", error);
            }
        };

        if (user?.name) {
            fetchInvites();
        }
    }, [user?.name]);

    useEffect(() => {
        const fetchAccepted = async () => {
            try {
                const response = await axios.get<{ acceptedInvites: string[] }>('/friends/friendAcceptedInvite', {
                    params: {
                        username: user?.name,
                    },
                });

                setAcceptedInvites(response.data.acceptedInvites);

            } catch (error) {
                console.error("Error fetching accepted invites: ", error);
            }
        };

        if (user?.name && acceptedInvites.length >= 0) {
            fetchAccepted();
        }
    }, [user?.name]);

    return (
        <>
            <p style={{fontSize:"18px", fontWeight: "bold"}}>Friends</p>
            {friends.length === 0 ? (
                <p>No friends yet! Add some now to begin playing</p>
            ) : (
                <ul className={classes["friendsList"]}>
                    {friends.map((friend, index) => (
                        <span style={{ boxShadow: "none", alignSelf:"center"}} key={index}>
                            <p className={classes["friendInfo"]}>{friend}</p>
                            <button className={classes["friend-buttons"]} onClick={() => UnaddFriend(friend)}>Unadd</button>
                            <button className={classes["friend-buttons"]} onClick={() => BlockFriend(friend)}>Block</button>
                            <button
                                className={classes["friend-buttons"]}
                                onClick={() => InviteToGame(friend)}
                                disabled={pendingInvites.includes(friend)} // Disable if invite is pending
                            >
                                {pendingInvites.includes(friend) ? "Pending..." : "Invite"}
                            </button>
                            {receivedInvites.includes(friend) && (
                                <div className={classes["inviteActions"]}>
                                    <p>You have a game invite from {friend}:</p>
                                    <button className={classes["friend-buttons"]} onClick={() => acceptGameInvite(friend)}>Accept</button>
                                    <button className={classes["friend-buttons"]} onClick={() => declineGameInvite(friend)}>Decline</button>
                                </div>
                            )}

                            {acceptedInvites.includes(friend) && (
                                <div className={classes["gameReady"]}>
                                    <p>{friend} accepted your invite!</p>
                                    <button className={classes["friend-buttons"]} onClick={() => joiningFriend(friend)}>Join</button>
                                </div>
                            )}
                        </span>
                    ))}
                </ul>
            )}
        </>
    );
}
