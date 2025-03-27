import React, { useState } from 'react';
import styled from 'styled-components';
import { Trash2, Check, AlertCircle } from 'lucide-react';
import { clearAllData } from '../../../services/StorageService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CacheCard = styled.div`
  padding: var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: 6px;
  border: 1px solid var(--borderSubtle);
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--borderSubtle);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
`;

const Description = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  margin-top: 2px;
`;

const SliderContainer = styled.div`
  width: 200px;
`;

const SliderInput = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: linear-gradient(to right, var(--accentPrimary) 0%, var(--accentPrimary) ${props => props.$value}%, var(--bgPrimary) ${props => props.$value}%, var(--bgPrimary) 100%);
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accentPrimary);
    cursor: pointer;
    border: none;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accentPrimary);
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  text-align: right;
  margin-top: 4px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 4px;
  background-color: ${props => props.$danger ? 'rgba(242, 85, 90, 0.1)' : 'transparent'};
  color: ${props => props.$danger ? 'var(--accentError)' : 'var(--textSecondary)'};
  border: ${props => props.$danger ? '1px solid var(--accentError)' : '1px solid var(--borderLight)'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$danger ? 'rgba(242, 85, 90, 0.2)' : 'var(--bgHover)'};
    color: ${props => props.$danger ? 'var(--accentError)' : 'var(--textPrimary)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  background-color: ${props => 
    props.$type === 'success' 
      ? 'rgba(145, 242, 145, 0.1)' 
      : 'rgba(242, 85, 90, 0.1)'
  };
  color: ${props => 
    props.$type === 'success' 
      ? 'var(--accentPrimary)' 
      : 'var(--accentError)'
  };
  font-size: 14px;
  margin-top: var(--spacing-sm);
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 400px;
  background-color: var(--bgSecondary);
  border-radius: 8px;
  border: 1px solid var(--borderSubtle);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: var(--spacing-lg);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-md);
`;

const ModalText = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-lg);
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
`;

/**
 * CacheSettings component - Manages cache storage settings
 */
const CacheSettings = () => {
  const [cacheLimit, setCacheLimit] = useState(5);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Handle cache limit change
  const handleCacheLimitChange = (e) => {
    setCacheLimit(parseInt(e.target.value, 10));
  };
  
  // Handle clear cache
  const handleClearCache = async () => {
    try {
      // Close confirmation modal
      setShowConfirmation(false);
      
      // Clear cache data
      const result = await clearAllData();
      
      if (result) {
        setStatusMessage({
          type: 'success',
          text: 'Cache cleared successfully.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to clear cache.'
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setStatusMessage({
        type: 'error',
        text: `Error clearing cache: ${error.message}`
      });
    }
  };
  
  // Show confirmation modal
  const confirmClearCache = () => {
    setShowConfirmation(true);
  };
  
  // Cancel clear cache
  const cancelClearCache = () => {
    setShowConfirmation(false);
  };
  
  return (
    <Container>
      <CacheCard>
        <SettingRow>
          <SettingLabel>
            <Label>Cache Limit</Label>
            <Description>Maximum storage space for cached files</Description>
          </SettingLabel>
          <SliderContainer>
            <SliderInput
              min="1"
              max="10"
              value={cacheLimit}
              $value={(cacheLimit / 10) * 100}
              onChange={handleCacheLimitChange}
            />
            <SliderValue>{cacheLimit} GB</SliderValue>
          </SliderContainer>
        </SettingRow>
        
        <SettingRow>
          <SettingLabel>
            <Label>Clear Cache</Label>
            <Description>Remove all cached files and reset application settings</Description>
          </SettingLabel>
          <Button $danger onClick={confirmClearCache}>
            <Trash2 size={16} />
            <span>Clear Cache</span>
          </Button>
        </SettingRow>
        
        {statusMessage && (
          <StatusMessage $type={statusMessage.type}>
            {statusMessage.type === 'success' ? (
              <Check size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{statusMessage.text}</span>
          </StatusMessage>
        )}
      </CacheCard>
      
      {/* Confirmation modal */}
      {showConfirmation && (
        <ConfirmationModal>
          <ModalContent>
            <ModalTitle>Clear Cache</ModalTitle>
            <ModalText>
              Are you sure you want to clear all cached files? This will remove all 
              temporary files and reset application settings. Your library data will 
              not be affected.
            </ModalText>
            <ModalButtons>
              <Button onClick={cancelClearCache}>
                Cancel
              </Button>
              <Button $danger onClick={handleClearCache}>
                <Trash2 size={16} />
                <span>Clear Cache</span>
              </Button>
            </ModalButtons>
          </ModalContent>
        </ConfirmationModal>
      )}
    </Container>
  );
};

export default CacheSettings;