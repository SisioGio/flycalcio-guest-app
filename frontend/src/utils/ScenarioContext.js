// src/context/ScenarioContext.jsx
import { createContext, useContext, useState } from "react";

const ScenarioContext = createContext(null);
const SCENARIO_STORAGE_KEY = 'finance-selected-scenario';

export const useScenario = () => {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error("useScenario must be used inside ScenarioProvider");
  }
  return ctx;
};

export const ScenarioProvider = ({ children }) => {
  // Load saved scenario from localStorage on initial mount
  const [scenarioId, setScenarioIdState] = useState(() => {
    const saved = localStorage.getItem(SCENARIO_STORAGE_KEY);
    return saved || null;
  });

  // Wrapper function to save to localStorage when scenario changes
  const setScenarioId = (id) => {
    setScenarioIdState(id);
    if (id) {
      localStorage.setItem(SCENARIO_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(SCENARIO_STORAGE_KEY);
    }
  };

  return (
    <ScenarioContext.Provider value={{ scenarioId, setScenarioId }}>
      {children}
    </ScenarioContext.Provider>
  );
};
