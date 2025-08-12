import { createContext, useContext } from "react";
interface UserContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
