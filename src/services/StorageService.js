/**
 * StorageService.js
 * Service for persistent storage of library data
 */

// Storage keys
const STORAGE_KEYS = {
  TRACKS: 'audiocore_tracks',
  ALBUMS: 'audiocore_albums',
  ARTISTS: 'audiocore_artists',
  PLAYLISTS: 'audiocore_playlists',
  FOLDERS: 'audiocore_folders',
  SETTINGS: 'audiocore_settings',
  LAST_SCAN: 'audiocore_last_scan'
};

// Size limit for localStorage (in bytes)
const LOCAL_STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB

/**
 * Check if IndexedDB is available
 * @returns {Promise<boolean>} True if IndexedDB is available
 */
const isIndexedDBAvailable = async () => {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('audiocore_test');
      
      request.onsuccess = () => {
        const db = request.result;
        db.close();
        indexedDB.deleteDatabase('audiocore_test');
        resolve(true);
      };
      
      request.onerror = () => {
        resolve(false);
      };
    } catch (error) {
      resolve(false);
    }
  });
};

/**
 * Save library data to storage
 * Falls back to localStorage if IndexedDB is not available
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @returns {Promise<boolean>} Success status
 */
const saveData = async (key, data) => {
  try {
    // Check if IndexedDB is available
    const useIndexedDB = await isIndexedDBAvailable();
    
    if (useIndexedDB) {
      return await saveToIndexedDB(key, data);
    } else {
      return saveToLocalStorage(key, data);
    }
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
};

/**
 * Load library data from storage
 * Falls back to localStorage if IndexedDB is not available
 * @param {string} key - Storage key
 * @returns {Promise<any>} Retrieved data or null if not found
 */
const loadData = async (key) => {
  try {
    // Check if IndexedDB is available
    const useIndexedDB = await isIndexedDBAvailable();
    
    if (useIndexedDB) {
      return await loadFromIndexedDB(key);
    } else {
      return loadFromLocalStorage(key);
    }
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove library data from storage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
const removeData = async (key) => {
  try {
    // Check if IndexedDB is available
    const useIndexedDB = await isIndexedDBAvailable();
    
    if (useIndexedDB) {
      return await removeFromIndexedDB(key);
    } else {
      return removeFromLocalStorage(key);
    }
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all library data from storage
 * @returns {Promise<boolean>} Success status
 */
const clearAllData = async () => {
  try {
    // Check if IndexedDB is available
    const useIndexedDB = await isIndexedDBAvailable();
    
    if (useIndexedDB) {
      return await clearIndexedDB();
    } else {
      return clearLocalStorage();
    }
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @returns {boolean} Success status
 */
const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    
    // Check if data size exceeds localStorage limit
    if (serializedData.length > LOCAL_STORAGE_LIMIT) {
      console.error(`Data size exceeds localStorage limit for key ${key}`);
      return false;
    }
    
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error);
    return false;
  }
};

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {any} Retrieved data or null if not found
 */
const loadFromLocalStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(key);
    
    if (!serializedData) {
      return null;
    }
    
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Error loading from localStorage for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all Audiocore data from localStorage
 * @returns {boolean} Success status
 */
const clearLocalStorage = () => {
  try {
    // Remove only Audiocore-related keys
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>} IndexedDB database connection
 */
const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudiocoreLibrary', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('library')) {
        db.createObjectStore('library', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(new Error('Error opening IndexedDB connection'));
    };
  });
};

/**
 * Save data to IndexedDB
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @returns {Promise<boolean>} Success status
 */
const saveToIndexedDB = async (key, data) => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readwrite');
      const store = transaction.objectStore('library');
      
      const request = store.put({
        id: key,
        data: data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error(`Error saving to IndexedDB for key ${key}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error saving to IndexedDB for key ${key}:`, error);
    return false;
  }
};

/**
 * Load data from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<any>} Retrieved data or null if not found
 */
const loadFromIndexedDB = async (key) => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readonly');
      const store = transaction.objectStore('library');
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Error loading from IndexedDB for key ${key}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error loading from IndexedDB for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from IndexedDB
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
const removeFromIndexedDB = async (key) => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readwrite');
      const store = transaction.objectStore('library');
      
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error(`Error removing from IndexedDB for key ${key}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error(`Error removing from IndexedDB for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all data from IndexedDB
 * @returns {Promise<boolean>} Success status
 */
const clearIndexedDB = async () => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readwrite');
      const store = transaction.objectStore('library');
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error('Error clearing IndexedDB'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    return false;
  }
};

/**
 * Get storage usage information
 * @returns {Promise<Object>} Storage usage information
 */
const getStorageInfo = async () => {
  try {
    // Check if IndexedDB is available
    const useIndexedDB = await isIndexedDBAvailable();
    
    if (useIndexedDB) {
      // For IndexedDB, we can't easily get size information
      // We could estimate based on data size, but that's not reliable
      return {
        type: 'IndexedDB',
        usage: 'Unknown',
        limit: 'Unknown'
      };
    } else {
      // For localStorage, we can estimate size
      let totalSize = 0;
      
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      
      return {
        type: 'localStorage',
        usage: `${(totalSize / 1024).toFixed(2)} KB`,
        limit: `${(LOCAL_STORAGE_LIMIT / 1024 / 1024).toFixed(2)} MB`,
        percent: (totalSize / LOCAL_STORAGE_LIMIT) * 100
      };
    }
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      type: 'Unknown',
      usage: 'Unknown',
      limit: 'Unknown'
    };
  }
};

// Export storage service functions
export {
  STORAGE_KEYS,
  saveData,
  loadData,
  removeData,
  clearAllData,
  getStorageInfo
};

export default {
  STORAGE_KEYS,
  saveData,
  loadData,
  removeData,
  clearAllData,
  getStorageInfo
};