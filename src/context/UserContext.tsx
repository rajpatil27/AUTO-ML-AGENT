import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  taskRunsUsed: number;
  maxTaskRuns: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  upgradeToPremium: () => void;
  incrementTaskRuns: () => void;
  canRunTask: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  isPremium: false,
  taskRunsUsed: 0,
  maxTaskRuns: 3,
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);

  const upgradeToPremium = () => {
    if (user) {
      setUser({
        ...user,
        isPremium: true,
        maxTaskRuns: Infinity,
      });
    }
  };

  const incrementTaskRuns = () => {
    if (user && !user.isPremium) {
      setUser({
        ...user,
        taskRunsUsed: user.taskRunsUsed + 1,
      });
    }
  };

  const canRunTask = () => {
    if (!user) return false;
    return user.isPremium || user.taskRunsUsed < user.maxTaskRuns;
  };

  return (
    <UserContext.Provider value={{ user, setUser, upgradeToPremium, incrementTaskRuns, canRunTask }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};