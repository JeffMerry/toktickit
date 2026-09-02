import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface Requester {
  id: number;
  name: string;
  email: string;
  department?: string;
}

interface RequesterContextType {
  selectedRequester: Requester | null;
  setSelectedRequester: (requester: Requester | null) => void;
  clearRequester: () => void;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'toktickit_selected_requester';

export const RequesterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRequester, setSelectedRequesterState] = useState<Requester | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved requester:', e);
      }
    }
    return null;
  });

  const setSelectedRequester = (requester: Requester | null) => {
    setSelectedRequesterState(requester);
    if (requester) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requester));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const clearRequester = () => {
    setSelectedRequester(null);
  };

  return (
    <RequesterContext.Provider value={{ selectedRequester, setSelectedRequester, clearRequester }}>
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = (): RequesterContextType => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error('useRequester must be used within a RequesterProvider');
  }
  return context;
};
