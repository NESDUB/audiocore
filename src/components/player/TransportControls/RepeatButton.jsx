import React from 'react';
import styled from 'styled-components';
import { Repeat, Repeat1 } from 'lucide-react';

// RepeatMode can be: 'off', 'all', 'one'
const RepeatButton = ({ mode = 'off', onClick }) => {
  // Get the correct icon and aria-label based on current mode
  const getNextMode = () => {
    switch (mode) {
      case 'off': return 'all';
      case 'all': return 'one';
      case 'one': return 'off';
      default: return 'off';
    }
  };
  
  const getAriaLabel = () => {
    switch (mode) {
      case 'off': return 'Enable repeat all';
      case 'all': return 'Enable repeat one';
      case 'one': return 'Disable repeat';
      default: return 'Toggle repeat mode';
    }
  };
  
  const active = mode !== 'off';
  
  return (
    <RepeatButtonContainer 
      active={active} 
      onClick={onClick}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
      data-next-mode={getNextMode()}
    >
      {mode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
    </RepeatButtonContainer>
  );
};

const RepeatButtonContainer = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props => props.active 
    ? 'rgba(145, 242, 145, 0.1)' 
    : 'transparent'};
  color: ${props => props.active 
    ? '#91F291' 
    : '#888888'};
  border: none;
  cursor: pointer;
  transition: all 0.15s ease-out;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${props => props.active ? '#91F291' : '#E0E0E0'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(145, 242, 145, 0.4);
  }
`;

export default RepeatButton;