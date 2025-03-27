import React from 'react';
import styled, { css } from 'styled-components';

/**
 * Title component for headings and titles throughout the application
 * Provides multiple variants and customization options in the AudiophileConsole style
 */

// Base styles for all title variants
const baseTitleStyles = css`
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  font-weight: ${({ weight, theme }) => {
    if (weight === 'regular') return theme.typography.weights.regular;
    if (weight === 'medium') return theme.typography.weights.medium;
    if (weight === 'bold') return theme.typography.weights.bold;
    return weight || theme.typography.weights.medium;
  }};
  letter-spacing: ${({ spacing }) => spacing || '0'};
  line-height: 1.2;
  transition: color ${({ theme }) => theme.transitions.fast};
  
  /* Optional styling based on props */
  ${({ uppercase }) => uppercase && 'text-transform: uppercase;'}
  ${({ center }) => center && 'text-align: center;'}
  ${({ right }) => right && 'text-align: right;'}
  ${({ noWrap }) => noWrap && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  ${({ opacity }) => opacity !== undefined && `opacity: ${opacity};`}
  ${({ margin }) => margin && `margin: ${margin};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  ${({ maxWidth }) => maxWidth && `max-width: ${maxWidth};`}
  
  /* Truncate text after specified lines */
  ${({ truncate }) => truncate && `
    display: -webkit-box;
    -webkit-line-clamp: ${typeof truncate === 'number' ? truncate : 1};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

// Main title container with support for different variants
const StyledTitle = styled.h1`
  ${baseTitleStyles}
  
  /* Size variants - default is main */
  ${({ variant, size, theme }) => {
    // If explicit size is provided, use it
    if (size) return `font-size: ${size};`;
    
    // Otherwise, use variant sizes
    switch (variant) {
      case 'hero':
        return `
          font-size: 32px;
          letter-spacing: 3px;
          margin-bottom: ${theme.spacing.lg};
          font-weight: ${theme.typography.weights.medium};
        `;
      case 'main':
        return `
          font-size: 24px;
          letter-spacing: 2px;
          margin-bottom: ${theme.spacing.md};
          font-weight: ${theme.typography.weights.medium};
        `;
      case 'section':
        return `
          font-size: 20px;
          letter-spacing: 1.5px;
          margin-bottom: ${theme.spacing.sm};
          font-weight: ${theme.typography.weights.medium};
        `;
      case 'subsection':
        return `
          font-size: 16px;
          letter-spacing: 1px;
          margin-bottom: ${theme.spacing.sm};
          font-weight: ${theme.typography.weights.medium};
        `;
      case 'item':
        return `
          font-size: 14px;
          letter-spacing: 0.8px;
          margin-bottom: ${theme.spacing.xs};
          font-weight: ${theme.typography.weights.medium};
        `;
      default:
        return `
          font-size: 24px;
          letter-spacing: 2px;
          margin-bottom: ${theme.spacing.md};
          font-weight: ${theme.typography.weights.medium};
        `;
    }
  }}
  
  /* Underline styles */
  ${({ underline, underlineColor, theme, center }) => underline && `
    position: relative;
    padding-bottom: ${theme.spacing.sm};
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      ${center ? 'left: 50%; transform: translateX(-50%);' : 'left: 0;'}
      width: ${typeof underline === 'string' ? underline : '20px'};
      height: 1px;
      background-color: ${underlineColor || theme.colors.border.secondary};
    }
  `}
  
  /* Interactive title */
  ${({ interactive, theme }) => interactive && `
    transition: all ${theme.transitions.fast};
    cursor: pointer;
    
    &:hover {
      color: ${theme.colors.brand.primary};
    }
  `}
`;

const Title = ({ 
  children, 
  variant = 'main',
  component,
  className,
  ...props 
}) => {
  // Map variants to HTML heading levels
  const getComponentForVariant = () => {
    if (component) return component;
    
    switch (variant) {
      case 'hero': return 'h1';
      case 'main': return 'h2';
      case 'section': return 'h3';
      case 'subsection': return 'h4';
      case 'item': return 'h5';
      default: return 'h2';
    }
  };

  return (
    <StyledTitle 
      as={getComponentForVariant()} 
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </StyledTitle>
  );
};

export default Title;