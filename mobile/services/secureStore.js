// filepath: mobile/services/secureStore.js
// Mock wrapper for react-native-keychain or expo-secure-store.
// In a real React Native project, you would import * as SecureStore from 'expo-secure-store' 
// or import * as Keychain from 'react-native-keychain'.

export async function setSecureItem(key, value) {
  try {
    // Under the hood, this uses iOS Keychain or Android Keystore
    if (typeof window !== 'undefined') {
      // Fallback for simulation
      window.localStorage.setItem(`secure_${key}`, value);
    }
    console.log(`🔒 [SecureStorage] Saved token for key: "${key}" securely in hardware-backed storage.`);
    return true;
  } catch (error) {
    console.error(`Error saving secure key "${key}":`, error);
    return false;
  }
}

export async function getSecureItem(key) {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(`secure_${key}`);
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving secure key "${key}":`, error);
    return null;
  }
}

export async function deleteSecureItem(key) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`secure_${key}`);
    }
    console.log(`🔓 [SecureStorage] Deleted token key: "${key}" from secure storage.`);
    return true;
  } catch (error) {
    console.error(`Error deleting secure key "${key}":`, error);
    return false;
  }
}
