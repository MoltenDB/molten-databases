"use strict";
var _this = this;
var createOperationTests = function (connectStorage, testStorageOptions) {
    var testStoreOptions = {
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
    var testData = [
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
        var arrayData_1 = [
            ['string2', 45],
            ['string', 'string4'],
            [34, 234, 2343],
            ['string'],
            []
        ];
        testData.forEach(function (item, index) {
            item.anarray = arrayData_1[index];
        });
    }
    var testIdMap = testData.reduce(function (map, item) {
        map[item._id] = item;
        return map;
    }, {});
    beforeEach(function () {
        return connectStorage(testStorageOptions.testOptions).then(function (storage) {
            _this.storage = storage;
        });
    });
    afterEach(function () {
        return _this.storage.close().catch(fail);
    });
    describe('create()', function () {
        beforeEach(function () {
            return _this.storage.createStore(testStoreOptions);
        });
        afterEach(function () {
            return _this.storage.deleteStore(testStoreOptions.name);
        });
        it('should return a Promise that rejects if no data is given', function () {
            return _this.storage.create(testStoreOptions.name).then(function () {
                fail('create() Promise resolved, should have rejected');
            }, function () { });
        });
        if (connectStorage.features.indexOf('uniqueId') !== -1) {
            it('should return a Promise that rejects if no _id is given in the data', function () {
                var failData = testData.map(function (item) { return Object.assign({}, item); });
                delete failData[0]['_id'];
                return _this.storage.create(testStoreOptions.name, failData).then(function () {
                    fail('create() Promise resolved, should have rejected');
                }, function () { });
            });
        }
        else {
            it('should return a Promise that rejects if no _id is given in the data', function () {
                var failData = testData.map(function (item) { return Object.assign({}, item); });
                delete failData[0]['_id'];
                return _this.storage.create(testStoreOptions.name, failData).then(function () {
                    fail('create() Promise resolved, should have rejected');
                }, function () { });
            });
        }
        describe('given a single item to create', function () {
            it('should return a Promise that resolves to the ID of the item once created', function () {
                return _this.storage.create(testStoreOptions.name, testData[0]).then(function (id) {
                    expect(id).toEqual(testData[0]._id);
                });
            });
            it('should return a Promise that rejects if an item wasn\'t created successfully', function () {
                return _this.storage.create(testStoreOptions.name, testData[0]).then(function (id) {
                    return _this.storage.create(testStoreOptions.name, testData[0]).then(function (id) {
                        fail('Storage should not allow creation items with an ID already in the database');
                    }, function () { });
                });
            });
        });
        describe('given an array of items to create', function () {
            it('should return a promise that resolves to an array of the IDs of the items created in '
                + 'the order that the items were given', function () {
                return _this.storage.create(testStoreOptions.name, testData).then(function (ids) {
                    expect(ids).toEqual(jasmine.any(Array));
                    expect(ids.length).toEqual(testData.length);
                    testData.forEach(function (testItem, index) {
                        expect(ids[index]).toEqual(testItem._id);
                    });
                });
            });
            it('should return a promise that resolves to an array containing IDs for the items created '
                + 'successfully and Errors for the items that weren\'t created successfully', function () {
                return _this.storage.create(testStoreOptions.name, testData[0]).then(function () {
                    return _this.storage.create(testStoreOptions.name, testData).then(function (ids) {
                        expect(ids).toEqual(jasmine.any(Array));
                        expect(ids.length).toEqual(testData.length);
                        expect(ids[0]).toEqual(jasmine.any(Error));
                        for (var i = 1; i < testData.length; i++) {
                            expect(ids[i]).toEqual(testData[i]._id);
                        }
                    });
                });
            });
        });
    });
    describe('read()', function () {
        describe('simple value reads', function () {
            beforeEach(function () {
                // Create a store with test data to read from
                return _this.storage.createStore(testStoreOptions).then(function () {
                    return _this.storage.create(testStoreOptions.name, testData);
                }, fail);
            });
            afterEach(function () {
                return _this.storage.deleteStore(testStoreOptions.name);
            });
            it('should return all items if no filter or options are given', function () {
                return _this.storage.read(testStoreOptions.name).then(function (results) {
                    expect(results.length).toEqual(testData.length);
                }, fail);
            });
            describe('field/value filters', function () {
                var resultsChecker = function (filter) { return function (results) {
                    expect(results.length).toEqual(testData.reduce(function (hits, next) {
                        if (next) {
                            if (!Object.keys(filter).find(function (field) {
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
                    results.forEach(function (result) {
                        if (result) {
                            Object.keys(filter).forEach(function (field) {
                                expect(result[field]).toBeDefined();
                                expect(result[field]).toEqual(filter[field]);
                            });
                        }
                        else {
                            fail('Result not truthy');
                        }
                    });
                }; };
                it('should return only values matching a single field filter', function (done) {
                    var filter = { astring: 'string2' };
                    _this.storage.read(testStoreOptions.name, filter)
                        .then(resultsChecker(filter), fail).then(done);
                });
                it('should return only values matching all of a multiple fields filter', function (done) {
                    var filter = { astring: 'string2', anumber: 2 };
                    _this.storage.read(testStoreOptions.name, filter)
                        .then(resultsChecker(filter), fail).then(done);
                });
            });
            describe('comparison operators', function () {
            });
            describe('logical operators', function () {
                describe('$or', function () {
                    it('should logical OR tests in $or array', function (done) {
                        var filter = { $or: [
                                { astring: 'string2' },
                                { anumber: { '$gt': 2 } }
                            ] };
                        _this.storage.read(testStoreOptions.name, filter)
                            .then(function (results) {
                            expect(results.length)
                                .toEqual(testData.reduce(function (hits, next) {
                                if (next && (next.astring === 'string2'
                                    || next.anumber > 2)) {
                                    return hits + 1;
                                }
                                return hits;
                            }, 0));
                            results.forEach(function (result) {
                                if (result) {
                                    if (result.astring !== 'string2' && result.anumber <= 2) {
                                        fail('result did not match filter');
                                    }
                                }
                                else {
                                    fail('got falsey result');
                                }
                            });
                        });
                    });
                });
                describe('$and', function () {
                    it('should logical AND tests in $and array', function (done) {
                        var filter = { $and: [
                                { astring: 'string2' },
                                { anumber: { $gte: 2 } }
                            ] };
                        _this.storage.read(testStoreOptions.name, filter)
                            .then(function (results) {
                            expect(results.length)
                                .toEqual(testData.reduce(function (hits, next) {
                                if (next && (next.astring === 'string2'
                                    && next.anumber >= 2)) {
                                    return hits + 1;
                                }
                                return hits;
                            }, 0));
                            results.forEach(function (result) {
                                if (result) {
                                    expect(result.astring).toEqual('string2');
                                    expect(result.anumber).toBeGreaterThanOrEqual(2);
                                }
                                else {
                                    fail('got falsey result');
                                }
                            });
                        });
                    });
                });
                describe('$not', function () {
                    it('should logical AND tests in $and array', function (done) {
                        var filter = { $not: { astring: 'string2' } };
                        _this.storage.read(testStoreOptions.name, filter)
                            .then(function (results) {
                            expect(results.length)
                                .toEqual(testData.reduce(function (hits, next) {
                                if (next && next.astring !== 'string2') {
                                    return hits + 1;
                                }
                                return hits;
                            }, 0));
                            results.forEach(function (result) {
                                if (result && result.astring && result.astring === 'string2') {
                                    expect(result.astring).not.toEqual('string2');
                                }
                            });
                        });
                    });
                });
                it('should be able to have nested logical statements', function (done) {
                    var filter = { $or: [
                            { $and: [
                                    { astring: 'string2' },
                                    { anumber: 2 }
                                ] },
                            { $or: [
                                    { astring: 'string1' },
                                    { anumber: 3 }
                                ] }
                        ] };
                    return _this.storage.read(testStoreOptions.name, filter).then(function (results) {
                        expect(results.length).toEqual(testData.reduce(function (hits, result) {
                            if (result && ((result.astring === 'string2' && result.anumber === 2)
                                || (result.astring === 'string1' || result.anumber === 3))) {
                                return hits + 1;
                            }
                            return hits;
                        }, 0));
                        results.forEach(function (result) {
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
    describe('update()', function () {
        beforeEach(function () {
            return _this.storage.create(testStoreOptions.name, testData);
        });
        it('should return a Promise that resolves to an array of IDs of the items that were updated', function () {
            return _this.storage.update(testStoreOptions.name, { anumber: 7 }).then(function (ids) {
                expect(ids.length).toEqual(testData.length);
            });
        });
        describe('when the ID is not in the data', function () {
            it('update all items if no filter is given', function () {
                return _this.storage.update(testStoreOptions.name, { anumber: 7 }).then(function (ids) {
                    expect(ids.length).toEqual(testData.length);
                    return _this.storage.read(testStoreOptions.name).then(function (results) {
                        results.forEach(function (result) {
                            expect(result.anumber).toEqual(7);
                        });
                    });
                });
            });
            it('should only update items that match the given filter', function () {
                return _this.storage.update(testStoreOptions.name, { anumber: 7 }, { anumber: 1 }).then(function (ids) {
                    var matchingData = testData.reduce(function (hits, result) {
                        if (result && result.anumber === 1) {
                            hits.push(result._id);
                        }
                        return hits;
                    }, []);
                    expect(ids.length).toEqual(matchingData.length);
                    return _this.storage.read(testStoreOptions.name).then(function (results) {
                        results.forEach(function (result) {
                            if (matchingData.indexOf(result._id) !== -1) {
                                expect(result.anumber).toEqual(7);
                            }
                            else {
                                expect(result.anumber).toEqual(testIdMap[result._id].anumber);
                            }
                        });
                    });
                });
            });
        });
        describe('when the ID is given in the data', function () {
            it('should update the item with the given id when filter is not set to true', function () {
                return _this.storage.update(testStoreOptions.name, { _id: 1, anumber: 7 })
                    .then(function (ids) {
                    expect(ids.length).toEqual(1);
                    return _this.storage.read(testStoreOptions.name).then(function (results) {
                        results.forEach(function (result) {
                            if (result._id === 1) {
                                expect(result.anumber).toEqual(7);
                            }
                            else {
                                expect(result.anumber).toEqual(testIdMap[result._id].anumber);
                            }
                        });
                    });
                });
            });
            it('should update multiple items if given', function () {
                return _this.storage.update(testStoreOptions.name, [
                    { _id: 1, anumber: 7 },
                    { _id: 2, anumber: 6 }
                ]).then(function (ids) {
                    expect(ids.length).toEqual(2);
                    return _this.storage.read(testStoreOptions.name).then(function (results) {
                        results.forEach(function (result) {
                            if (result._id === 1) {
                                expect(result.anumber).toEqual(7);
                            }
                            else if (result._id === 2) {
                                expect(result.anumber).toEqual(6);
                            }
                            else {
                                expect(result.anumber).not.toEqual(7);
                                expect(result.anumber).not.toEqual(6);
                            }
                        });
                    });
                });
            });
            it('should replace the item if `filter` is true', function () {
                var newItem = {
                    _id: 1,
                    astring: 'string4',
                    another: 'string'
                };
                return _this.storage.update(testStoreOptions.name, newItem, true).then(function (ids) {
                    expect(ids.length).toEqual(1);
                    return _this.storage.read(testStoreOptions.name, { _id: 1 }).then(function (results) {
                        expect(results.length).toEqual(1);
                        expect(results[0]).toEqual(newItem);
                    });
                });
            });
        });
    });
    describe('delete()', function () {
        var deleteOccurances = function (values, array) {
            values.forEach(function (value) {
                expect(array).toContain(value);
                var index = array.indexOf(value);
                array.splice(index, 0);
            });
        };
        beforeEach(function () {
            return _this.storage.create(testStoreOptions.name, testData);
        });
        it('should return a promise that rejects if no filter is given', function () {
            return _this.storage.delete(testStoreOptions.name).then(fail, function () { return Promise.resolve(); });
        });
        it('should return an array of the ids of the items that were deleted', function () {
            return _this.storage.delete(testStoreOptions.name, { _id: 1 }).then(function (ids) {
                expect(ids).toEqual(jasmine.any(Array));
                expect(ids.length).toEqual(1);
                expect(ids[0]).toEqual(1);
            });
        });
        it('should delete all data in the store when passed `true`', function () {
            return _this.storage.delete(testStoreOptions.name, true).then(function (ids) {
                expect(ids.length).toEqual(testData.length);
                return _this.storage.read();
            }).then(function (results) {
                expect(results.length).toEqual(0);
            });
        });
        it('should delete all items that match a complex filter', function () {
            var matchingIds = testData.reduce(function (ids, item) {
                if (item.astring === 'string1' || item.anumber === 1 || item.anumber === 2) {
                    ids.push(item._id);
                }
                return ids;
            }, []);
            return _this.storage.delete(testStoreOptions.name, { $or: [{ astring: 'string1' }, { anumber: { $in: [1, 2] } }] }).then(function (ids) {
                expect(ids.length).toEqual(matchingIds.length);
                deleteOccurances(matchingIds, ids);
                expect(ids.length).toEqual(0);
            });
        });
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createOperationTests;
