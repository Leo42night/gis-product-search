/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react';

// Create a context
const MyContext = createContext<any>(null);

// Provider component
export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const [scannedValue, setScannedValue] = useState<string | number | null>(null);

  const updateScannedValue = (value: string) => {
    setScannedValue(value);
  };

  return (
    <MyContext.Provider value={{ scannedValue, updateScannedValue }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom hook to use the scanner context
export const useMyContext = () => useContext(MyContext);
