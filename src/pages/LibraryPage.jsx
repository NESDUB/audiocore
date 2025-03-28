import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FolderOpen,
  Music,
  Disc,
  Radio,
  Star,
  List,
  Grid,
  BarChart2,
  Search,
  RefreshCw,
  Filter,
  SortAsc,
  User
} from 'lucide-react';
import FileImport from '../components/library/FileImport';
import FileDropZone from '../components/library/FileImport/FileDropZone';
import { useLibrary } from '../features/library/providers/LibraryProvider';
import Panel from '../components/layout/Panel';

// Styled components
const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 1fr;
  gap: var(--spacing-md);
  height: 100%;
  padding: var(--spacing-md);
  overflow: hidden;
`;

const SidePanel = styled(Panel)`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MainPanel = styled(Panel)`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderSubtle);
  margin-bottom: var(--spacing-md);
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  color: ${props => props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--accentPrimary)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: var(--textPrimary);
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm);
  height: 36px;
  border-radius: 4px;
  background-color: var(--bgPrimary);
  border: 1px solid var(--borderLight);
  margin-bottom: var(--spacing-md);

  input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    color: var(--textPrimary);
    outline: none;
    font-size: 14px;

    &::placeholder {
      color: var(--textSecondary);
    }
  }

  svg {
    color: var(--textSecondary);
    margin-right: var(--spacing-xs);
  }
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const ToolButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  color: var(--textSecondary);
  border: 1px solid var(--borderLight);
  transition: all 0.2s ease;

  &:hover {
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }
`;

const ViewModeButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textSecondary)'};
  background-color: ${props => props.$active ? 'var(--bgHover)' : 'transparent'};

  &:hover {
    background-color: var(--bgHover);
    color: ${props => props.$active ? 'var(--accentPrimary)' : 'var(--textPrimary)'};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: var(--spacing-xs);
`;

const StatsContainer = styled.div`
  padding: var(--spacing-sm);
  border-top: 1px solid var(--borderSubtle);
  color: var(--textSecondary);
  font-size: 12px;
  display: flex;
  justify-content: space-between;
`;

const GridView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
`;

const ListView = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding-bottom: var(--spacing-md);
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ItemCover = styled.div`
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);

  svg {
    color: var(--textDimmed);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  color: var(--textPrimary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemSubtitle = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 120px;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: var(--bgHover);
  }
`;

const ListItemCover = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: var(--bgSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  svg {
    color: var(--textDimmed);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ListItemArtist = styled.div`
  color: var(--textSecondary);
  font-size: 12px;
  text-align: right;
`;

const NoContentMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  text-align: center;
  height: 100%;

  svg {
    color: var(--textDimmed);
    width: 48px;
    height: 48px;
  }
`;

const MessageTitle = styled.h3`
  font-size: 18px;
  color: var(--textPrimary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
`;

const MessageText = styled.p`
  font-size: 14px;
  color: var(--textSecondary);
  max-width: 400px;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  width: 100%;
  text-align: left;
  color: ${props => props.$active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  background-color: ${props => props.$active ? 'var(--bgHover)' : 'transparent'};
  border-left: 2px solid ${props => props.$active ? 'var(--accentPrimary)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: var(--textPrimary);
    background-color: var(--bgHover);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const MenuSection = styled.div`
  margin-bottom: var(--spacing-md);
`;

const MenuHeader = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: var(--textSecondary);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-xs);
`;

const LibraryPage = () => {
  // Get library context
  const { state, scanLibrary } = useLibrary();

  // Component state
  const [activeTab, setActiveTab] = useState('music');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('albums');

  // Handle menu item click
  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item);
  };

  // Start library scan
  const handleScanLibrary = () => {
    scanLibrary();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Toggle import panel
  const toggleImport = () => {
    setShowImport(!showImport);
  };

  // Render content based on active menu item
  const renderContent = () => {
    // If no tracks in library, show import message
    if (state.tracks.length === 0 && !showImport) {
      return (
        <NoContentMessage>
          <Music size={48} />
          <div>
            <MessageTitle>Your Library is Empty</MessageTitle>
            <MessageText>
              Import your music files to start building your library.
              You can add folders or drag and drop files.
            </MessageText>
          </div>
          <ToolButton onClick={toggleImport}>
            <FolderOpen size={16} />
            <span>Import Music</span>
          </ToolButton>
        </NoContentMessage>
      );
    }

    // If import panel is active, show it
    if (showImport) {
      return (
        <ContentContainer>
          <div style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '18px', color: 'var(--textPrimary)' }}>Import Music</h2>
              <ToolButton onClick={toggleImport}>
                <span>Back to Library</span>
              </ToolButton>
            </div>
            <FileImport />
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--textPrimary)', marginBottom: 'var(--spacing-md)' }}>
                Drop Files
              </h3>
              <FileDropZone />
            </div>
          </div>
        </ContentContainer>
      );
    }

    // Filter tracks based on search query
    let filteredTracks = state.tracks;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTracks = state.tracks.filter(track =>
        (track.title && track.title.toLowerCase().includes(query)) ||
        (track.artist && track.artist.toLowerCase().includes(query)) ||
        (track.album && track.album.toLowerCase().includes(query))
      );
    }

    // Filter tracks based on active menu item
    switch (activeMenuItem) {
      case 'allMusic':
        // Already have all tracks
        break;
      case 'albums':
        // Group tracks by album
        const albumMap = {};
        filteredTracks.forEach(track => {
          if (track.album) {
            if (!albumMap[track.album]) {
              albumMap[track.album] = {
                title: track.album,
                artist: track.artist,
                tracks: [] // Store full track objects initially
              };
            }
            albumMap[track.album].tracks.push(track); // Push the track object
          }
        });

        // Render albums
        return (
          <ContentContainer>
            <ScrollContainer>
              {viewMode === 'grid' ? (
                <GridView>
                  {Object.values(albumMap).map((album, index) => {
                    // Find the first track with artwork in this album
                    const artworkUrl = album.tracks.find(t => t.artwork)?.artwork || null;
                    return (
                      <GridItem key={index}>
                        <ItemCover>
                          {artworkUrl ? <img src={artworkUrl} alt={album.title} /> : <Disc size={40} />}
                        </ItemCover>
                        <ItemInfo>
                          <ItemTitle>{album.title}</ItemTitle>
                          <ItemSubtitle>{album.artist}</ItemSubtitle>
                          <ItemSubtitle>{album.tracks.length} tracks</ItemSubtitle>
                        </ItemInfo>
                      </GridItem>
                    );
                  })}
                </GridView>
              ) : (
                <ListView>
                  {Object.values(albumMap).map((album, index) => {
                     // Find the first track with artwork in this album
                    const artworkUrl = album.tracks.find(t => t.artwork)?.artwork || null;
                    return (
                      <ListItem key={index}>
                        <ListItemCover>
                           {artworkUrl ? <img src={artworkUrl} alt={album.title} /> : <Disc size={20} />}
                        </ListItemCover>
                        <ItemInfo>
                          <ItemTitle>{album.title}</ItemTitle>
                          <ItemSubtitle>{album.tracks.length} tracks</ItemSubtitle>
                        </ItemInfo>
                        <ListItemArtist>{album.artist}</ListItemArtist>
                      </ListItem>
                    );
                  })}
                </ListView>
              )}
            </ScrollContainer>
            <StatsContainer>
              <div>{Object.keys(albumMap).length} albums</div>
              <div>{filteredTracks.length} tracks</div>
            </StatsContainer>
          </ContentContainer>
        );

      case 'artists':
        // Group tracks by artist
        const artistMap = {};
        filteredTracks.forEach(track => {
          if (track.artist) {
            if (!artistMap[track.artist]) {
              artistMap[track.artist] = {
                name: track.artist,
                tracks: []
              };
            }
            artistMap[track.artist].tracks.push(track);
          }
        });

        // Find unique albums for each artist
        Object.values(artistMap).forEach(artist => {
          const albums = new Set();
          artist.tracks.forEach(track => {
            if (track.album) {
              albums.add(track.album);
            }
          });
          artist.albums = Array.from(albums);
        });

        // Render artists
        return (
          <ContentContainer>
            <ScrollContainer>
              {viewMode === 'grid' ? (
                <GridView>
                  {Object.values(artistMap).map((artist, index) => (
                    <GridItem key={index}>
                      <ItemCover>
                        {/* Placeholder: Consider finding representative art or using a generic icon */}
                        <User size={40} />
                      </ItemCover>
                      <ItemInfo>
                        <ItemTitle>{artist.name}</ItemTitle>
                        <ItemSubtitle>{artist.albums.length} albums</ItemSubtitle>
                        <ItemSubtitle>{artist.tracks.length} tracks</ItemSubtitle>
                      </ItemInfo>
                    </GridItem>
                  ))}
                </GridView>
              ) : (
                <ListView>
                  {Object.values(artistMap).map((artist, index) => (
                    <ListItem key={index}>
                      <ListItemCover>
                         {/* Placeholder: Consider finding representative art or using a generic icon */}
                        <User size={20} />
                      </ListItemCover>
                      <ItemInfo>
                        <ItemTitle>{artist.name}</ItemTitle>
                        <ItemSubtitle>{artist.albums.length} albums</ItemSubtitle>
                      </ItemInfo>
                      <ListItemArtist>{artist.tracks.length} tracks</ListItemArtist>
                    </ListItem>
                  ))}
                </ListView>
              )}
            </ScrollContainer>
            <StatsContainer>
              <div>{Object.keys(artistMap).length} artists</div>
              <div>{filteredTracks.length} tracks</div>
            </StatsContainer>
          </ContentContainer>
        );

      case 'songs':
        // Render tracks
        return (
          <ContentContainer>
            <ScrollContainer>
              {viewMode === 'grid' ? (
                <GridView>
                  {filteredTracks.map((track, index) => (
                    <GridItem key={track.id || index}>
                      <ItemCover>
                        {track.artwork ? <img src={track.artwork} alt={track.title} /> : <Music size={40} />}
                      </ItemCover>
                      <ItemInfo>
                        <ItemTitle>{track.title}</ItemTitle>
                        <ItemSubtitle>{track.artist}</ItemSubtitle>
                        <ItemSubtitle>{track.album}</ItemSubtitle>
                      </ItemInfo>
                    </GridItem>
                  ))}
                </GridView>
              ) : (
                <ListView>
                  {filteredTracks.map((track, index) => (
                     <ListItem key={track.id || index}>
                      <ListItemCover>
                         {track.artwork ? <img src={track.artwork} alt={track.title} /> : <Music size={20} />}
                      </ListItemCover>
                      <ItemInfo>
                        <ItemTitle>{track.title}</ItemTitle>
                        <ItemSubtitle>{track.album}</ItemSubtitle>
                      </ItemInfo>
                      <ListItemArtist>{track.artist}</ListItemArtist>
                    </ListItem>
                  ))}
                </ListView>
              )}
            </ScrollContainer>
            <StatsContainer>
              <div>{filteredTracks.length} tracks</div>
            </StatsContainer>
          </ContentContainer>
        );

      case 'playlists':
        // Render playlists
        return (
          <ContentContainer>
            <ScrollContainer>
              <NoContentMessage>
                <Star size={48} />
                <div>
                  <MessageTitle>No Playlists Yet</MessageTitle>
                  <MessageText>
                    Create playlists to organize your music and create custom collections.
                  </MessageText>
                </div>
              </NoContentMessage>
            </ScrollContainer>
          </ContentContainer>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      {/* Side panel with library navigation */}
      <SidePanel title="LIBRARY">
        <ScrollContainer>
          <MenuSection>
            <MenuHeader>BROWSE</MenuHeader>
            <MenuItem
              $active={activeMenuItem === 'allMusic'}
              onClick={() => handleMenuItemClick('allMusic')}
            >
              <Music size={18} />
              <span>All Music</span>
            </MenuItem>
            <MenuItem
              $active={activeMenuItem === 'albums'}
              onClick={() => handleMenuItemClick('albums')}
            >
              <Disc size={18} />
              <span>Albums</span>
            </MenuItem>
            <MenuItem
              $active={activeMenuItem === 'artists'}
              onClick={() => handleMenuItemClick('artists')}
            >
              <User size={18} />
              <span>Artists</span>
            </MenuItem>
            <MenuItem
              $active={activeMenuItem === 'songs'}
              onClick={() => handleMenuItemClick('songs')}
            >
              <Music size={18} />
              <span>Songs</span>
            </MenuItem>
          </MenuSection>

          <MenuSection>
            <MenuHeader>YOUR LIBRARY</MenuHeader>
            <MenuItem
              $active={activeMenuItem === 'playlists'}
              onClick={() => handleMenuItemClick('playlists')}
            >
              <List size={18} />
              <span>Playlists</span>
            </MenuItem>
            <MenuItem
              $active={activeMenuItem === 'favorites'}
              onClick={() => handleMenuItemClick('favorites')}
            >
              <Star size={18} />
              <span>Favorites</span>
            </MenuItem>
            <MenuItem
              $active={activeMenuItem === 'radio'}
              onClick={() => handleMenuItemClick('radio')}
            >
              <Radio size={18} />
              <span>Radio</span>
            </MenuItem>
          </MenuSection>
        </ScrollContainer>

        <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--borderSubtle)' }}>
          <ToolButton onClick={toggleImport} style={{ width: '100%' }}>
            <FolderOpen size={16} />
            <span>Import Music</span>
          </ToolButton>
        </div>
      </SidePanel>

      {/* Main panel with library content */}
      <MainPanel>
        <div style={{ padding: 'var(--spacing-md)' }}>
          {/* Tabs for different content types */}
          <TabsList>
            <Tab $active={activeTab === 'music'} onClick={() => setActiveTab('music')}>
              <Music size={16} />
              <span>Music</span>
            </Tab>
          </TabsList>

          {/* Search and tools */}
          <SearchBar>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search Library..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchBar>

          {/* Toolbar with actions */}
          <ToolBar>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              <ToolButton onClick={handleScanLibrary}>
                <RefreshCw size={16} />
                <span>Refresh</span>
              </ToolButton>
              <ToolButton>
                <Filter size={16} />
                <span>Filter</span>
              </ToolButton>
              <ToolButton>
                <SortAsc size={16} />
                <span>Sort</span>
              </ToolButton>
            </div>

            <ViewModeButtons>
              <ViewButton
                $active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid size={16} />
              </ViewButton>
              <ViewButton
                $active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </ViewButton>
            </ViewModeButtons>
          </ToolBar>
        </div>

        {/* Render content based on selected view */}
        {renderContent()}
      </MainPanel>
    </PageContainer>
  );
};

export default LibraryPage;