import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';

// Modal backdrop
const DialogBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Modal dialog
const DialogContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface.elevated};
  border-radius: 6px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// Dialog header
const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
`;

const DialogTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.darker};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

// Dialog content
const DialogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

// Shortcuts category section
const ShortcutSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.brand.primary};
`;

// Shortcuts table
const ShortcutsTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ShortcutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ShortcutAction = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ShortcutKeys = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const KeyCombo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const KeyCap = styled.span`
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  padding: 2px 6px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: 0 2px 0 ${({ theme }) => theme.colors.border.primary};
  min-width: 20px;
  text-align: center;
`;

const KeySeparator = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Dialog footer
const DialogFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.tertiary};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Shortcut key definitions
const shortcuts = [
  {
    category: 'Playback',
    items: [
      { action: 'Play/Pause', keys: [['Space']] },
      { action: 'Stop', keys: [['S']] },
      { action: 'Next Track', keys: [['N'], ['Alt', 'Right Arrow']] },
      { action: 'Previous Track', keys: [['P'], ['Alt', 'Left Arrow']] },
    ]
  },
  {
    category: 'Volume',
    items: [
      { action: 'Volume Up', keys: [['+'], ['Alt', 'Up Arrow']] },
      { action: 'Volume Down', keys: [['-'], ['Alt', 'Down Arrow']] },
      { action: 'Mute/Unmute', keys: [['M']] },
    ]
  },
  {
    category: 'Library',
    items: [
      { action: 'Toggle Shuffle', keys: [['H']] },
      { action: 'Toggle Repeat', keys: [['R']] },
      { action: 'Search', keys: [['Ctrl', 'F']] },
      { action: 'Show/Hide Filters', keys: [['F']] },
    ]
  }
];

const ShortcutsDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <DialogBackdrop onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <CloseButton onClick={onClose}>
            <Icon name="Close" size="18px" />
          </CloseButton>
        </DialogHeader>
        
        <DialogContent>
          {shortcuts.map(section => (
            <ShortcutSection key={section.category}>
              <SectionTitle>{section.category}</SectionTitle>
              <ShortcutsTable>
                {section.items.map(shortcut => (
                  <ShortcutRow key={shortcut.action}>
                    <ShortcutAction>{shortcut.action}</ShortcutAction>
                    <ShortcutKeys>
                      {shortcut.keys.map((combo, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <KeySeparator>or</KeySeparator>}
                          <KeyCombo>
                            {combo.map((key, j) => (
                              <React.Fragment key={j}>
                                {j > 0 && <KeySeparator>+</KeySeparator>}
                                <KeyCap>{key}</KeyCap>
                              </React.Fragment>
                            ))}
                          </KeyCombo>
                        </React.Fragment>
                      ))}
                    </ShortcutKeys>
                  </ShortcutRow>
                ))}
              </ShortcutsTable>
            </ShortcutSection>
          ))}
        </DialogContent>
        
        <DialogFooter>
          <FooterText>
            Press <KeyCap>?</KeyCap> anywhere to show this dialog
          </FooterText>
        </DialogFooter>
      </DialogContainer>
    </DialogBackdrop>
  );
};

export default ShortcutsDialog;