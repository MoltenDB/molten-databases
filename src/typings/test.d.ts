declare namespace MDB.Storage {
  export type testStorageOption = {
    label: string,
    options: Object
  };

  export type testStorageOptions = {
    badOptions: testStorageOption | testStorageOption[],
    goodOptions: testStorageOption | testStorageOption[],
    testOptions: Object,
    checkStore?: (storeOptions: MDB.Storage.StoreOptions) => boolean
  };
}
