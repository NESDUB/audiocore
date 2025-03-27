import React from 'react';
import styled from 'styled-components';
import { Play, Pause } from 'lucide-react';

const PlayPauseButton = ({ isPlaying = false, onClick, disabled = false }) => {
  return (
    <PlayButton
      onClick={onClick}
      disabled={disabled}
      aria-label={isPlaying ? "Pause" : "Play"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Pause size={24} />
      ) : (
        <Play size={24} className="ml-1" />
      )}
    </PlayButton>
  );
};

const PlayButton = styled.button`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #91F291;
  color: #000000;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease-out;
  opacity: ${props => props.disabled ? 0.7 : 1};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  /* Center the play icon (which has a visual offset) */
  .ml-1 {
    margin-left: 2px;
  }
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    background-color: #A0FFA0;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(145, 242, 145, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

export default PlayPauseButton;