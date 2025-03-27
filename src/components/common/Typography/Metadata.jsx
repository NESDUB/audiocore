import React from 'react';
import styled, { css } from 'styled-components';

/**
 * Metadata component for displaying secondary information like artist, album, details, etc.
 * Features lighter color, smaller text, and various display options
 */

// Base styles for metadata text
const baseMetadataStyles = css`
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  font-size: ${({ size, theme }) => size || theme.typography.sizes.sm};
  color: ${({ color, theme }) => color || theme.colors.text.secondary};
  font-weight: ${({ weight, theme }) => {
    if (weight === 'regular') return theme.typography.weights.regular;
    if (weight === 'medium') return theme.typography.weights.medium;
    if (weight === 'bold') return theme.typography.weights.bold;
    return weight || theme.typography.weights.regular;
  }};
  transition: color ${({ theme }) => theme.transitions.fast};
  line-height: 1.4;
  
  /* Optional styling based on props */
  ${({ uppercase }) => uppercase && 'text-transform: uppercase;'}
  ${({ lowercase }) => lowercase && 'text-transform: lowercase;'}
  ${({ capitalize }) => capitalize && 'text-transform: capitalize;'}
  ${({ center }) => center && 'text-align: center;'}
  ${({ right }) => right && 'text-align: right;'}
  ${({ italic }) => italic && 'font-style: italic;'}
  ${({ spacing }) => spacing && `letter-spacing: ${spacing};`}
  ${({ opacity }) => opacity !== undefined && `opacity: ${opacity};`}
  ${({ margin }) => margin && `margin: ${margin};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  ${({ width }) => width && `width: ${width};`}
  ${({ maxWidth }) => maxWidth && `max-width: ${maxWidth};`}
  
  /* Text handling */
  ${({ noWrap }) => noWrap && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  
  /* Truncate text after specified lines */
  ${({ truncate }) => truncate && `
    display: -webkit-box;
    -webkit-line-clamp: ${typeof truncate === 'number' ? truncate : 1};
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
  
  /* Technical metadata */
  ${({ monospace, theme }) => monospace && `
    font-family: ${theme.typography.fonts.monospace};
    letter-spacing: 0.5px;
  `}
  
  /* Interactive metadata */
  ${({ interactive, theme }) => interactive && `
    cursor: pointer;
    
    &:hover {
      color: ${theme.colors.text.primary};
    }
  `}
`;

// Main metadata styled component
const StyledMetadata = styled.div`
  ${baseMetadataStyles}
  
  /* Size variants */
  ${({ variant, theme }) => {
    switch (variant) {
      case 'small':
        return `
          font-size: ${theme.typography.sizes.xs};
          opacity: 0.8;
        `;
      case 'large':
        return `
          font-size: ${theme.typography.sizes.md};
        `;
      case 'technical':
        return `
          font-family: ${theme.typography.fonts.monospace};
          font-size: ${theme.typography.sizes.xs};
          letter-spacing: 0.5px;
        `;
      default: // 'normal'
        return `
          font-size: ${theme.typography.sizes.sm};
        `;
    }
  }}
  
  /* Badge styling */
  ${({ badge, theme }) => badge && `
    display: inline-block;
    background-color: ${
      typeof badge === 'string' ? badge : 'rgba(0, 0, 0, 0.2)'
    };
    padding: 2px 6px;
    border-radius: 3px;
    font-size: ${theme.typography.sizes.xs};
  `}
  
  /* Separator styling for lists */
  ${({ withSeparator }) => withSeparator && `
    position: relative;
    
    &:not(:last-child)::after {
      content: "${typeof withSeparator === 'string' ? withSeparator : '•'}";
      margin: 0 6px;
      opacity: 0.5;
    }
  `}
  
  /* Icon integration */
  ${({ withIcon }) => withIcon && `
    display: inline-flex;
    align-items: center;
    gap: 6px;
  `}
`;

// Metadata list for grouping multiple metadata items
const MetadataList = styled.div`
  display: flex;
  flex-wrap: ${({ wrap }) => wrap ? 'wrap' : 'nowrap'};
  align-items: center;
  gap: ${({ gap, theme }) => gap || theme.spacing.xs};
  
  ${({ vertical }) => vertical && `
    flex-direction: column;
    align-items: ${({ align }) => {
      switch (align) {
        case 'left': return 'flex-start';
        case 'right': return 'flex-end';
        default: return 'center';
      }
    }};
  `}
`;

const Metadata = ({ 
  children, 
  variant = 'normal',
  component,
  isList,
  listProps = {},
  icon,
  className,
  ...props 
}) => {
  // If icon is provided, set withIcon to true
  const updatedProps = icon ? { ...props, withIcon: true } : props;
  
  // For metadata lists
  if (isList) {
    return (
      <MetadataList className={className} {...listProps}>
        {children}
      </MetadataList>
    );
  }
  
  // For single metadata item
  return (
    <StyledMetadata 
      as={component} 
      variant={variant}
      className={className}
      {...updatedProps}
    >
      {icon && icon}
      {children}
    </StyledMetadata>
  );
};

export default Metadata;