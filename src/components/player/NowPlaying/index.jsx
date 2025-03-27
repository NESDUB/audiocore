import React from 'react';
import styled from 'styled-components';
import Panel from '../../layout/Panel';
import { Heart, Share2, List } from 'lucide-react';
import TransportControls from '../TransportControls';
import AlbumArt from './AlbumArt';
import TrackInfo from './TrackInfo';
import MetadataDisplay from './MetadataDisplay';
import { usePlayer } from '../../../features/player/providers/PlayerProvider';

const NowPlayingContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-md);
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
`;

const ArtworkSection = styled.div`
  width: 200px;
  height: 200px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--borderLight);
  color: var(--textSecondary);
  background-color: transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--textPrimary);
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }
`;

/**
 * NowPlaying component - displays the currently playing track
 */
const NowPlaying = () => {
  // Get current track from player context
  const { currentTrack } = usePlayer();

  // Use current track data if available, otherwise use placeholder
  const trackData = currentTrack || {
    title: 'Nebula Drift',
    artist: 'Cosmic Equation',
    album: 'Solar Flare Sessions',
    year: '2024',
    duration: 219, // in seconds
    artwork: '/api/placeholder/200/200',
  };

  return (
    <Panel title="NOW PLAYING" fullHeight>
      <NowPlayingContainer>
        <ArtworkSection>
          <AlbumArt
            src={trackData.artwork || '/api/placeholder/200/200'} 
            alt={`${trackData.artist} - ${trackData.title}`}
          />
        </ArtworkSection>

        <InfoSection>
          <div>
            <TrackInfo
              title={trackData.title}
              artist={trackData.artist}
              album={trackData.album}
            />

            <ActionButtons>
              <ActionButton aria-label="Add to favorites">
                <Heart size={16} />
              </ActionButton>
              <ActionButton aria-label="Share">
                <Share2 size={16} />
              </ActionButton>
              <ActionButton aria-label="Show in playlist">
                <List size={16} />
              </ActionButton>
            </ActionButtons>
          </div>

          <MetadataDisplay
            album={trackData.album}
            year={trackData.year}
            duration={trackData.duration}
          />

          <TransportControls />
        </InfoSection>
      </NowPlayingContainer>
    </Panel>
  );
};

export default NowPlaying;