// src/features/contextmenu/config/menuConfigs.js
import {
  Play,
  Pause,
  ListPlus,
  Heart,
  Disc,
  User,
  Info,
  Radio,
  ListMusic,
  Edit,
  Trash,
  Share,
  Download
} from 'lucide-react';

// Player/audio-related actions
export const trackMenuItems = (track, playerActions) => {
  const { currentTrack, isPlaying, play, pause, playTrack, toggleFavorite } = playerActions;
  const isCurrentTrack = currentTrack && currentTrack.id === track?.id;
  const isFavorite = track?.isFavorite;

  return [
    {
      label: isCurrentTrack && isPlaying ? 'Pause' : 'Play',
      icon: isCurrentTrack && isPlaying ? Pause : Play,
      onClick: () => {
        if (isCurrentTrack) {
          isPlaying ? pause() : play();
        } else {
          playTrack(track);
        }
      },
      isSelected: isCurrentTrack,
    },
    {
      label: 'Add to Queue',
      icon: ListPlus,
      onClick: () => playerActions.addToQueue(track),
    },
    {
      label: 'Add to Playlist...',
      icon: ListMusic,
      onClick: () => playerActions.addToPlaylist(track),
    },
    {
      label: 'Start Radio',
      icon: Radio,
      onClick: () => playerActions.createRadio(track),
    },
    { isDivider: true },
    {
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: Heart,
      onClick: () => toggleFavorite(track.id),
      isSelected: isFavorite,
    },
    { isDivider: true },
    {
      label: 'Go to Album',
      icon: Disc,
      onClick: () => playerActions.navigateToAlbum(track.albumId),
      disabled: !track.album,
    },
    {
      label: 'Go to Artist',
      icon: User,
      onClick: () => playerActions.navigateToArtist(track.artistId),
      disabled: !track.artist,
    },
    { isDivider: true },
    {
      label: 'Track Details',
      icon: Info,
      onClick: () => playerActions.showTrackDetails(track),
    },
  ];
};

// Album-related actions
export const albumMenuItems = (album, actions) => [
  {
    label: 'Play Album',
    icon: Play,
    onClick: () => actions.playAlbum(album),
  },
  {
    label: 'Add to Queue',
    icon: ListPlus,
    onClick: () => actions.addAlbumToQueue(album),
  },
  { isDivider: true },
  {
    label: album.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
    icon: Heart, 
    onClick: () => actions.toggleFavoriteAlbum(album.id),
    isSelected: album.isFavorite,
  },
  { isDivider: true },
  {
    label: 'Go to Artist',
    icon: User,
    onClick: () => actions.navigateToArtist(album.artistId),
    disabled: !album.artist,
  },
  {
    label: 'Album Details',
    icon: Info,
    onClick: () => actions.showAlbumDetails(album),
  },
];

// Artist-related actions
export const artistMenuItems = (artist, actions) => [
  {
    label: 'Play All',
    icon: Play,
    onClick: () => actions.playArtist(artist),
  },
  {
    label: 'Add to Queue',
    icon: ListPlus,
    onClick: () => actions.addArtistToQueue(artist),
  },
  { isDivider: true },
  {
    label: artist.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
    icon: Heart,
    onClick: () => actions.toggleFavoriteArtist(artist.id),
    isSelected: artist.isFavorite,
  },
  { isDivider: true },
  {
    label: 'Artist Details',
    icon: Info,
    onClick: () => actions.showArtistDetails(artist),
  },
];

// Playlist-related actions
export const playlistMenuItems = (playlist, actions) => [
  {
    label: 'Play Playlist',
    icon: Play,
    onClick: () => actions.playPlaylist(playlist),
  },
  { isDivider: true },
  {
    label: 'Edit Playlist',
    icon: Edit,
    onClick: () => actions.editPlaylist(playlist),
  },
  {
    label: 'Delete Playlist',
    icon: Trash,
    onClick: () => actions.deletePlaylist(playlist),
  },
  { isDivider: true },
  {
    label: 'Share Playlist',
    icon: Share,
    onClick: () => actions.sharePlaylist(playlist),
  },
];