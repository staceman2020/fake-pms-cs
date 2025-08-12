import React, { useState, useEffect } from "react";
import { UserContext } from "./UserHook";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("demo_username");
    if (stored) setUsernameState(stored);
  }, []);

  const setUsername = (name: string | null) => {
    setUsernameState(name);
    if (name) {
      localStorage.setItem("demo_username", name);
    } else {
      localStorage.removeItem("demo_username");
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};
