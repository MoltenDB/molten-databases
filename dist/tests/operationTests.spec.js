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
        afterEach((function () {
            return _this.storage.deleteStore(testStoreOptions.name);
        }));
        it('should fail if no is given in the data', function () {
            var failData = testData.map(function (item) { return Object.assign({}, item); });
            delete failData[0]['_id'];
            return _this.storage.create(testStoreOptions.name, failData).then(function () {
                fail('create() Promise resolved, should have rejected');
            }, function () { });
        });
        it('should return an array of the ids created', function () {
            return _this.storage.create(testStoreOptions.name, testData).then(function (ids) {
                expect(ids).toEqual(jasmine.any(Array));
                expect(ids.length).toEqual(testData.length);
                var testDataKeys = Object.keys(testData);
                ids.forEach(function (id) {
                    var index;
                    testData.find(function (testItem, testItemIndex) {
                        if (testItem._id === id) {
                            index = testItemIndex;
                            return true;
                        }
                    });
                    if (typeof index === 'undefined') {
                        fail("got an id that was not in the testData (" + id + ")");
                    }
                    else {
                        testDataKeys.splice(index, 1);
                    }
                });
                if (testDataKeys.length) {
                    fail("testData keys not included in created items (" + testDataKeys + ")");
                }
            });
        });
        it('should reject if ids already exist', function () {
            return _this.storage.create(testStoreOptions.name, testData).then(function () {
                return _this.storage.create(testStoreOptions.name, testData).then(function () {
                    fail('create() promise resolved on trying to recreate items');
                }, function () { });
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
                });
            });
        });
    });
    describe('update()', function () {
    });
    describe('delete()', function () {
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createOperationTests;
