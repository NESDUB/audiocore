/**
 * MetadataService.js
 * Service for extracting and managing audio file metadata
 */

import { readFileAsArrayBuffer, getMimeTypeFromFileName } from './FileSystemService';
import { Buffer } from 'buffer';
window.Buffer = Buffer; // Make Buffer available globally

// Fields to extract from metadata
const METADATA_FIELDS = [
  'title',    // Song title
  'artist',   // Track artist
  'album',    // Album name
  'year',     // Release year
  'track',    // Track number
  'genre',    // Music genre
  'composer', // Music composer
  'duration', // Track duration
  'picture',  // Album artwork
  'albumArtist', // Album artist (may differ from track artist)
  'discNumber',  // Disc number for multi-disc albums
  'bpm'          // Beats per minute
];

/**
 * Extract metadata from an audio file
 * @param {File|FileSystemFileHandle} fileOrHandle - File or FileSystemFileHandle to extract metadata from
 * @returns {Promise<Object>} Extracted metadata object
 */
const extractMetadata = async (fileOrHandle) => {
  try {
    // Get the file as object first to ensure we can access it
    const file = fileOrHandle instanceof File ? fileOrHandle : await fileOrHandle.getFile();
    // Then get the array buffer for parsing
    const arrayBuffer = await readFileAsArrayBuffer(fileOrHandle);
    const fileName = file.name;

    // Determine file type and call appropriate parser
    const extension = fileName.split('.').pop().toLowerCase();

    let metadata = {
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type || `audio/${extension}`,
      lastModified: file.lastModified
    };

    // --- IMPORTANT ---
    // Replace placeholders below with actual metadata parsing logic
    // using a library like music-metadata-browser or custom parsing.
    // The parsing should populate `metadata.picture` with an object like:
    // { data: ArrayBuffer, format: 'image/jpeg', description: 'Cover (front)', ... }
    // --- IMPORTANT ---

    switch (extension) {
      case 'mp3':
        metadata = { ...metadata, ...await parseMP3Metadata(arrayBuffer) };
        break;
      case 'flac':
        metadata = { ...metadata, ...await parseFLACMetadata(arrayBuffer) };
        break;
      case 'm4a':
      case 'aac':
        metadata = { ...metadata, ...await parseM4AMetadata(arrayBuffer) };
        break;
      case 'ogg':
      case 'opus':
        metadata = { ...metadata, ...await parseOggMetadata(arrayBuffer) };
        break;
      case 'wav':
        metadata = { ...metadata, ...await parseWAVMetadata(arrayBuffer) };
        break;
      default:
        // For unsupported formats, use file name for basic metadata
        metadata = { ...metadata, ...parseFileNameForMetadata(fileName) };
    }

    // Clean up and normalize metadata (includes artwork processing now)
    return normalizeMetadata(metadata);
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // Return basic metadata from filename if extraction fails
    let file;
    try {
      file = fileOrHandle instanceof File ? fileOrHandle : await fileOrHandle.getFile();
    } catch (fileError) {
      console.error('Failed to access file for metadata fallback:', fileError);
    }

    // Create basic fallback metadata object
    const fallbackMetadata = file ? {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || getMimeTypeFromFileName(file.name),
      lastModified: file.lastModified,
      ...parseFileNameForMetadata(file.name),
      title: parseFileNameForMetadata(file.name).title || null,
      artist: parseFileNameForMetadata(file.name).artist || null,
      album: null,
      duration: null
    } : {
      fileName: "Unknown file",
      title: "Unknown track",
      artist: null,
      album: null,
      duration: null
    };

    // Ensure fallback is also normalized (setting nulls and artwork field)
    return normalizeMetadata(fallbackMetadata);
  }
};

/**
 * Parse MP3 metadata (ID3 tags) - Placeholder
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */

const parseMP3Metadata = async (arrayBuffer) => {
  try {
    // Use music-metadata-browser properly in browser context
    const mm = await import('music-metadata-browser');
    const metadata = await mm.parseBlob(new Blob([arrayBuffer], { type: 'audio/mpeg' }));
    
    // Return processed metadata
    return { 
      ...metadata.common,
      picture: metadata.common.picture?.[0],
      duration: metadata.format.duration,
      sampleRate: metadata.format.sampleRate,
      bitrate: metadata.format.bitrate,
      channels: metadata.format.numberOfChannels
    };
  } catch (error) {
    console.error('Error parsing MP3 metadata:', error);
    return { format: 'MP3' };
  }
};

