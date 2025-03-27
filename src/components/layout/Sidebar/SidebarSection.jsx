import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-xs);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--borderSubtle);
  display: ${(props) => (props.$collapsed ? 'none' : 'block')};
  letter-spacing: 0.5px;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SidebarSection = ({ title, children, collapsed }) => {
  return (
    <SectionContainer>
      <SectionTitle $collapsed={collapsed}>{title}</SectionTitle>
      <SectionContent>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};

export default SidebarSection;