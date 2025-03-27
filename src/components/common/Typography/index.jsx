import React from 'react';
import styled, { css } from 'styled-components';

// Common text styles shared across components
const baseTextStyles = css`
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
  color: ${({ color, theme }) => color || theme.colors.text.primary};
  transition: color ${({ theme }) => theme.transitions.fast};
  
  ${({ uppercase }) => uppercase && 'text-transform: uppercase;'}
  ${({ center }) => center && 'text-align: center;'}
  ${({ right }) => right && 'text-align: right;'}
  ${({ noWrap }) => noWrap && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  ${({ truncate }) => truncate && `
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: ${typeof truncate === 'number' ? truncate : 1};
    -webkit-box-orient: vertical;
  `}
  ${({ spacing }) => spacing && `letter-spacing: ${spacing}px;`}
  ${({ lineHeight }) => lineHeight && `line-height: ${lineHeight};`}
  ${({ weight, theme }) => {
    if (weight === 'regular') return `font-weight: ${theme.typography.weights.regular};`;
    if (weight === 'medium') return `font-weight: ${theme.typography.weights.medium};`;
    if (weight === 'bold') return `font-weight: ${theme.typography.weights.bold};`;
    return weight && `font-weight: ${weight};`;
  }}
  ${({ opacity }) => opacity !== undefined && `opacity: ${opacity};`}
  ${({ margin }) => margin && `margin: ${margin};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  ${({ transform }) => transform && `text-transform: ${transform};`}
  ${({ monospace, theme }) => monospace && `font-family: ${theme.typography.fonts.monospace};`}
`;

// Display typography (large headings)
const DisplayText = styled.h1`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 2px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  ${({ variant, theme }) => {
    if (variant === 'display1') return `
      font-size: 32px;
      letter-spacing: 3px;
    `;
    if (variant === 'display2') return `
      font-size: 28px;
      letter-spacing: 2.5px;
    `;
    if (variant === 'display3') return `
      font-size: 24px;
      letter-spacing: 2px;
    `;
  }}
`;

// Heading typography (h1-h6)
const HeadingText = styled.h2`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  letter-spacing: 1.5px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  ${({ variant, theme }) => {
    if (variant === 'h1') return `
      font-size: 20px;
      letter-spacing: 2px;
    `;
    if (variant === 'h2') return `
      font-size: 18px;
      letter-spacing: 1.8px;
    `;
    if (variant === 'h3') return `
      font-size: 16px;
      letter-spacing: 1.5px;
    `;
    if (variant === 'h4') return `
      font-size: 14px;
      letter-spacing: 1.2px;
    `;
    if (variant === 'h5') return `
      font-size: 13px;
      letter-spacing: 1px;
    `;
    if (variant === 'h6') return `
      font-size: 12px;
      letter-spacing: 0.8px;
    `;
  }}
`;

// Label typography (used for section titles, form labels)
const LabelText = styled.div`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.xs};
  color: ${({ color, theme }) => color || theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Body typography (for paragraphs, larger text blocks)
const BodyText = styled.p`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.md};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  ${({ variant, theme }) => {
    if (variant === 'body1') return `
      font-size: ${theme.typography.sizes.md};
    `;
    if (variant === 'body2') return `
      font-size: ${theme.typography.sizes.sm};
    `;
    if (variant === 'caption') return `
      font-size: ${theme.typography.sizes.xs};
      color: ${theme.colors.text.secondary};
    `;
  }}
`;

// Techincal typography (for timecodes, metrics, etc.)
const TechText = styled.span`
  ${baseTextStyles}
  font-family: ${({ theme }) => theme.typography.fonts.monospace};
  font-size: ${({ size, theme }) => size || theme.typography.sizes.sm};
  letter-spacing: 0.5px;
`;

// Section title with underline (common in the AudiophileConsole)
const SectionTitle = styled.h3`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ color, theme }) => color || theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 20px;
    height: 1px;
    background-color: ${({ underlineColor, theme }) => 
      underlineColor || theme.colors.border.secondary};
  }
  
  ${({ centered }) => centered && `
    text-align: center;
    
    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  `}
`;

// Status text (used for indicators, can be colored based on status)
const StatusText = styled.span`
  ${baseTextStyles}
  font-size: ${({ size, theme }) => size || theme.typography.sizes.xs};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  ${({ status, theme }) => {
    if (status === 'success') return `color: ${theme.colors.brand.primary};`;
    if (status === 'error') return `color: ${theme.colors.brand.error};`;
    if (status === 'warning') return `color: ${theme.colors.brand.warning};`;
    if (status === 'info') return `color: ${theme.colors.brand.secondary};`;
  }}
  
  &::before {
    ${({ withDot }) => withDot && `
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 2px;
    `}
    
    ${({ status, withDot, theme }) => withDot && status && `
      background-color: ${
        status === 'success' ? theme.colors.brand.primary :
        status === 'error' ? theme.colors.brand.error :
        status === 'warning' ? theme.colors.brand.warning :
        theme.colors.brand.secondary
      };
    `}
  }
`;

// Main Typography component that renders the appropriate variant
const Typography = ({
  variant = 'body1',
  component,
  children,
  ...props
}) => {
  // Map variants to components
  const variantMap = {
    display1: DisplayText,
    display2: DisplayText,
    display3: DisplayText,
    h1: HeadingText,
    h2: HeadingText,
    h3: HeadingText,
    h4: HeadingText,
    h5: HeadingText,
    h6: HeadingText,
    body1: BodyText,
    body2: BodyText,
    caption: BodyText,
    label: LabelText,
    tech: TechText,
    section: SectionTitle,
    status: StatusText
  };
  
  // Get the appropriate component
  const Component = component || variantMap[variant] || BodyText;
  
  return <Component variant={variant} {...props}>{children}</Component>;
};

// Export the main component
export default Typography;

// Export individual components for direct use
export {
  DisplayText,
  HeadingText,
  LabelText,
  BodyText,
  TechText,
  SectionTitle,
  StatusText
};