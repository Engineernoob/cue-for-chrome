/**
 * Chrome storage API helpers for saving user preferences, modes, and history
 * Uses chrome.storage.local for client-side persistence (privacy-focused)
 */

interface UserPreferences {
  defaultMode: string; // e.g., 'interview', 'coding_test', 'meeting'
  defaultLanguage: string; // e.g., 'en-US'
  autoSaveHistory: boolean;
  maxHistoryItems: number; // e.g., 50
}

interface ProcessingHistory {
  id: string;
  timestamp: number;
  mode: string;
  action: string; // 'summarize', 'proofread', etc.
  inputText: string;
  outputText: string;
  language?: string;
}

interface StorageData {
  preferences: UserPreferences;
  history: ProcessingHistory[];
  overlayState: {
    isVisible: boolean;
    lastMode: string;
  };
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultMode: 'interview',
  defaultLanguage: 'en-US',
  autoSaveHistory: true,
  maxHistoryItems: 50
};

// Get all storage data
export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['preferences', 'history', 'overlayState'], (result) => {
      resolve({
        preferences: { ...DEFAULT_PREFERENCES, ...result.preferences },
        history: result.history || [],
        overlayState: result.overlayState || { isVisible: false, lastMode: 'interview' }
      });
    });
  });
}

// Save preferences
export async function savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
  const data = await getStorageData();
  const updatedPrefs = { ...data.preferences, ...preferences };
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ preferences: updatedPrefs }, () => {
      resolve();
    });
  });
}

// Save processing history item
export async function saveHistoryItem(historyItem: Omit<ProcessingHistory, 'id'>): Promise<void> {
  const data = await getStorageData();
  const newItem: ProcessingHistory = {
    ...historyItem,
    id: Date.now().toString(),
    timestamp: Date.now()
  };

  let updatedHistory = [newItem, ...data.history];
  
  // Limit history size
  if (updatedHistory.length > data.preferences.maxHistoryItems) {
    updatedHistory = updatedHistory.slice(0, data.preferences.maxHistoryItems);
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ history: updatedHistory }, () => {
      resolve();
    });
  });
}

// Get recent history
export async function getRecentHistory(limit: number = 10): Promise<ProcessingHistory[]> {
  const data = await getStorageData();
  return data.history.slice(0, limit).reverse(); // Most recent first
}

// Clear history
export async function clearHistory(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ history: [] }, () => {
      resolve();
    });
  });
}

// Save overlay state
export async function saveOverlayState(state: Partial<StorageData['overlayState']>): Promise<void> {
  const data = await getStorageData();
  const updatedState = { ...data.overlayState, ...state };
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ overlayState: updatedState }, () => {
      resolve();
    });
  });
}

// Get overlay state
export async function getOverlayState(): Promise<StorageData['overlayState']> {
  const data = await getStorageData();
  return data.overlayState;
}

// Initialize storage with defaults if empty
export async function initializeStorage(): Promise<void> {
  const data = await getStorageData();
  if (!data.preferences.defaultMode) {
    await savePreferences(DEFAULT_PREFERENCES);
  }
  if (data.history.length === 0) {
    console.log('Storage initialized with defaults');
  }
}

// Listen for storage changes (useful for sync across tabs)
export function onStorageChange(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void): void {
  chrome.storage.onChanged.addListener(callback);
}

// Export types for use in other components
export type { UserPreferences, ProcessingHistory, StorageData };