import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { SecondaryButton } from '../../common/Button';
import Icon from '../../common/Icon';

// Container for preset controls
const PresetContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Preset selection dropdown
const PresetSelect = styled.select`
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  padding: 4px 8px;
  outline: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};

  &:focus {
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

// Preset action buttons container
const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

// Modal for saving custom preset
const SavePresetModal = styled.div`
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
  background-color: ${({ theme }) => theme.colors.surface.primary};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.lg};
  width: 350px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.h3`
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border.secondary};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface.darker};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

/**
 * EqualizerPreset component - Manages equalizer presets selection and saving
 */
const EqualizerPreset = ({ 
  currentPreset, 
  presets, 
  onPresetChange, 
  onReset, 
  onSaveCustom,
  currentValues,
  disabled 
}) => {
  // State for save preset modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  
  // Handle preset selection change
  const handlePresetChange = (e) => {
    onPresetChange(e.target.value);
  };
  
  // Open save preset modal
  const openSaveModal = () => {
    setPresetName('My Preset');
    setShowSaveModal(true);
  };
  
  // Close save preset modal
  const closeModal = () => {
    setShowSaveModal(false);
  };
  
  // Save current settings as a new preset
  const saveCustomPreset = () => {
    if (presetName.trim() === '') return;
    
    onSaveCustom({
      id: `custom_${Date.now()}`,
      name: presetName,
      values: currentValues
    });
    
    closeModal();
  };

  return (
    <>
      <PresetContainer>
        <PresetSelect
          value={currentPreset}
          onChange={handlePresetChange}
          disabled={disabled}
        >
          {Object.entries(presets).map(([key, { name }]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </PresetSelect>
        
        <ActionButtons>
          <SecondaryButton 
            onClick={onReset} 
            disabled={disabled}
            size="sm"
          >
            Reset
          </SecondaryButton>
          
          <SecondaryButton
            onClick={openSaveModal}
            disabled={disabled}
            size="sm"
            title="Save Current Settings as Preset"
          >
            <Icon name="Save" size="14px" />
          </SecondaryButton>
        </ActionButtons>
      </PresetContainer>
      
      {/* Save Preset Modal */}
      {showSaveModal && (
        <SavePresetModal onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>Save Custom Preset</ModalHeader>
            
            <InputGroup>
              <Label htmlFor="presetName">Preset Name</Label>
              <Input
                id="presetName"
                type="text"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                autoFocus
              />
            </InputGroup>
            
            <ModalActions>
              <SecondaryButton onClick={closeModal}>
                Cancel
              </SecondaryButton>
              <SecondaryButton 
                onClick={saveCustomPreset}
                disabled={presetName.trim() === ''}
              >
                Save
              </SecondaryButton>
            </ModalActions>
          </ModalContent>
        </SavePresetModal>
      )}
    </>
  );
};

EqualizerPreset.propTypes = {
  currentPreset: PropTypes.string.isRequired,
  presets: PropTypes.object.isRequired,
  onPresetChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSaveCustom: PropTypes.func.isRequired,
  currentValues: PropTypes.array.isRequired,
  disabled: PropTypes.bool
};

EqualizerPreset.defaultProps = {
  disabled: false
};

export default EqualizerPreset;