/**
 * Parse FLAC metadata - Placeholder
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseFLACMetadata = async (arrayBuffer) => {
  try {
    const mm = await import('music-metadata-browser');
    const metadata = await mm.parseBlob(new Blob([arrayBuffer], { type: 'audio/flac' }));
    return { 
      ...metadata.common,
      picture: metadata.common.picture?.[0],
      duration: metadata.format.duration,
      lossless: true,
      sampleRate: metadata.format.sampleRate,
      bitrate: metadata.format.bitrate,
      channels: metadata.format.numberOfChannels
    };
  } catch (error) {
    console.error('Error parsing FLAC metadata:', error);
    return { format: 'FLAC', lossless: true };
  }
};

/**
 * Parse M4A/AAC metadata (atoms/boxes) - Placeholder
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseM4AMetadata = async (arrayBuffer) => {
  // Placeholder - Implement actual M4A parsing
  return { format: 'M4A/AAC' };
};

/**
 * Parse Ogg metadata (Vorbis comments) - Placeholder
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseOggMetadata = async (arrayBuffer) => {
  // Placeholder - Implement actual Ogg Vorbis parsing
  return { format: 'Ogg' };
};

/**
 * Parse WAV metadata (RIFF format) - Placeholder
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseWAVMetadata = async (arrayBuffer) => {
  // Placeholder - Implement actual WAV RIFF parsing
  return { format: 'WAV', lossless: true };
};

/**
 * Extract basic metadata from filename
 * @param {string} fileName - Name of the file
 * @returns {Object} Basic metadata object
 */
const parseFileNameForMetadata = (fileName) => {
  if (!fileName) return { title: null };
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

  let title = nameWithoutExt;
  let artist = null;
  let trackNum = null;

  // Common patterns: "Artist - Title", "Track# - Title", "Artist - Album - Track# - Title"
  const artistTitleMatch = nameWithoutExt.match(/^(.*?)\s+-\s+(.*)$/);
  if (artistTitleMatch) {
    artist = artistTitleMatch[1].trim();
    title = artistTitleMatch[2].trim();
    const trackMatch = title.match(/^(\d+)[\s.-]+(.*)$/);
    if (trackMatch) {
      trackNum = parseInt(trackMatch[1], 10);
      title = trackMatch[2].trim();
    }
  } else {
    const trackTitleMatch = nameWithoutExt.match(/^(\d+)[\s.-]+(.*)$/);
    if (trackTitleMatch) {
      trackNum = parseInt(trackTitleMatch[1], 10);
      title = trackTitleMatch[2].trim();
      // Maybe try to guess artist from folder structure later if needed
    }
  }

  return { title, artist, track: trackNum };
};

// Helper function to convert ArrayBuffer to Base64 string
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Only use window.btoa for browser environment
  return window.btoa(binary);
};

/**
 * Extract cover art data from metadata and convert to Data URL
 * @param {Object} metadata - Track metadata potentially containing picture data
 * @returns {Object|null} Cover art object with Data URL, or null if not present/error
 */
const extractCoverArt = (metadata) => {
  // Ensure picture data exists and is likely an ArrayBuffer or TypedArray
  // Also check for a format (MIME type)
  if (!metadata.picture || !metadata.picture.data || !metadata.picture.data.byteLength || !metadata.picture.format) {
    return null;
  }

  const { picture } = metadata;

  try {
    // Convert the picture data (assumed ArrayBuffer/TypedArray) to Base64
    const base64String = arrayBufferToBase64(picture.data);

    // Create the Data URL
    const dataUrl = `data:${picture.format};base64,${base64String}`;

    // Return the Data URL instead of the blob URL object
    return {
      url: dataUrl, // This is now a persistent Data URL
      format: picture.format,
      description: picture.description,
      type: picture.type,
      // width/height might still be useful if extracted by the metadata library
      width: picture.width,
      height: picture.height,
    };
  } catch (error) {
    console.error("Error converting image data to Base64:", error);
    return null; // Return null if conversion fails
  }
};


/**
 * Normalize and clean up metadata, including artwork processing
 * @param {Object} metadata - Raw metadata object
 * @returns {Object} Normalized metadata
 */
