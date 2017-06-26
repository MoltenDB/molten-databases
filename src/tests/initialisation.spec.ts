const createInitialisationTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  describe('connectStorage()', () => {
    it('should have `types` property of array of types that the storage supports', () => {
      expect(connectStorage.types).toEqual(jasmine.any(Array));
    });

    it('should have `features` property of array of features that the storage supports', () => {
      expect(connectStorage.features).toEqual(jasmine.any(Array));
    });

    describe('should return a Promise that rejects on bad options', () => {
      const makeTestFunction = (options) => {
        return () => {
          return connectStorage(options).then(() => {
            fail('Promise resolved');
          }, () => Promise.resolve());
        };
      };
      if (testStorageOptions.badOptions instanceof Array) {
        testStorageOptions.badOptions.forEach((option, index) => {
          it(option.label || `with bad option ${index}`,
              makeTestFunction(option.options));
        });
      }
    });

    describe('should return a Promise MDB.Storage interface object when given valid '
        + 'options', () => {
      const makeTestFunction = (options) => {
        return () => {
          return connectStorage(options).then((storage) => {
            expect(storage).toEqual(jasmine.any(Object));
            expect(storage.close).toEqual(jasmine.any(Function));
          });
        };
      };

      if (testStorageOptions.goodOptions instanceof Array) {
        testStorageOptions.goodOptions.forEach((option, index) => {
          it(option.label || `with good option${index}`,
              makeTestFunction(option.options));
        });
      }
      it('with testStorageOptions',
          makeTestFunction(testStorageOptions.testOptions));
    });
  });
};
export default createInitialisationTests;
