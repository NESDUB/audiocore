I'll create a comprehensive PlaylistProvider component that will handle all playlist-related functionality for your AudioCore music player.

I've created a comprehensive PlaylistProvider component for your AudioCore music player. This provider handles all playlist-related functionality and integrates with your existing Player and Notification systems.

## Key Features

- **Complete Playlist Management**: Create, update, delete, and view playlists
- **Track Management**: Add, remove, and reorder tracks within playlists
- **Smart System Playlists**: Built-in "Favorites" and "Recently Added" playlists
- **Local Storage**: Automatically saves/loads playlists to browser storage
- **Favorites Support**: Easy toggle for favorite tracks
- **UI Notifications**: Success/error feedback for all operations

## Core Functionality

### Playlist Operations
- Create new playlists with custom names, descriptions, icons, and colors
- Update existing playlist details
- Delete user-created playlists (system playlists are protected)
- Set active playlist for playback

### Track Management
- Add individual tracks to playlists
- Remove tracks from playlists
- Add multiple tracks at once (batch operations)
- Remove multiple tracks at once
- Reorder tracks within a playlist
- Toggle favorite status for any track

### System Integration
- Automatically updates "Recently Added" with new imported tracks
- Persists data to localStorage
- Provides error handling and user feedback via notifications

## Usage in Components

To use this provider in your components:

```jsx
import { usePlaylist } from '../features/playlists/providers/PlaylistProvider';

const MyComponent = () => {
  const { 
    playlists, 
    createPlaylist, 
    addTrackToPlaylist,
    toggleFavorite,
    isFavorite 
  } = usePlaylist();
  
  // Now you can use these functions and data in your component
};
```

This PlaylistProvider forms the foundation for playlist functionality in your AudioCore player and will integrate seamlessly with the UI components we've already developed.