const normalizeMetadata = (metadata) => {
  const normalized = { ...metadata };

  // Ensure all expected fields exist, setting to null if undefined
  METADATA_FIELDS.forEach(field => {
    if (!(field in normalized)) {
      normalized[field] = null;
    }
  });

  // --- Specific Field Normalization ---

  // Track Number (handle "1/12" format or simple number)
  if (typeof normalized.track === 'string') {
    const trackMatch = normalized.track.match(/^(\d+)(?:[\s\/.-]\d+)?$/); // More robust match
    normalized.track = trackMatch ? parseInt(trackMatch[1], 10) : null;
  } else if (typeof normalized.track !== 'number') {
    normalized.track = null;
  }

  // Disc Number (similar to track)
  if (typeof normalized.discNumber === 'string') {
      const discMatch = normalized.discNumber.match(/^(\d+)(?:[\s\/.-]\d+)?$/);
      normalized.discNumber = discMatch ? parseInt(discMatch[1], 10) : null;
  } else if (typeof normalized.discNumber !== 'number') {
      normalized.discNumber = null;
  }

  // Year (extract 4-digit year from strings)
  if (normalized.year) {
    if (typeof normalized.year === 'string') {
      const yearMatch = normalized.year.match(/\b(19\d{2}|20\d{2})\b/);
      normalized.year = yearMatch ? parseInt(yearMatch[1], 10) : null;
    } else if (typeof normalized.year !== 'number' || normalized.year < 1000 || normalized.year > 3000) {
        // Basic validation for numeric year
        normalized.year = null;
    }
  }

  // BPM (ensure it's a number)
  if (normalized.bpm && typeof normalized.bpm !== 'number') {
    const bpmNum = parseFloat(normalized.bpm);
    normalized.bpm = !isNaN(bpmNum) && bpmNum > 0 ? bpmNum : null;
  }

  // Trim string fields
  ['title', 'artist', 'album', 'genre', 'composer', 'albumArtist'].forEach(field => {
    if (typeof normalized[field] === 'string') {
      normalized[field] = normalized[field].trim() || null; // Set to null if whitespace only
    } else if (normalized[field] !== null) {
        // Ensure non-strings are null if not already
        normalized[field] = null;
    }
  });

  // --- Artwork Processing ---
  // Extract cover art and add its *Data URL* to the normalized metadata
  const coverArt = extractCoverArt(normalized); // Use the updated extractCoverArt
  normalized.artwork = coverArt ? coverArt.url : null;

  // Decision: Remove raw 'picture' data after processing?
  // Pros: Saves significant space in localStorage.
  // Cons: Raw data lost if needed later for other purposes (unlikely for basic display).
  // Let's remove it for storage efficiency:
  delete normalized.picture;

  // --- ID Generation ---
  normalized.id = generateTrackId(normalized);

  return normalized;
};

/**
 * Generate a unique ID for a track based on metadata
 * @param {Object} metadata - Track metadata
 * @returns {string} Unique ID
 */
const generateTrackId = (metadata) => {
  // Use a combination of fields likely to be unique, fallback to filename/size
  const parts = [
    metadata.artist || 'unknown',
    metadata.album || 'unknown',
    metadata.track || '0',
    metadata.title || metadata.fileName || 'unknown'
  ];

  // Use path and size for more robustness if available
  const pathPart = metadata.path || metadata.fileName || '';
  const sizePart = metadata.fileSize || '0';

  // Simple hash function (djb2) for the path part to keep ID length reasonable
  let hash = 5381;
  for (let i = 0; i < pathPart.length; i++) {
    hash = ((hash << 5) + hash) + pathPart.charCodeAt(i); /* hash * 33 + c */
  }

  parts.push(hash.toString());
  parts.push(sizePart.toString());

  const idString = parts.join('-').toLowerCase().replace(/[^a-z0-9-_]+/g, '_').replace(/_{2,}/g, '_');

  // Limit ID length if necessary (though collisions are less likely now)
  return `track-${idString.substring(0, 100)}`;
};


/**
 * Create an album object from track metadata
 * @param {Array} tracks - Array of tracks with metadata
 * @returns {Array} Array of album objects
 */
