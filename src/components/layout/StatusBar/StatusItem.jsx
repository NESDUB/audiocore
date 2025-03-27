import React from 'react';
import styled from 'styled-components';

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ItemLabel = styled.span`
  color: var(--textSecondary);
  font-size: 11px;
`;

const ItemValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${(props) => props.$color || 'var(--accentPrimary)'};
  margin-right: 2px;
`;

const ItemValue = styled.span`
  color: var(--textPrimary);
  font-size: 11px;
`;

const StatusItem = ({ label, value, indicator }) => {
  return (
    <ItemContainer>
      {label && <ItemLabel>{label}</ItemLabel>}
      
      <ItemValueContainer>
        {indicator && indicator.show && (
          <StatusIndicator $color={indicator.color} />
        )}
        <ItemValue>{value}</ItemValue>
      </ItemValueContainer>
    </ItemContainer>
  );
};

export default StatusItem;