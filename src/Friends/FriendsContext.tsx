import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '../Auth/useAuth';

interface FriendsContextType {
    friends: string[],
    fetchFriends: () => void,
    setFriends: React.Dispatch<React.SetStateAction<string[]>>
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
};

interface FriendsProviderProps {
    children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<string[]>([]);

    const fetchFriends = async () => {
        if (user?.name) {
            try {
                const response = await axios.get<{ friends: string[] }>('/friends/list', {
                    params: { username: user.name },
                });
                setFriends(response.data.friends);
            } catch (error) {
                console.error("Error fetching friends: ", error);
            }
        }
    };

    useEffect(() => {
        fetchFriends();
    }, [user?.name]);

    return (
        <FriendsContext.Provider value={{ friends, fetchFriends, setFriends }}>
            {children}
        </FriendsContext.Provider>
    );
};
