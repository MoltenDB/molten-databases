const createKeyValueStoreOperationTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  let testStoreOptions: MDB.Storage.KeyValueStoreOptions = {
    name: 'testoperationstore',
    type: 'keyValue',
    label: 'Operation Tests Store',
  };

  describe('Key-Value Store Instance', () => {
    beforeEach(() => {
      return connectStorage(testStorageOptions.testOptions).then((storage) => {
        this.storage = storage;
        return this.storage.createStore(testStoreOptions).then((store) => {
          this.store = store;
        });
      });
    });

    describe('setItem()', () => {
      it('should return a Promise that rejects if no id given', () => {
        return this.store.setItem().then(fail, () => Promise.resolve());
      });

      it('should return a Promise that resolves to the new value', () => {
        return this.store.setItem('test', 'value').then((newValue) => {
          expect(newValue).toEqual('value');
        });
      });
    });

    describe('getItem()', () => {
      beforeEach(() => {
        return this.store.setItem('test', 'value');
      });

      it('should return a Promise that resolves to the stored value', () => {
        return this.store.getItem('test').then((value) => {
          expect(value).toEqual('value');
        });
      });

      it('should return a Promise that resolves to undefined if there is no stored value', () => {
        return this.store.getItem('noValue').then((value) => {
          expect(value).not.toBeDefined();
        });
      });
    });

    describe('removeItem()', () => {
      beforeEach(() => {
        return this.store.setItem('test', 'value');
      });

      it('should return a Promise that resolves once the value has been removed', () => {
        return this.store.removeItem('test').then(() => {
          return this.store.getItem('test').then((value) => {
            expect(value).not.toBeDefined();
          });
        });
      });

      it('should return a Promise that resolves if a value didn\'t exist', () => {
        return this.store.removeItem('noValue');
      });
    });
  });
};
export default createKeyValueStoreOperationTests;
