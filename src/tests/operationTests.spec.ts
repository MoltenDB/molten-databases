const createOperationTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  let testStoreOptions: MDB.Storage.StoreOptions = {
    name: 'testoperationstore',
    label: 'Operation Tests Store',
    fields: [
      {
        name: 'astring',
        type: 'string'
      },
      {
        name: 'anumber',
        type: 'number',
      },
    ]
  };

  let testData: {
    _id: number,
    astring: string,
    anumber: number,
    anarray?: any[]
  }[] = [
    {
      _id: 1,
      astring: 'string1',
      anumber: 1
    },
    {
      _id: 2,
      astring: 'string2',
      anumber: 1
    },
    {
      _id: 3,
      astring: 'string2',
      anumber: 2
    },
    {
      _id: 4,
      astring: 'string3',
      anumber: 3
    }
  ];

  if (connectStorage.types.indexOf('array') !== -1) {
    testStoreOptions.fields.push({
      name: 'anarray',
      type: 'array'
    });
    const arrayData = [
      ['string2', 45 ],
      ['string', 'string4'],
      [34, 234, 2343],
      ['string'],
      []
    ];

    testData.forEach((item, index) => {
      item.anarray = arrayData[index];
    });
  }

  beforeEach(() => {
    return connectStorage(testStorageOptions.testOptions).then((storage) => {
      this.storage = storage;
    });
  });

  afterEach(() => {
    return this.storage.close().catch(fail);
  });

  describe('create()', () => {
    beforeEach(() => {
        return this.storage.createStore(testStoreOptions);
    });

    afterEach((() => {
      return this.storage.deleteStore(testStoreOptions.name);
    });

    it('should fail if no is given in the data', () => {
      let failData = testData.map((item) => Object.assign({}, item));
      delete failData[0]['_id'];
      return this.storage.create(testStoreOptions.name, failData).then(() => {
        fail('create() Promise resolved, should have rejected');
      }, () => {});
    });

    it('should return an array of the ids created', () => {
      return this.storage.create(testStoreOptions.name, testData).then((ids) => {
        expect(ids).toEqual(jasmine.any(Array));
        expect(ids.length).toEqual(testData.length);
        const testDataKeys = Object.keys(testData);
        ids.forEach((id) => {
          let index;
          testData.find((testItem, testItemIndex) => {
            if (testItem._id === id) {
              index = testItemIndex;
              return true;
            }
          });
          if (typeof index === 'undefined') {
            fail(`got an id that was not in the testData (${id})`);
          } else {
            testDataKeys.splice(index, 1);
          }
        });

        if (testDataKeys.length) {
          fail(`testData keys not included in created items (${testDataKeys})`);
        }
      });
    });

    it('should reject if ids already exist', () => {
      return this.storage.create(testStoreOptions.name, testData).then(() => {
        return this.storage.create(testStoreOptions.name, testData).then(() => {
          fail('create() promise resolved on trying to recreate items');
        }, () => {});
      });
    });
  });

  describe('read()', () => {
    describe('simple value reads', () => {
      beforeEach(() => {
        // Create a store with test data to read from
        return this.storage.createStore(testStoreOptions).then(() => {
          return this.storage.create(testStoreOptions.name, testData);
        }, fail);
      });

      afterEach(() => {
        return this.storage.deleteStore(testStoreOptions.name);
      });

      it('should return all items if no filter or options are given',
          () => {
        return this.storage.read(testStoreOptions.name).then((results) => {
          expect(results.length).toEqual(testData.length);
        }, fail);
      });

      describe('field/value filters', () => {
        const resultsChecker = (filter) => (results) => {
          expect(results.length).toEqual(testData.reduce((hits, next) => {
            if (next) {
              if (!Object.keys(filter).find((field) => {
                if (next[field] && next[field] === filter[field]) {
                  return undefined;
                }

                return true;
              })) {
                return hits + 1;
              }
            }

            return hits;
          }, 0));

          results.forEach((result) => {
            if (result) {
              Object.keys(filter).forEach((field) => {
                expect(result[field]).toBeDefined();
                expect(result[field]).toEqual(filter[field]);
              });
            } else {
              fail('Result not truthy');
            }
          });
        };

        it('should return only values matching a single field filter',
            (done) => {
          const filter = { astring: 'string2' };
          this.storage.read(testStoreOptions.name, filter)
              .then(resultsChecker(filter), fail).then(done);
        });

        it('should return only values matching all of a multiple fields filter',
            (done) => {
          const filter = { astring: 'string2', anumber: 2 };
          this.storage.read(testStoreOptions.name, filter)
              .then(resultsChecker(filter), fail).then(done);
        });
      });

      describe('comparison operators', () => {
      });

      describe('logical operators', () => {
        describe('$or', () => {
          it('should logical OR tests in $or array', (done) => {
            const filter = { $or: [
              { astring: 'string2' },
              { anumber: { '$gt': 2 } }
            ] };

            this.storage.read(testStoreOptions.name, filter)
                .then((results) => {
              expect(results.length)
                  .toEqual(testData.reduce((hits, next) => {
                if (next && (next.astring === 'string2'
                    || next.anumber > 2)) {
                  return hits + 1;
                }

                return hits;
              }, 0));

              results.forEach((result) => {
                if (result) {
                  if (result.astring !== 'string2'  && result.anumber <= 2) {
                    fail('result did not match filter');
                  }
                } else {
                  fail('got falsey result');
                }
              });
            });
          });
        });

        describe('$and', () => {
          it('should logical AND tests in $and array', (done) => {
            const filter = { $and: [
              { astring: 'string2' },
              { anumber: { $gte: 2 } }
            ] };

            this.storage.read(testStoreOptions.name, filter)
                .then((results) => {
              expect(results.length)
                  .toEqual(testData.reduce((hits, next) => {
                if (next && (next.astring === 'string2'
                    && next.anumber >= 2)) {
                  return hits + 1;
                }

                return hits;
              }, 0));

              results.forEach((result) => {
                if (result) {
                  expect(result.astring).toEqual('string2');
                  expect(result.anumber).toBeGreaterThanOrEqual(2);
                } else {
                  fail('got falsey result');
                }
              });
            });
          });
        });

        describe('$not', () => {
          it('should logical AND tests in $and array', (done) => {
            const filter = { $not: { astring: 'string2' } };

            this.storage.read(testStoreOptions.name, filter)
                .then((results) => {
              expect(results.length)
                  .toEqual(testData.reduce((hits, next) => {
                if (next && next.astring !== 'string2') {
                  return hits + 1;
                }

                return hits;
              }, 0));

              results.forEach((result) => {
                if (result && result.astring && result.astring === 'string2') {
                  expect(result.astring).not.toEqual('string2');
                }
              });
            });
          });
        });

        it('should be able to have nested logical statements', (done) => {
        });
      });
    });


  });

  describe('update()', () => {
  });

  describe('delete()', () => {
  });
};
export default createOperationTests;
