const createStoreTests = (connectStorage: MDB.Storage. connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  const goodStoreOptions: MDB.Storage.StoreOptions = {
    name: 'testStore',
    label: 'Test Store',
    fields: []
  };

  beforeEach(() => {
    return connectStorage(testStorageOptions.testOptions)
        .then((storageConnection) => {
      this.storage = storageConnection;
    }, fail);
  });

  afterEach(() => {
    return this.storage.close().catch(fail);
  });

  describe('MDB.Storage.Storage.createStore()', () => {
    xdescribe('should return a Promise that rejects on bad options', () => {

    });

    it('should return a Promise that resolves when the store has '
        + 'been created', () => {
      return this.storage.createStore(goodStoreOptions).then(() => {
        if (testStorageOptions.checkStore) {
          expect(testStorageOptions.checkStore(goodStoreOptions))
              .toBeTruthy();
        }
      }, fail);
    });

    it('should fail if the store already exists', () => {
      return this.storage.createStore(goodStoreOptions).then(() => {
        return this.storage.createStore(goodStoreOptions)
            .then(fail, (error) => {
          // TODO test for type of error
          return Promise.resolve();
        });
      }, fail);
    });
  });

  describe('Storage.checkStore()', () => {
    it('should return a promise that rejects when the store doesn\'t exist',
        () => {
      return this.storage.checkStore('nonExistentStore')
          .then(fail, () => Promise.resolve());
    });

    it('should return a promise that resolves when the store is good', () => {
      return this.storage.createStore(goodStoreOptions).then(() => {
        return this.storage.checkStore(goodStoreOptions.name);
      }).catch(fail);
    });
  });

  describe('Storage.deleteStore()', () => {
    it('should return a Promise that rejects if the storage doesn\'t exist',
        () => {
      return this.storage.deleteStore('nonExistentStore')
          .then(fail, () => Promise.resolve());
    });

    it('should return a Promise that resolves once the given store is '
        + 'deleted', () => {
      return this.storage.createStore(goodStoreOptions).then(() => {
        return this.storage.deleteStore(goodStoreOptions.name);
      }).then(() => {
        // Try to open Store to confirm doesn't exist
        return this.storage.checkStore(goodStoreOptions.name).then(() => {
          fail('deleteStore() didn\'t the store according to checkStore()');
        }, () => Promise.resolve());
      }, fail);
    });
  });
};
export default createStoreTests;
