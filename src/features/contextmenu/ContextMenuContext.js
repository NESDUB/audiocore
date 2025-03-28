// src/features/contextmenu/ContextMenuContext.js
import { createContext, useContext } from 'react';

// Create the context
const ContextMenuContext = createContext();

// Create the custom hook to use the context
export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

export default ContextMenuContext;