const createAlbumFromTracks = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return []; // Return empty array instead of null
  }

  const albumGroups = {};

  tracks.forEach(track => {
    // Use a combined key for better grouping (Album + AlbumArtist or Artist)
    const albumTitle = track.album || 'Unknown Album';
    const albumArtist = track.albumArtist || track.artist || 'Unknown Artist';
    const albumKey = `${albumTitle}-${albumArtist}`;

    if (!albumGroups[albumKey]) {
      albumGroups[albumKey] = {
        title: albumTitle,
        artist: albumArtist,
        year: track.year, // Use year from first track encountered
        genre: track.genre, // Use genre from first track
        tracks: [],
        artwork: null // Initialize artwork for the album
      };
    }

    albumGroups[albumKey].tracks.push(track);

    // Find the first available artwork for the album
    if (!albumGroups[albumKey].artwork && track.artwork) {
      albumGroups[albumKey].artwork = track.artwork;
    }
    // Update year/genre if the current track has one and the album doesn't yet
    if (!albumGroups[albumKey].year && track.year) {
        albumGroups[albumKey].year = track.year;
    }
    if (!albumGroups[albumKey].genre && track.genre) {
        albumGroups[albumKey].genre = track.genre;
    }
  });

  // Convert groups to album objects
  return Object.keys(albumGroups).map(key => {
    const albumData = albumGroups[key];

    // Sort tracks by disc and track number
    const sortedTracks = [...albumData.tracks].sort((a, b) => {
      const discA = a.discNumber || 1;
      const discB = b.discNumber || 1;
      if (discA !== discB) {
        return discA - discB;
      }
      const trackA = a.track || 0;
      const trackB = b.track || 0;
      return trackA - trackB;
    });

    const trackIds = sortedTracks.map(track => track.id);

    return {
      id: `album-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: albumData.title,
      artist: albumData.artist,
      year: albumData.year,
      genre: albumData.genre,
      tracks: trackIds,
      trackCount: trackIds.length,
      duration: albumData.tracks.reduce((total, track) => total + (track.duration || 0), 0),
      artwork: albumData.artwork // Use the artwork found earlier
    };
  });
};

/**
 * Create artist objects from track metadata
 * @param {Array} tracks - Array of tracks with metadata
 * @returns {Array} Array of artist objects
 */
const createArtistsFromTracks = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return [];
  }

  const artistGroups = {};

  tracks.forEach(track => {
    // Consider both track artist and album artist? For now, just track artist.
    const artistName = track.artist || 'Unknown Artist';

    if (!artistGroups[artistName]) {
      artistGroups[artistName] = {
        tracks: [],
        albums: new Set(),
        // Add artwork field, find first available
        artwork: null
      };
    }

    artistGroups[artistName].tracks.push(track);
    if (track.album) {
      artistGroups[artistName].albums.add(track.album);
    }
    // Find first available artwork for the artist
    if (!artistGroups[artistName].artwork && track.artwork) {
      artistGroups[artistName].artwork = track.artwork;
    }
  });

  // Convert groups to artist objects
  return Object.keys(artistGroups).map(artistName => {
    const group = artistGroups[artistName];
    const trackIds = group.tracks.map(track => track.id);
    // Generate album IDs for linking if needed (optional)
    const albumIds = Array.from(group.albums).map(albumTitle =>
        `album-${(albumTitle + '-' + artistName).toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    );

    return {
      id: `artist-${artistName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: artistName,
      trackCount: trackIds.length,
      albumCount: group.albums.size,
      // Optionally store track/album IDs
      // tracks: trackIds,
      // albums: albumIds,
      artwork: group.artwork // Store the found artwork
    };
  });
};

/**
 * Calculate audio statistics from metadata
 * @param {Object} metadata - Audio file metadata (normalized)
 * @returns {Object} Audio statistics
 */
const calculateAudioStats = (metadata) => {
  const stats = {
    duration: metadata.duration || 0,
    sampleRate: metadata.sampleRate,
    channels: metadata.channels,
    bitDepth: metadata.bitDepth,
    lossless: metadata.lossless || false,
    bitrate: null // Initialize bitrate
  };

  if (metadata.fileSize && metadata.duration && metadata.duration > 0) {
    stats.bitrate = Math.round((metadata.fileSize * 8) / (metadata.duration * 1000)); // kbps
  } else if (metadata.bitrate) {
      // Use bitrate directly from metadata if available (e.g., VBR MP3s)
      stats.bitrate = Math.round(metadata.bitrate / 1000); // convert bps to kbps
  }

  return stats;
};

/**
 * Revoke blob URLs for album artwork - NO LONGER NEEDED WITH DATA URLS
 * @param {Object} metadata - Metadata object
 */
const revokeCoverArtUrls = (metadata) => {
  // This function is now obsolete because we are using Data URLs,
  // which don't need to be revoked.
  // Keeping the empty function signature for compatibility if called elsewhere,
  // but ideally remove calls to this function.
  if (metadata && metadata.picture && metadata.picture._blobUrl) {
      // console.warn("revokeCoverArtUrls called, but Blob URLs are no longer used.");
      // URL.revokeObjectURL(metadata.picture._blobUrl); // No longer necessary
  }
};


export {
  extractMetadata,
  parseFileNameForMetadata,
  normalizeMetadata,
  // extractCoverArt is now internal to normalizeMetadata implicitly
  createAlbumFromTracks,
  createArtistsFromTracks,
  calculateAudioStats,
  revokeCoverArtUrls, // Keep export for now, but mark as deprecated/obsolete
  METADATA_FIELDS
};

export default {
  extractMetadata,
  parseFileNameForMetadata,
  normalizeMetadata,
  // extractCoverArt not exported directly
  createAlbumFromTracks,
  createArtistsFromTracks,
  calculateAudioStats,
  revokeCoverArtUrls,
  METADATA_FIELDS
};