/**
 * MetadataService.js
 * Service for extracting and managing audio file metadata
 */

import { readFileAsArrayBuffer } from './FileSystemService';

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
    // Get the file data as ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(fileOrHandle);
    const file = fileOrHandle instanceof File ? fileOrHandle : await fileOrHandle.getFile();
    const fileName = file.name;
    
    // Determine file type and call appropriate parser
    const extension = fileName.split('.').pop().toLowerCase();
    
    let metadata = {
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type || `audio/${extension}`,
      lastModified: file.lastModified
    };
    
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
    
    // Clean up metadata
    return normalizeMetadata(metadata);
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // Return basic metadata from filename if extraction fails
    const file = fileOrHandle instanceof File ? fileOrHandle : await fileOrHandle.getFile();
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified,
      ...parseFileNameForMetadata(file.name)
    };
  }
};

/**
 * Parse MP3 metadata (ID3 tags)
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseMP3Metadata = async (arrayBuffer) => {
  // Placeholder for ID3 tag parsing
  // In a real implementation, this would use a library like music-metadata-browser
  // or implement ID3v1/ID3v2 parsing
  
  try {
    // Simple ID3v2 header detection
    const dataView = new DataView(arrayBuffer);
    const id3Header = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2)
    );
    
    if (id3Header === 'ID3') {
      // ID3 tag detected, but we need a full parser to read it
      // For now, return placeholder data
      return {
        format: 'MP3',
        hasID3: true
      };
    }
    
    return {
      format: 'MP3',
      hasID3: false
    };
  } catch (error) {
    console.error('Error parsing MP3 metadata:', error);
    return { format: 'MP3' };
  }
};

/**
 * Parse FLAC metadata
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseFLACMetadata = async (arrayBuffer) => {
  // Placeholder for FLAC metadata parsing
  // In a real implementation, this would parse FLAC headers and Vorbis comments
  
  try {
    // Simple FLAC header detection
    const dataView = new DataView(arrayBuffer);
    const flacSignature = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );
    
    if (flacSignature === 'fLaC') {
      // FLAC file detected
      return {
        format: 'FLAC',
        lossless: true
      };
    }
    
    return {
      format: 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing FLAC metadata:', error);
    return { format: 'FLAC' };
  }
};

/**
 * Parse M4A/AAC metadata (atoms/boxes)
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseM4AMetadata = async (arrayBuffer) => {
  // Placeholder for M4A/AAC metadata parsing
  // This would require parsing the MP4 container format
  
  return {
    format: 'M4A/AAC'
  };
};

/**
 * Parse Ogg metadata (Vorbis comments)
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseOggMetadata = async (arrayBuffer) => {
  // Placeholder for Ogg metadata parsing
  // This would require parsing Ogg container and Vorbis comments
  
  try {
    // Simple Ogg header detection
    const dataView = new DataView(arrayBuffer);
    const oggSignature = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );
    
    if (oggSignature === 'OggS') {
      return {
        format: 'Ogg'
      };
    }
    
    return {
      format: 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing Ogg metadata:', error);
    return { format: 'Ogg' };
  }
};

/**
 * Parse WAV metadata (RIFF format)
 * @param {ArrayBuffer} arrayBuffer - File data
 * @returns {Promise<Object>} Metadata object
 */
const parseWAVMetadata = async (arrayBuffer) => {
  // Placeholder for WAV metadata parsing
  // This would require parsing RIFF chunks and possible LIST INFO tags
  
  try {
    // Simple WAV header detection
    const dataView = new DataView(arrayBuffer);
    const riffSignature = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );
    
    if (riffSignature === 'RIFF') {
      const waveSignature = String.fromCharCode(
        dataView.getUint8(8),
        dataView.getUint8(9),
        dataView.getUint8(10),
        dataView.getUint8(11)
      );
      
      if (waveSignature === 'WAVE') {
        // Extract basic audio properties
        try {
          // Find fmt chunk
          let offset = 12;
          while (offset < dataView.byteLength - 8) {
            const chunkId = String.fromCharCode(
              dataView.getUint8(offset),
              dataView.getUint8(offset + 1),
              dataView.getUint8(offset + 2),
              dataView.getUint8(offset + 3)
            );
            
            const chunkSize = dataView.getUint32(offset + 4, true);
            
            if (chunkId === 'fmt ') {
              const formatCode = dataView.getUint16(offset + 8, true);
              const channels = dataView.getUint16(offset + 10, true);
              const sampleRate = dataView.getUint32(offset + 12, true);
              const bitDepth = dataView.getUint16(offset + 22, true);
              
              return {
                format: 'WAV',
                formatCode,
                channels,
                sampleRate,
                bitDepth,
                lossless: true
              };
            }
            
            offset += 8 + chunkSize;
            // Ensure word-alignment
            if (chunkSize % 2 !== 0) offset++;
          }
        } catch (e) {
          console.error('Error parsing WAV format chunk:', e);
        }
        
        return {
          format: 'WAV',
          lossless: true
        };
      }
    }
    
    return {
      format: 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing WAV metadata:', error);
    return { format: 'WAV' };
  }
};

