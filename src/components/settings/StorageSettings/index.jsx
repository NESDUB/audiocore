import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HardDrive, Database } from 'lucide-react';
import LibraryLocations from './LibraryLocations';
import CacheSettings from './CacheSettings';
import { getStorageInfo } from '../../../services/StorageService';
import { useLibrary } from '../../../features/library/providers/LibraryProvider';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--borderSubtle);
`;

const StorageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bgSecondary);
  border-radius: 8px;
  border: 1px solid var(--borderSubtle);
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--textPrimary);

  svg {
    color: var(--accentPrimary);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const InfoCard = styled.div`
  padding: var(--spacing-md);
  background-color: var(--bgPrimary);
  border-radius: 6px;
  border: 1px solid var(--borderSubtle);
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  margin-bottom: var(--spacing-xs);
`;

const InfoValue = styled.div`
  font-size: 18px;
  color: var(--textPrimary);
  font-weight: 500;
`;

const InfoSubValue = styled.div`
  font-size: 12px;
  color: ${props => props.$color || 'var(--textSecondary)'};
  margin-top: 2px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--bgPrimary);
  border-radius: 2px;
  margin-top: var(--spacing-xs);
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => `${props.$percent}%`};
  background-color: ${props => {
    if (props.$percent > 90) return 'var(--accentError)';
    if (props.$percent > 75) return 'var(--accentWarning)';
    return 'var(--accentPrimary)';
  }};
`;

/**
 * StorageSettings component - Manages library storage settings
 */
const StorageSettings = () => {
  const { state } = useLibrary();
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate total size of library (in tracks)
  const totalTracks = state.tracks.length;
  const totalAlbums = state.albums.length;
  const totalArtists = state.artists.length;

  // Calculate total storage size (rough estimate)
  const totalSizeBytes = state.totalSize || 0;

  // Format bytes to human-readable size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Load storage info
  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        setLoading(true);
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Error loading storage info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageInfo();
  }, []);

  return (
    <SettingsContainer>
      {/* Storage overview section */}
      <div>
        <SectionTitle>Storage Overview</SectionTitle>

        <StorageInfo>
          <InfoHeader>
            <HardDrive size={18} />
            <h4>Library Storage</h4>
          </InfoHeader>

          <InfoGrid>
            <InfoCard>
              <InfoLabel>TOTAL TRACKS</InfoLabel>
              <InfoValue>{formatNumber(totalTracks)}</InfoValue>
              <InfoSubValue>in your library</InfoSubValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>TOTAL SIZE</InfoLabel>
              <InfoValue>{formatSize(totalSizeBytes)}</InfoValue>
              <InfoSubValue>estimated storage used</InfoSubValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>STORAGE TYPE</InfoLabel>
              <InfoValue>{storageInfo?.type || 'Loading...'}</InfoValue>
              <InfoSubValue>persistent storage</InfoSubValue>
            </InfoCard>

            {storageInfo?.percent && (
              <InfoCard>
                <InfoLabel>STORAGE USAGE</InfoLabel>
                <InfoValue>{storageInfo.usage}</InfoValue>
                <InfoSubValue>of {storageInfo.limit} limit</InfoSubValue>
                <ProgressBar>
                  <ProgressFill $percent={storageInfo.percent} />
                </ProgressBar>
              </InfoCard>
            )}
          </InfoGrid>
        </StorageInfo>
        
        {/* Library Scanning Progress */}
        {state.isScanning && (
          <StorageInfo>
            <InfoHeader>
              <Database size={18} />
              <h4>Library Scan Progress</h4>
            </InfoHeader>
            
            <InfoGrid>
              <InfoCard>
                <InfoLabel>SCAN STATUS</InfoLabel>
                <InfoValue>Scanning in progress</InfoValue>
                <ProgressBar>
                  <ProgressFill $percent={state.scanTotal > 0 ? Math.min(((state.scanProgress / state.scanTotal) * 100), 100) : 0} />
                </ProgressBar>
              </InfoCard>
              
              <InfoCard>
                <InfoLabel>FILES PROCESSED</InfoLabel>
                <InfoValue>{formatNumber(state.scanProgress)}</InfoValue>
                <InfoSubValue>of {formatNumber(state.scanTotal)} files</InfoSubValue>
              </InfoCard>
              
              <InfoCard>
                <InfoLabel>COMPLETION</InfoLabel>
                <InfoValue>
                  {state.scanTotal > 0 ? 
                    `${Math.round((state.scanProgress / state.scanTotal) * 100)}%` : 
                    'Calculating...'}
                </InfoValue>
                <InfoSubValue>of total scan</InfoSubValue>
              </InfoCard>
            </InfoGrid>
          </StorageInfo>
        )}
      </div>

      {/* Library locations section */}
      <div>
        <SectionTitle>Library Locations</SectionTitle>
        <LibraryLocations />
      </div>

      {/* Cache settings section */}
      <div>
        <SectionTitle>Cache Settings</SectionTitle>
        <CacheSettings />
      </div>
    </SettingsContainer>
  );
};

export default StorageSettings;