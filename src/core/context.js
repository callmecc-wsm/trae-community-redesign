import { createContext, useContext } from "react";

// Keep context identity independent of UI modules during hot reload.
export const CommunityContext = createContext(null);
export const useApp = () => useContext(CommunityContext);