/**
 * Extract basic metadata from filename
 * @param {string} fileName - Name of the file
 * @returns {Object} Basic metadata object
 */
const parseFileNameForMetadata = (fileName) => {
  // Remove file extension
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  
  // Common filename formats:
  // 1. Artist - Title
  // 2. Track# - Title
  // 3. Artist - Album - Track# - Title
  
  // Try to extract artist and title
  let title = nameWithoutExt;
  let artist = '';
  
  // Check for Artist - Title format
  const artistTitleMatch = nameWithoutExt.match(/^(.*?)\s-\s(.*)$/);
  if (artistTitleMatch) {
    artist = artistTitleMatch[1].trim();
    title = artistTitleMatch[2].trim();
    
    // Check if the title includes track number
    const trackMatch = title.match(/^(\d+)[\s.-]+(.*)$/);
    if (trackMatch) {
      return {
        title: trackMatch[2].trim(),
        artist,
        track: parseInt(trackMatch[1], 10)
      };
    }
    
    return { title, artist };
  }
  
  // Check for Track# - Title format
  const trackTitleMatch = nameWithoutExt.match(/^(\d+)[\s.-]+(.*)$/);
  if (trackTitleMatch) {
    return {
      title: trackTitleMatch[2].trim(),
      track: parseInt(trackTitleMatch[1], 10)
    };
  }
  
  // If no pattern matched, just return the filename as title
  return { title };
};

/**
 * Normalize and clean up metadata
 * @param {Object} metadata - Raw metadata object
 * @returns {Object} Normalized metadata
 */
const normalizeMetadata = (metadata) => {
  const normalized = { ...metadata };
  
  // Ensure all fields exist
  METADATA_FIELDS.forEach(field => {
    if (normalized[field] === undefined) {
      normalized[field] = null;
    }
  });
  
  // Normalize track number (could be "1/12" format)
  if (typeof normalized.track === 'string') {
    const trackMatch = normalized.track.match(/^(\d+)(?:\/\d+)?$/);
    if (trackMatch) {
      normalized.track = parseInt(trackMatch[1], 10);
    } else {
      normalized.track = null;
    }
  }
  
  // Ensure year is a number if present
  if (normalized.year) {
    if (typeof normalized.year === 'string') {
      // Extract year from possible date format
      const yearMatch = normalized.year.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        normalized.year = parseInt(yearMatch[1], 10);
      } else {
        normalized.year = null;
      }
    }
  }
  
  // Generate an ID for the track
  normalized.id = generateTrackId(normalized);
  
  return normalized;
};

/**
 * Generate a unique ID for a track based on metadata
 * @param {Object} metadata - Track metadata
 * @returns {string} Unique ID
 */
const generateTrackId = (metadata) => {
  const idParts = [];
  
  if (metadata.artist) idParts.push(metadata.artist);
  if (metadata.album) idParts.push(metadata.album);
  if (metadata.title) idParts.push(metadata.title);
  else if (metadata.fileName) idParts.push(metadata.fileName);
  
  // Add file size as further uniqueness
  if (metadata.fileSize) idParts.push(metadata.fileSize.toString());
  
  // Join parts and create ID
  const idString = idParts.join('-').toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `track-${idString}`;
};

/**
 * Extract cover art data from metadata
 * @param {Object} metadata - Track metadata with picture
 * @returns {Object|null} Cover art object with MIME type and data, or null if not present
 */
