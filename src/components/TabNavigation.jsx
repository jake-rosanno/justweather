import React from 'react';
import styled from '@emotion/styled';

const TabContainer = styled.div`
  width: 100%;
  margin: 0 auto 1rem;
`;

const TabInner = styled.div`
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
`;

const TabButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'now', label: 'Right Now' },
    { id: 'hourly', label: 'Hourly' },
    { id: 'tenday', label: '10-Day' }
  ];

  return (
    <TabContainer>
      <TabInner>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabInner>
    </TabContainer>
  );
};

export default TabNavigation;
