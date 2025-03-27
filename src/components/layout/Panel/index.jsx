import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--bgContent);
  border: 1px solid var(--borderSubtle);
  border-radius: var(--spacing-sm);
  overflow: hidden;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 6px var(--shadowColor);
  height: ${(props) => props.$fullHeight ? '100%' : 'auto'};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--borderSubtle);
  min-height: 36px;
`;

const PanelTitle = styled.div`
  font-size: 14px;
  color: var(--textSecondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PanelControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const PanelContent = styled.div`
  flex: 1;
  padding: ${(props) => props.$noPadding ? '0' : 'var(--spacing-md)'};
  overflow: auto;
`;

/**
 * Panel component for content containers
 * @param {Object} props Component props
 * @param {string} props.title Panel title
 * @param {React.ReactNode} props.controls Optional controls for the header
 * @param {React.ReactNode} props.children Panel content
 * @param {boolean} props.fullHeight Whether the panel should take full height
 * @param {boolean} props.noPadding Whether to remove padding from content
 * @param {string} props.className Additional CSS class
 */
const Panel = ({
  title,
  controls,
  children,
  fullHeight = false,
  noPadding = false,
  className,
}) => {
  return (
    <PanelContainer $fullHeight={fullHeight} className={className}>
      {title && (
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          {controls && <PanelControls>{controls}</PanelControls>}
        </PanelHeader>
      )}
      <PanelContent $noPadding={noPadding}>
        {children}
      </PanelContent>
    </PanelContainer>
  );
};

export default Panel;