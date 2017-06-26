const createStoreTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  const goodStoreOptions: MDB.Storage.ItemStoreOptions = {
    name: 'testStore',
    type: 'store',
    label: 'Test Store',
    fields: []
  };
  const goodKeyValueStoreOptions: MDB.Storage.KeyValueStoreOptions = {
    name: 'testStore',
    type: 'keyValue',
    label: 'Test Store'
  };

  describe('Storage connection', () => {
    beforeEach(() => {
      return connectStorage(testStorageOptions.testOptions)
          .then((storageConnection) => {
        this.storage = storageConnection;
      }, fail);
    });

    afterEach(() => {
      return this.storage.close().catch(fail);
    });

    describe('createStore()', () => {
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
              .then((store) => fail('Returned store ' + Object.keys(store)), (error) => {
            // TODO test for type of error
            return Promise.resolve();
          });
        }, fail);
      });
    });

    describe('getStore()', () => {
      it('should return a promise that rejects when the store doesn\'t exist',
          () => {
        return this.storage.getStore(goodStoreOptions)
            .then((store) => fail('Returned store ' + Object.keys(store)), () => Promise.resolve());
      });

      it('should return a promise that resolves to the Store interface when it exists',
          () => {
        return this.storage.createStore(goodStoreOptions).then(() => {
          return this.storage.getStore(goodStoreOptions);
        }).then((store) => {
          expect(store.create).toEqual(jasmine.any(Function));
          expect(store.read).toEqual(jasmine.any(Function));
          expect(store.update).toEqual(jasmine.any(Function));
          expect(store.delete).toEqual(jasmine.any(Function));
          expect(store.count).toEqual(jasmine.any(Function));
        });
      });

      if (connectStorage.features.indexOf('keyValue') !== -1) {
        it('should return a promise that resolves to a KeyValueStore interface when it exists',
            () => {
          return this.storage.createStore(goodKeyValueStoreOptions).then(() => {
            return this.storage.getStore(goodKeyValueStoreOptions);
          }).then((store) => {
            expect(store.getItem).toEqual(jasmine.any(Function));
            expect(store.setItem).toEqual(jasmine.any(Function));
            expect(store.removeItem).toEqual(jasmine.any(Function));
          });
        });
      }
    });

    describe('checkStore()', () => {
      it('should return a promise that rejects when the store doesn\'t exist',
          () => {
        return this.storage.checkStore(goodStoreOptions)
            .then(fail, () => Promise.resolve());
      });

      it('should return a promise that resolves when the store is good', () => {
        return this.storage.createStore(goodStoreOptions).then(() => {
          return this.storage.checkStore(goodStoreOptions);
        }).catch(fail);
      });
    });

    describe('deleteStore()', () => {
      it('should return a Promise that rejects if the storage doesn\'t exist',
          () => {
        return this.storage.deleteStore(goodStoreOptions)
            .then(fail, () => Promise.resolve());
      });

      it('should return a Promise that resolves once the given store is '
          + 'deleted', () => {
        return this.storage.createStore(goodStoreOptions).then(() => {
          return this.storage.deleteStore(goodStoreOptions);
        }).then(() => {
          // Try to open Store to confirm doesn't exist
          return this.storage.checkStore(goodStoreOptions).then(() => {
            fail('deleteStore() didn\'t the store according to checkStore()');
          }, () => Promise.resolve());
        }, fail);
      });
    });
  });
};
export default createStoreTests;
