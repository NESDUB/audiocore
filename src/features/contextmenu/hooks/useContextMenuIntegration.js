// src/features/contextmenu/hooks/useContextMenuIntegration.js
import { useCallback } from 'react';
import { useContextMenu } from '../providers/ContextMenuProvider';

/**
 * Hook for integrating context menu into any component
 * 
 * @param {Function} getMenuItems - Function that returns menu items based on contextData
 * @returns {Object} handlers and state for context menu
 */
const useContextMenuIntegration = (getMenuItems) => {
  const { openMenu } = useContextMenu();
  
  const handleContextMenu = useCallback((e, contextData = null) => {
    e.preventDefault();
    
    // Get menu items based on the context data
    const items = getMenuItems(contextData);
    
    // Open the menu at the mouse position
    openMenu(items, { x: e.clientX, y: e.clientY }, contextData);
  }, [openMenu, getMenuItems]);
  
  return {
    handleContextMenu,
  };
};

export default useContextMenuIntegration;