import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import Icon from '../Icon';

// Container for the file input with label
const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

// Label for the file input
const FileLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: 1px;
  
  ${({ required }) => required && css`
    &::after {
      content: '*';
      color: ${({ theme }) => theme.colors.brand.error};
      margin-left: 2px;
    }
  `}
`;

// Hidden file input (actual browser input)
const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
`;

// Custom file input area
const DropArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed ${({ theme, dragActive, error }) => 
    error ? theme.colors.brand.error : 
    dragActive ? theme.colors.brand.primary : theme.colors.border.secondary};
  border-radius: 6px;
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  background-color: ${({ theme, dragActive }) => 
    dragActive ? theme.colors.brand.primary + '10' : 'transparent'};
  
  &:hover {
    border-color: ${({ theme, error }) => 
      error ? theme.colors.brand.error : theme.colors.brand.primary};
    background-color: ${({ theme }) => theme.colors.brand.primary + '10'};
  }
  
  ${({ disabled }) => disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      border-color: ${({ theme }) => theme.colors.border.secondary};
      background-color: transparent;
    }
  `}
`;

// Icon for the drop area
const DropIcon = styled.div`
  color: ${({ theme, error }) => 
    error ? theme.colors.brand.error : theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 24px;
  
  ${DropArea}:hover & {
    color: ${({ theme, error }) => 
      error ? theme.colors.brand.error : theme.colors.text.primary};
  }
`;

// Primary text for the drop area
const DropText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

// Secondary text for the drop area
const DropSubtext = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// File list container
const FileListContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  max-height: 150px;
  overflow-y: auto;
  width: 100%;
`;

// File item in the list
const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface.darker};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// File info display (name and size)
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

// File type icon
const FileTypeIcon = styled.div`
  margin-right: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;
`;

// File name display
const FileName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// File size display
const FileSize = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
`;

// Remove file button
const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: 2px;
  margin-left: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.brand.error};
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Error message display
const ErrorMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.brand.error};
  margin-top: 4px;
`;

// Helper text display
const HelperText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 4px;
`;

/**
 * Format file size to human-readable format
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * FileInput component
 * A styled file input with drag and drop support and file list display
 */
const FileInput = ({
  label,
  onChange,
  multiple = false,
  accept,
  maxFiles = 10,
  maxSize,
  helperText,
  name,
  id,
  required = false,
  disabled = false,
  error = null,
  value = [],
  width,
  className,
  ...props
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  // Generate an ID if one isn't provided
  const fileInputId = id || `file-${name || Math.random().toString(36).substring(2, 9)}`;
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle dropping files
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleChange = (e) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Process files and call onChange
  const handleFiles = (files) => {
    if (!onChange) return;
    
    // Convert FileList to Array
    const fileArray = Array.from(files);
    
    // Apply file limits
    let validFiles = fileArray;
    
    // Check max files
    if (multiple && maxFiles) {
      validFiles = validFiles.slice(0, maxFiles - value.length);
    } else if (!multiple) {
      validFiles = validFiles.slice(0, 1);
    }
    
    // Check max size
    if (maxSize) {
      validFiles = validFiles.filter(file => file.size <= maxSize);
    }
    
    // Create a synthetic event
    const syntheticEvent = {
      target: {
        name,
        value: multiple ? [...value, ...validFiles] : validFiles
      }
    };
    
    // Call onChange
    onChange(syntheticEvent);
    
    // Reset the input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index) => {
    if (disabled) return;
    
    const newFiles = [...value];
    newFiles.splice(index, 1);
    
    // Create a synthetic event
    const syntheticEvent = {
      target: {
        name,
        value: newFiles
      }
    };
    
    // Call onChange
    onChange(syntheticEvent);
  };
  
  // Open the file dialog
  const openFileDialog = () => {
    if (disabled) return;
    
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Prepare display text
  let dropText = 'Drag and drop files here';
  let dropSubtext = 'or click to browse';
  
  if (!multiple) {
    dropText = 'Drag and drop a file here';
  }
  
  if (accept) {
    const acceptTypes = accept.split(',').map(type => type.trim());
    dropSubtext += ` (${acceptTypes.join(', ')})`;
  }
  
  if (maxSize) {
    dropSubtext += ` (max ${formatFileSize(maxSize)})`;
  }
  
  return (
    <FileInputContainer width={width} className={className}>
      {label && (
        <FileLabel htmlFor={fileInputId} required={required}>
          {label}
        </FileLabel>
      )}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <HiddenInput
          ref={inputRef}
          id={fileInputId}
          type="file"
          name={name}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          {...props}
        />
        
        <DropArea
          onClick={openFileDialog}
          dragActive={dragActive}
          disabled={disabled}
          error={!!error}
        >
          <DropIcon error={!!error}>
            <Icon name="Download" size="32px" />
          </DropIcon>
          <DropText>{dropText}</DropText>
          <DropSubtext>{dropSubtext}</DropSubtext>
        </DropArea>
      </div>
      
      {value && value.length > 0 && (
        <FileListContainer>
          {value.map((file, index) => (
            <FileItem key={index}>
              <FileInfo>
                <FileTypeIcon>
                  <Icon name="Songs" size="16px" />
                </FileTypeIcon>
                <FileName>{file.name}</FileName>
                <FileSize>{formatFileSize(file.size)}</FileSize>
              </FileInfo>
              
              <RemoveButton
                type="button"
                onClick={() => handleRemoveFile(index)}
                disabled={disabled}
                aria-label="Remove file"
              >
                <Icon name="Close" size="14px" />
              </RemoveButton>
            </FileItem>
          ))}
        </FileListContainer>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </FileInputContainer>
  );
};

export default FileInput;