import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility class for handling AsyncStorage operations with type safety
 */
class StorageHelper {
  /**
   * Save data to AsyncStorage with automatic JSON serialization
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns Promise that resolves when data is saved
   * @throws Error if serialization or storage fails
   */
  async saveData<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key "${key}":`, error);
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve data from AsyncStorage with automatic JSON deserialization
   * @param key - Storage key
   * @returns Promise that resolves to the stored value or null if not found
   * @throws Error if deserialization fails
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      
      if (jsonValue === null) {
        return null;
      }

      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`Error retrieving data for key "${key}":`, error);
      throw new Error(`Failed to retrieve data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove a specific item from AsyncStorage
   * @param key - Storage key to remove
   * @returns Promise that resolves when item is removed
   * @throws Error if removal fails
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key "${key}":`, error);
      throw new Error(`Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all data from AsyncStorage
   * @returns Promise that resolves when all data is cleared
   * @throws Error if clearing fails
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error(`Failed to clear all data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all keys stored in AsyncStorage
   * @returns Promise that resolves to array of all keys
   * @throws Error if retrieval fails
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      throw new Error(`Failed to get all keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a key exists in AsyncStorage
   * @param key - Storage key to check
   * @returns Promise that resolves to true if key exists, false otherwise
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.includes(key);
    } catch (error) {
      console.error(`Error checking if key "${key}" exists:`, error);
      return false;
    }
  }

  /**
   * Save multiple items to AsyncStorage at once
   * @param items - Array of [key, value] pairs to store
   * @returns Promise that resolves when all items are saved
   * @throws Error if serialization or storage fails
   */
  async saveMultiple<T>(items: Array<[string, T]>): Promise<void> {
    try {
      const serializedItems: Array<[string, string]> = items.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(serializedItems);
    } catch (error) {
      console.error('Error saving multiple items:', error);
      throw new Error(`Failed to save multiple items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve multiple items from AsyncStorage at once
   * @param keys - Array of storage keys to retrieve
   * @returns Promise that resolves to array of [key, value] pairs
   * @throws Error if deserialization fails
   */
  async getMultiple<T>(keys: string[]): Promise<Array<[string, T | null]>> {
    try {
      const results = await AsyncStorage.multiGet(keys);
      return results.map(([key, value]) => [
        key,
        value ? (JSON.parse(value) as T) : null,
      ]);
    } catch (error) {
      console.error('Error retrieving multiple items:', error);
      throw new Error(`Failed to retrieve multiple items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove multiple items from AsyncStorage at once
   * @param keys - Array of storage keys to remove
   * @returns Promise that resolves when all items are removed
   * @throws Error if removal fails
   */
  async removeMultiple(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw new Error(`Failed to remove multiple items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a singleton instance
export const storage = new StorageHelper();

// Export the class for testing purposes
export default StorageHelper;
