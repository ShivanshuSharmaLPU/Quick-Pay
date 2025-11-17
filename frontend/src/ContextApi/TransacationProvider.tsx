// TransactionContext.tsx
import React, { createContext, useContext, useState } from "react";

type TransactionContextType = {
  receiver: string;
  amount: number;
  setReceiver: (receiver: string) => void;
  setAmount: (amount: number) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [receiver, setReceiver] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  return (
    <TransactionContext.Provider value={{ receiver, amount, setReceiver, setAmount }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};
