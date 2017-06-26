import createInitialisationTests from './tests/initialisation.spec';
import createStoreTests from './tests/storeTests.spec';
import createItemStoreOperationTests from './tests/itemStoreOperationTests.spec';
import createKeyStoreStoreOperationTests from './tests/keyValueStoreOperationTests.spec';

const makeStorageTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  createInitialisationTests(connectStorage, testStorageOptions);
  createStoreTests(connectStorage, testStorageOptions);
  createItemStoreOperationTests(connectStorage, testStorageOptions);
  if (connectStorage.features.indexOf('keyValue') !== -1) {
    createKeyStoreStoreOperationTests(connectStorage, testStorageOptions);
  }
};
export default makeStorageTests;
