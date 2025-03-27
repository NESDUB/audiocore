import React from 'react';
import styled, { css } from 'styled-components';

// Import specialized button components
import CircleButton from './CircleButton';
import IconButton from './IconButton';
import ToggleButton from './ToggleButton';
import UtilityButton from './UtilityButton';

// Base button styles
const buttonBase = css`
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  letter-spacing: 1px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Primary button - based on audiophile-action-btn
const PrimaryButton = styled.button`
  ${buttonBase}
  background-color: rgba(145, 242, 145, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.brand.primary};
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  border-radius: 4px;
  
  &:hover:not(:disabled) {
    background-color: rgba(145, 242, 145, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  ${({ small }) => small && css`
    padding: 6px 12px;
        font-size: ${({ theme }) => theme.typography.sizes.xs};
      `}
      
      ${({ alt }) => alt && css`
        background-color: ${({ theme }) => theme.colors.brand.primary};
        color: #000;
        
        &:hover:not(:disabled) {
          background-color: rgba(145, 242, 145, 0.8);
        }
      `}
    `;

    // Secondary button - based on audiophile-btn
    const SecondaryButton = styled.button`
      ${buttonBase}
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.colors.border.secondary};
      color: ${({ theme }) => theme.colors.text.primary};
      padding: 8px 16px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      border-radius: 4px;
      
      &:hover:not(:disabled) {
        border-color: ${({ theme }) => theme.colors.text.primary};
        background-color: rgba(255,255,255,0.03);
      }
      
      &:active:not(:disabled) {
        transform: scale(0.98);
      }
      
      ${({ small }) => small && css`
        padding: 6px 12px;
        font-size: ${({ theme }) => theme.typography.sizes.xs};
      `}
    `;

    // Text button - minimal, just text
    const TextButton = styled.button`
      ${buttonBase}
      background-color: transparent;
      border: none;
      color: ${({ theme }) => theme.colors.text.primary};
      padding: 6px 2px;
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 0;
        height: 1px;
        background-color: ${({ theme }) => theme.colors.text.primary};
        transition: width ${({ theme }) => theme.transitions.fast};
      }
      
      &:hover:not(:disabled) {
        color: ${({ theme }) => theme.colors.brand.primary};
        
        &::after {
          width: 100%;
          background-color: ${({ theme }) => theme.colors.brand.primary};
        }
      }
      
      &:active:not(:disabled) {
        transform: translateY(1px);
      }
      
      ${({ small }) => small && css`
        font-size: ${({ theme }) => theme.typography.sizes.xs};
      `}
    `;

    // Transport button (stop, reset) - based on audiophile-stop-btn
    const TransportButton = styled.button`
      ${buttonBase}
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.colors.border.secondary};
      color: ${({ theme }) => theme.colors.text.secondary};
      font-size: 18px;
      
      &:hover:not(:disabled) {
        border-color: ${({ theme }) => theme.colors.text.primary};
        color: ${({ theme }) => theme.colors.text.primary};
        background-color: rgba(255,255,255,0.03);
      }
      
      &:active:not(:disabled) {
        transform: scale(0.95);
      }
      
      ${({ active, theme }) => active && css`
        border-color: ${theme.colors.brand.primary};
        color: ${theme.colors.brand.primary};
      `}
      
      ${({ small }) => small && css`
        width: 32px;
        height: 32px;
        font-size: 14px;
      `}
      
      ${({ large }) => large && css`
        width: 48px;
        height: 48px;
        font-size: 22px;
      `}
    `;

    // Export all button components
    export {
      PrimaryButton,
      SecondaryButton,
      TextButton,
      TransportButton,
      CircleButton,
      IconButton,
      ToggleButton,
      UtilityButton
    };