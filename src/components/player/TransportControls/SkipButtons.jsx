import React from 'react';
import styled from 'styled-components';
import { SkipBack, SkipForward } from 'lucide-react';

const SkipButtons = ({ onSkipPrevious, onSkipNext, disabled = false }) => {
  return (
    <SkipButtonsContainer>
      <SkipButton
        onClick={onSkipPrevious}
        disabled={disabled}
        aria-label="Previous track"
        direction="previous"
      >
        <SkipBack size={18} />
      </SkipButton>
      
      <SkipButton
        onClick={onSkipNext}
        disabled={disabled}
        aria-label="Next track"
        direction="next"
      >
        <SkipForward size={18} />
      </SkipButton>
    </SkipButtonsContainer>
  );
};

const SkipButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SkipButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: #E0E0E0;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-out;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(145, 242, 145, 0.4);
  }
`;

export default SkipButtons;