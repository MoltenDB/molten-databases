declare namespace MDB.Storage {
  /// Types that the Storage could support
  export type FieldTypes = 'string' | 'number' | 'array' | 'object' | 'boolean';

  /// Feature that the Storage could support
  export type Features =
      'uniqueId' /// Can generate a unique id for an item that doesn't have one
      | 'keyValue'; /// Can be used as a key-value store

  /// Store types
  export type StoreTypes =
      'store' /// Document/Tabular-type store
      | 'keyValue'; /// Key-value store

  export type connectStorage = {
    /**
     * Opens (creates a connection to) a storage with the given options
     *
     * @params options Options to pass to the storage generator
     *
     * @returns A promise that resolves to the storage
     */
    (options: Object): Promise<StorageConnection>,
    /// Types that the storage supports
    types: FieldTypes[],
    /// Features that the storage supports
    features: Features[]
  };

  export interface StorageObject {
    name: string,
    label?: string,
    description?: string
  }

  /// Definition of a field in a store
  export interface Field extends StorageObject {
    type: string,
  }

  export interface KeyValueStoreOptions extends StorageObject {
    type: 'keyValue'
  }

  /// Definition of a store in a storage
  export interface ItemStoreOptions extends StorageObject {
    type: 'store',
    fields: Field[],
  }

  export type StoreOptions = ItemStoreOptions | KeyValueStoreOptions;

  export interface StorageConnection {
    /**
     * Get an Store instance of a store to complete operations on
     *
     * @param store Store name
     *
     * @returns A Promise that resolves to the store instance
     */
    getStore: (store: StoreOptions) => Promise<Store|KeyValueStore>,

    /**
     * Creates a new store in the storage
     *
     * @param store Store specification
     *
     * @returns A Promise that resolves once the store has been created
     */
    createStore: (store: StoreOptions) => Promise<Store|KeyValueStore>,

    /**
     * Deletes a store from the storage
     *
     * @param store The store to delete
     *
     * @returns A Promise that resolves once the store has been deleted
     */
    deleteStore: (store: StoreOptions) => Promise<undefined>,

    /**
     * Checks that a store exists
     *
     * @returns A Promise that once resolves once the store has been
     *   checked
     */
    checkStore: (store: StoreOptions) => Promise<undefined>,

    /**
     * Closes the storage (connection)
     */
    close: () => void
  }
}
