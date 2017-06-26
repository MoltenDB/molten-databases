const createStoreOperationTests = (connectStorage: MDB.Storage.connectStorage,
    testStorageOptions: MDB.Storage.testStorageOptions) => {
  let testStoreOptions: MDB.Storage.ItemStoreOptions = {
    name: 'testoperationstore',
    type: 'store',
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
    _id: MDB.Storage.Key,
    astring: string,
    anumber: number,
    anarray?: any[]
  }[] = [
    {
      _id: 'a',
      astring: 'string1',
      anumber: 1
    },
    {
      _id: 'b',
      astring: 'string2',
      anumber: 1
    },
    {
      _id: 'c',
      astring: 'string2',
      anumber: 2
    },
    {
      _id: 'd',
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

  const testIdMap = testData.reduce((map, item) => {
    map[item._id] = item;
    return map;
  }, {});

  describe('Item Store Instance', () => {
    beforeEach(() => {
      return connectStorage(testStorageOptions.testOptions).then((storage) => {
        this.storage = storage;
        return this.storage.createStore(testStoreOptions).then((store) => {
          this.store = store;
        });
      });
    });

    afterEach(() => {
      return this.storage.close().catch(fail);
    });

    describe('create()', () => {
      it('should return a Promise that rejects if no data is given', () => {
        return this.store.create().then(() => {
          fail('create() Promise resolved, should have rejected');
        }, () => {});
      });

      if (connectStorage.features.indexOf('uniqueId') !== -1) {
        it('should return a Promise that rejects if no _id is given in the data', () => {
          let failData = testData.map((item) => Object.assign({}, item));
          delete failData[0]['_id'];
          return this.store.create(failData).then(() => {
            fail('create() Promise resolved, should have rejected');
          }, () => {});
        });
      } else {
        it('should return a Promise that rejects if no _id is given in the data', () => {
          let failData = testData.map((item) => Object.assign({}, item));
          delete failData[0]['_id'];
          return this.store.create(failData).then(() => {
            fail('create() Promise resolved, should have rejected');
          }, () => {});
        });
      }

      describe('given a single item to create', () => {
        it('should return a Promise that resolves to the ID of the item once created', () => {
          return this.store.create(testData[0]).then((id) => {
            expect(id).toEqual(testData[0]._id);
          });
        });

        it('should return a Promise that rejects if an item wasn\'t created successfully', () => {
          return this.store.create(testData[0]).then((id) => {
            return this.store.create(testData[0]).then((id) => {
              fail('Storage should not allow creation items with an ID already in the database');
            }, () => {});
          });
        });
      });

      describe('given an array of items to create', () => {
        it('should return a promise that resolves to an array of the IDs of the items created in '
            + 'the order that the items were given', () => {
          return this.store.create(testData).then((ids) => {
            expect(ids).toEqual(jasmine.any(Array));
            expect(ids.length).toEqual(testData.length);
            testData.forEach((testItem, index) => {
              expect(ids[index]).toEqual(testItem._id);
            });
          });
        });

        it('should return a promise that resolves to an array containing IDs for the items created '
            + 'successfully and Errors for the items that weren\'t created successfully', () => {
          return this.store.create(testData[0]).then(() => {
            return this.store.create(testData).then((ids) => {
              expect(ids).toEqual(jasmine.any(Array));
              expect(ids.length).toEqual(testData.length);
              expect(ids[0]).toEqual(jasmine.any(Error));
              for (let i = 1; i < testData.length; i++) {
                expect(ids[i]).toEqual(testData[i]._id);
              }
            });
          });
        });
      });

    });

    describe('read()', () => {
      describe('simple value reads', () => {
        beforeEach(() => {
          // Create test data to read from
          return this.store.create(testData);
        });

        it('should return all items if no filter or options are given',
            () => {
          return this.store.read().then((results) => {
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
            this.store.read(filter)
                .then(resultsChecker(filter), fail).then(done);
          });

          it('should return only values matching all of a multiple fields filter',
              (done) => {
            const filter = { astring: 'string2', anumber: 2 };
            this.store.read(filter)
                .then(resultsChecker(filter), fail).then(done);
          });
        });

        xdescribe('comparison operators', () => {
          /** TODO */
        });

        describe('logical operators', () => {
          describe('$or', () => {
            it('should logical OR tests in $or array', (done) => {
              const filter = { $or: [
                { astring: 'string2' },
                { anumber: { '$gt': 2 } }
              ] };

              this.store.read(filter)
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

              this.store.read(filter)
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

              this.store.read(filter)
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
            const filter = { $or: [
              { $and: [
                { astring: 'string2' },
                { anumber: 2 }
              ] },
              { $or: [
                { astring: 'string1' },
                { anumber: 3 }
              ] }
            ] };

            return this.store.read(filter).then((results) => {
              expect(results.length).toEqual(testData.reduce((hits, result) => {
                if (result && ((result.astring === 'string2' && result.anumber === 2)
                    || (result.astring === 'string1' || result.anumber === 3))) {
                      return hits + 1;
                }

                return hits;
              }, 0));

              results.forEach((result) => {
                if (!(result && ((result.astring === 'string2' && result.anumber === 2)
                    || (result.astring === 'string1' || result.anumber === 3)))) {
                  fail('returned item doesn\'t match filter');
                }
              });
            });
          });
        });
      });
    });

    describe('update()', () => {
      beforeEach(() => {
        // Create test data to read from
        return this.store.create(testData);
      });

      it('should return a Promise that resolves to an array of IDs of the items that were updated', () => {
        return this.store.update({ anumber: 7 }).then((ids) => {
          expect(ids.length).toEqual(testData.length);
        });
      });

      describe('when the ID is not in the data', () => {
        it('update all items if no filter is given', () => {
          return this.store.update({ anumber: 7 }).then((ids) => {
            expect(ids.length).toEqual(testData.length);

            return this.store.read().then((results) => {
              results.forEach((result) => {
                expect(result.anumber).toEqual(7);
              });
            });
          });
        });

        it('should only update items that match the given filter', () => {
          return this.store.update({ anumber: 7 },
            { anumber: 1 }).then((ids) => {
            const matchingData = testData.reduce((hits, result) => {
              if (result && result.anumber === 1) {
                hits.push(result._id);
              }
              return hits;
            }, [])
            expect(ids.length).toEqual(matchingData.length);

            return this.store.read().then((results) => {
              results.forEach((result) => {
                if (matchingData.indexOf(result._id) !== -1) {
                  expect(result.anumber).toEqual(7);
                } else {
                  expect(result.anumber).toEqual(testIdMap[result._id].anumber);
                }
              });
            });
          });
        });
      });

      describe('when the ID is given in the data', () => {
        it('should update the item with the given id when filter is not set to true', () => {
          return this.store.update({ _id: 'a', anumber: 7 })
              .then((ids) => {
            expect(ids.length).toEqual(1);

            return this.store.read().then((results) => {
              results.forEach((result) => {
                if (result._id === 'a') {
                  expect(result.anumber).toEqual(7);
                } else {
                  expect(result.anumber).toEqual(testIdMap[result._id].anumber);
                }
              });
            });
          });
        });

        it('should update multiple items if given', () => {
          return this.store.update([
            { _id: 'a', anumber: 7 },
            { _id: 'b', anumber: 6 }
          ]).then((ids) => {
            expect(ids.length).toEqual(2);

            return this.store.read().then((results) => {
              results.forEach((result) => {
                if (result._id === 'a') {
                  expect(result.anumber).toEqual(7);
                } else if (result._id === 'b') {
                  expect(result.anumber).toEqual(6);
                } else {
                  expect(result.anumber).not.toEqual(7);
                  expect(result.anumber).not.toEqual(6);
                }
              });
            });
          });
        });

        it('should replace the item if `filter` is true', () => {
          const newItem = {
            _id: 'a',
            astring: 'string4',
            another: 'string'
          };

          return this.store.update(newItem, true).then((ids) => {
            expect(ids.length).toEqual(1);

            return this.store.read({ _id: 'a' }).then((results) => {
              expect(results.length).toEqual(1);

              expect(results[0]).toEqual(newItem);
            });
          });
        });
      });
    });

    describe('delete()', () => {
      const deleteOccurances = (values: Array<any>, array: Array<any>): void => {
        values.forEach((value) => {
          expect(array).toContain(value);
          const index = array.indexOf(value);
          array.splice(index, 1);
        });
      };

      beforeEach(() => {
        // Create test data to read from
        return this.store.create(testData);
      });

      it('should return a promise that rejects if no filter is given', () => {
        return this.store.delete().then(fail,
            () => Promise.resolve());
      });

      it('should return an array of the ids of the items that were deleted', () => {
        return this.store.delete({ _id: 'a' }).then((ids) => {
          expect(ids).toEqual(jasmine.any(Array));
          expect(ids.length).toEqual(1);
          expect(ids[0]).toEqual('a');
        });
      });

      it('should delete all data in the store when passed `true`', () => {
        return this.store.delete(true).then((ids) => {
          expect(ids.length).toEqual(testData.length);

          return this.store.read();
        }).then((results) => {
          expect(results.length).toEqual(0);
        });
      });

      it('should delete all items that match a complex filter', () => {
        const matchingIds = testData.reduce((ids, item) => {
          if (item.astring === 'string1' || item.anumber === 1 || item.anumber === 2) {
            ids.push(item._id);
          }
          return ids;
        }, []);
        return this.store.delete(
            { $or: [ { astring: 'string1' }, { anumber: { $in: [1, 2] } } ] }).then((ids) => {
          expect(ids.length).toEqual(matchingIds.length);
          deleteOccurances(matchingIds, ids);
          expect(ids.length).toEqual(0, 'test');
        });
      });
    });
  });
};
export default createStoreOperationTests;
