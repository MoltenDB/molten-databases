declare namespace MDB.Storage {
  export type Key = string | number;

  export interface KeyValueStore {
    /**
     * Get value of an existing key-value
     *
     * @param key Key of key-value value to return
     *
     * @returns Promise resolving to key-value value or null if
     *   id doesn't currently exist
     */
    getItem: (id: Key) => Promise<any>,

    /**
     * Set value of an key-value pair
     *
     * @param key Key of key-value pair to set
     * @param value Value of key-value pair to set
     *
     * @returns Promise that resolves once the key-value
     *   pair has been saved
     */
    setItem: (key: Key, value: any) => Promise<undefined>,

    /**
     * Removes a key-value pair
     *
     * @param key Key of key-value pair to remove
     *
     * @returns Promise that resolves once the key-value has been removed
     */
    removeItem: (key: Key) => Promise<undefined>
  }
}
