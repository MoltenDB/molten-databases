import createInitialisationTests from './tests/initialisation.spec';
import createTableTests from './tests/tableTests.spec';
import createOperationTests from './tests/operationTests.spec';

const makeDatabaseTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  createInitialisationTests(connectStorage, testStorageOptions);
  createTableTests(connectStorage, testStorageOptions);
  createOperationTests(connectStorage, testStorageOptions);
};
export default makeDatabaseTests;
