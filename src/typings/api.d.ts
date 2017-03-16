declare namespace MDB.Storage {
  // Types that the Storage could support
  export type FieldTypes = 'string' | 'number' | 'array' | 'object' | 'boolean';

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
    types: FieldTypes[]
  };

  export interface ReadQuery {
    type: 'read',
    /// Filter for query
    filter: Filter,
    /// Number of rows to return
    limit: number,
    /// Row to return from
    offset: number
  }

  export interface CreateQuery {
    type: 'create',
    /// Data to insert into the storage
    data: any
  }

  export interface UpdateQuery {
    type: 'update',
    data: any,
    filter: Filter
  }

  export interface DeleteQuery {
    type: 'delete',
    filter: Filter
  }

  export type Query = ReadQuery | CreateQuery | UpdateQuery | DeleteQuery;

  export type FieldFilter =
    /// Matches values that are equal to a specified value.
    { $eq: any }
    /// Matches values that are greater than a specified value.
    | { $gt: any }
    /// Matches values that are greater than or equal to a specified value.
    | { $gte: any }
    /// Matches values that are less than a specified value.
    | { $lt: any }
    /// Matches values that are less than or equal to a specified value.
    | { $lte: any }
    /// Matches all values that are not equal to a specified value.
    | { $ne: any }
    /// Matches any of the values specified in an array.
    | { $in: any[] }
    /// Matches none of the values specified in an array.
    | { $nin: any[] };

  export interface Filter {
    [field: string]: FieldFilter | any,
    /// Logical AND
    $and?: Filter[],
    /// Logical OR
    $or?: Filter[],
    /// Logical NOT
    $not?: Filter
  }

  export interface Result {
    totalItems: number,
    items: any[]
  }

  export interface StorageObject {
    name: string,
    label?: string,
    description?: string
  }

  /// Definition of a field in a store
  export interface Field extends StorageObject {
    type: string,
  }

  /// Definition of a store in a storage
  export interface StoreOptions extends StorageObject {
    fields: Field[],
  }

  export interface StorageConnection {
    /**
     * Creates a new item / new items in the storage
     *
     * @param store Store to insert the data into
     * @param data Data to insert into the storage. If data is an array, it
     *   is assumed that the array contains multiple items to create in the
     *   storage
     * @param replace Whether or not to replace an existing with the same id
     *   or to reject
     *
     * @returns A Promise that will resolve to an array of the items created
     *   once all the items have been created
     */
    create: (store: string, data: any | any[], replace?: boolean)
        => Promise<any[]>,

    /**
     * Retrieves items from the storage
     *
     * @param store Store to retrieve the data from
     * @param filter Filter to use for retrieving the items from the storage
     *
     * @returns A Promise that will resolve to the retrieved data
     */
    read: (store: string, filter: Filter) => Promise<Result>,

    /**
     * Get the number of items that would be returned by a query
     *
     * @returns A Promise that resolves to the number of rows
     */
    count: (store: string, filter: Filter) => Promise<number>,

    /**
     * Update an item in the storage
     *
     * @param store Store to update the data in
     * @param filter Filter to use to determine what items should be updated
     * @param data Data to update in the items
     *
     * @returns A Promise that resolves once all the items have updated
     */
    update: (store: string, filter: Filter) => Promise<number>,

    /**
     * Deletes items from a storage that match the filter
     *
     *
     * @returns A Promise that resolves to the number of deleted items once
     *   all the items have been deleted
     */
    delete: (store: string, filter: true | Filter) => Promise<number>,


    /**
     * Creates a new store in the storage
     *
     * @param store Store specification
     *
     * @returns A Promise that resolves once the store has been created
     */
    createStore: (store: StoreOptions) => Promise<undefined>,

    /**
     * Deletes a store from the storage
     *
     * @param store The store to delete
     *
     * @returns A Promise that resolves once the store has been deleted
     */
    deleteStore: (store: string) => Promise<undefined>,

    /**
     * Checks that a store exists
     *
     * @returns A Promise that once resolves once the store has been
     *   checked
     */
    checkStore: (store: string) => Promise<undefined>,

    /**
     * Closes the storage (connection)
     */
    close: () => void
  }
}
