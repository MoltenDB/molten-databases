declare namespace MDB.Storage {
  export type Data = { [key: string]: any };

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

  export interface StoreResult {
    totalItems: number,
    items: any[]
  }

  export interface Store {
    /**
     * Creates a new item / new items in the storage
     *
     * @param data Data to insert into the storage. If data is an array, it
     *   is assumed that the array contains multiple items to create in the
     *   storage
     *
     * @returns A Promise that will resolve to an array of the items created
     *   once all the items have been created
     */
    create: (data: Data | Data[])
        => Promise<any[]>,

    /**
     * Retrieves items from the storage
     *
     * @param store Store to retrieve the data from
     * @param filter Filter to use for retrieving the items from the storage
     *
     * @returns A Promise that will resolve to the retrieved data
     */
    read: (filter: Filter) => Promise<StoreResult>,

    /**
     * Get the number of items that would be returned by a query
     *
     * @returns A Promise that resolves to the number of rows
     */
    count: (filter: Filter) => Promise<number>,

    /**
     * Update an item in the storage
     *
     * @param store Store to update the data in
     * @param data Data to update in the items
     * @param filter Filter to use to determine what items should be updated.
     *   If an id is given in the `data`, if `filter` is true, the item with
     *   the id given will be replaced with the item given
     *
     * @returns A Promise that resolves once all the items have updated
     */
    update: (data: Data | Data[], filter?: Filter | true) => Promise<number>,

    /**
     * Deletes items from a storage that match the filter
     *
     *
     * @returns A Promise that resolves to the number of deleted items once
     *   all the items have been deleted
     */
    delete: (filter: true | Filter) => Promise<number>,
  }
}
