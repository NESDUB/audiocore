import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Panel from './index';

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  color: var(--textSecondary);
  
  &:hover {
    background-color: var(--bgHover);
    color: var(--textPrimary);
  }
`;

const CollapsibleContent = styled.div`
  height: ${(props) => (props.$collapsed ? '0' : 'auto')};
  overflow: hidden;
  transition: height 0.3s ease;
`;

/**
 * CollapsiblePanel component for expandable/collapsible content containers
 * @param {Object} props Component props
 * @param {string} props.title Panel title
 * @param {React.ReactNode} props.children Panel content
 * @param {boolean} props.defaultCollapsed Whether panel is collapsed by default
 * @param {boolean} props.noPadding Whether to remove padding from content
 * @param {Function} props.onToggle Callback when collapsed state changes
 * @param {React.ReactNode} props.extraControls Additional controls for the header
 * @param {string} props.className Additional CSS class
 */
const CollapsiblePanel = ({
  title,
  children,
  defaultCollapsed = false,
  noPadding = false,
  onToggle,
  extraControls,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) {
      onToggle(!collapsed);
    }
  };
  
  const controls = (
    <>
      {extraControls}
      <ToggleButton onClick={handleToggle}>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </ToggleButton>
    </>
  );
  
  return (
    <Panel
      title={title}
      controls={controls}
      noPadding
      className={className}
    >
      <CollapsibleContent $collapsed={collapsed}>
        <div style={{ padding: noPadding ? 0 : 'var(--spacing-md)' }}>
          {children}
        </div>
      </CollapsibleContent>
    </Panel>
  );
};

export default CollapsiblePanel;