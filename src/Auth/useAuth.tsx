import { createContext, useContext, useState } from "react";

interface User {
    preferredName: string;
    name: string;
    authToken?: string;
}

interface AuthContext {
    user: User | null;
    setUser: (user: User | null ) => void;
}

const AuthContext = createContext<AuthContext>({
    user: null,
    setUser: () => {},
});

const useProvideAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    return { user, setUser };
};

export function ProvideAuth({ children }: { children: JSX.Element }) {
    const auth = useProvideAuth();
    return <AuthContext.Provider value={auth}> {children}</AuthContext.Provider>;
}

export const useAuth = () => {
    return useContext(AuthContext);
};