const extractCoverArt = (metadata) => {
  if (!metadata.picture || !metadata.picture.data) {
    return null;
  }
  
  const { picture } = metadata;
  
  // Create a blob from the picture data
  const blob = new Blob([picture.data], { type: picture.format });
  const url = URL.createObjectURL(blob);
  
  return {
    url,
    format: picture.format,
    description: picture.description,
    type: picture.type, // Cover front, back, etc.
    width: picture.width,
    height: picture.height,
    // Store reference to revoke URL later
    _blobUrl: url
  };
};

/**
 * Create an album object from track metadata
 * @param {Array} tracks - Array of tracks with metadata
 * @returns {Object} Album object
 */
const createAlbumFromTracks = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return null;
  }
  
  // Group tracks by album
  const albumGroups = {};
  
  tracks.forEach(track => {
    if (!track.album) return;
    
    const albumKey = `${track.album}-${track.artist || 'Unknown'}`;
    
    if (!albumGroups[albumKey]) {
      albumGroups[albumKey] = [];
    }
    
    albumGroups[albumKey].push(track);
  });
  
  // Convert groups to album objects
  return Object.keys(albumGroups).map(key => {
    const albumTracks = albumGroups[key];
    const firstTrack = albumTracks[0];
    
    // Sort tracks by track number if available
    const sortedTracks = [...albumTracks].sort((a, b) => {
      if (a.track && b.track) return a.track - b.track;
      return 0;
    });
    
    const trackIds = sortedTracks.map(track => track.id);
    
    // Find the first track with cover art
    const trackWithCover = albumTracks.find(track => track.picture);
    
    return {
      id: `album-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: firstTrack.album,
      artist: firstTrack.albumArtist || firstTrack.artist,
      year: firstTrack.year,
      genre: firstTrack.genre,
      tracks: trackIds,
      trackCount: trackIds.length,
      duration: albumTracks.reduce((total, track) => total + (track.duration || 0), 0),
      picture: trackWithCover ? trackWithCover.picture : null
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
  
  // Group tracks by artist
  const artistGroups = {};
  
  tracks.forEach(track => {
    if (!track.artist) return;
    
    const artistName = track.artist;
    
    if (!artistGroups[artistName]) {
      artistGroups[artistName] = {
        tracks: [],
        albums: new Set()
      };
    }
    
    artistGroups[artistName].tracks.push(track);
    if (track.album) {
      artistGroups[artistName].albums.add(track.album);
    }
  });
  
  // Convert groups to artist objects
  return Object.keys(artistGroups).map(artistName => {
    const group = artistGroups[artistName];
    const trackIds = group.tracks.map(track => track.id);
    
    return {
      id: `artist-${artistName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: artistName,
      trackCount: trackIds.length,
      albumCount: group.albums.size,
      tracks: trackIds,
      albums: Array.from(group.albums)
    };
  });
};

/**
 * Calculate audio statistics from metadata
 * @param {Object} metadata - Audio file metadata
 * @returns {Object} Audio statistics
 */
const calculateAudioStats = (metadata) => {
  // Basic stats
  const stats = {
    duration: metadata.duration || 0,
    sampleRate: metadata.sampleRate,
    channels: metadata.channels,
    bitDepth: metadata.bitDepth,
    lossless: metadata.lossless || false
  };
  
  // Calculate bitrate if file size and duration are available
  if (metadata.fileSize && metadata.duration && metadata.duration > 0) {
    // Bitrate in kbps
    stats.bitrate = Math.round((metadata.fileSize * 8) / (metadata.duration * 1000));
  }
  
  return stats;
};

/**
 * Revoke blob URLs for album artwork to prevent memory leaks
 * @param {Object} metadata - Metadata object that may contain cover art with blob URLs
 */
const revokeCoverArtUrls = (metadata) => {
  if (metadata.picture && metadata.picture._blobUrl) {
    URL.revokeObjectURL(metadata.picture._blobUrl);
  }
};

export {
  extractMetadata,
  parseFileNameForMetadata,
  normalizeMetadata,
  extractCoverArt,
  createAlbumFromTracks,
  createArtistsFromTracks,
  calculateAudioStats,
  revokeCoverArtUrls,
  METADATA_FIELDS
};

export default {
  extractMetadata,
  parseFileNameForMetadata,
  normalizeMetadata,
  extractCoverArt,
  createAlbumFromTracks,
  createArtistsFromTracks,
  calculateAudioStats,
  revokeCoverArtUrls,
  METADATA_FIELDS
};