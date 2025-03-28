// src/features/contextmenu/providers/ContextMenuProvider.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Menu from '../../../components/common/Dropdown/Menu';
import ContextMenuContext from '../ContextMenuContext';

const ContextMenuProvider = ({ children }) => {
  const [menuConfig, setMenuConfig] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    items: [],
    contextData: null,
  });

  // Handle opening a menu
  const openMenu = useCallback((items, position, contextData = null) => {
    setMenuConfig({
      isOpen: true,
      position,
      items,
      contextData,
    });
  }, []);

  // Handle closing the menu
  const closeMenu = useCallback(() => {
    setMenuConfig(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuConfig.isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuConfig.isOpen, closeMenu]);

  // Handle selection
  const handleSelect = useCallback((item) => {
    if (item.onClick) {
      item.onClick(menuConfig.contextData);
    }
    
    if (!item.keepOpen) {
      closeMenu();
    }
  }, [menuConfig.contextData, closeMenu]);

  // Context value
  const contextValue = {
    openMenu,
    closeMenu,
    contextData: menuConfig.contextData,
  };

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      
      {/* Render the actual menu */}
      <Menu
        isOpen={menuConfig.isOpen}
        items={menuConfig.items}
        position="fixed"
        top={`${menuConfig.position.y}px`}
        left={`${menuConfig.position.x}px`}
        onClose={closeMenu}
        onSelect={handleSelect}
      />
    </ContextMenuContext.Provider>
  );
};

export default ContextMenuProvider;