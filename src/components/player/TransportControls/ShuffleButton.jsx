import React from 'react';
import styled from 'styled-components';
import { Shuffle } from 'lucide-react';

const ShuffleButton = ({ active = false, onClick }) => {
  return (
    <ShuffleButtonContainer 
      active={active} 
      onClick={onClick}
      aria-label={active ? "Disable shuffle" : "Enable shuffle"}
      aria-pressed={active}
    >
      <Shuffle size={16} />
    </ShuffleButtonContainer>
  );
};

const ShuffleButtonContainer = styled.button`
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

export default ShuffleButton;