"use strict";
var _this = this;
var createStoreTests = function (connectStorage, testStorageOptions) {
    var goodStoreOptions = {
        name: 'testStore',
        type: 'store',
        label: 'Test Store',
        fields: []
    };
    var goodKeyValueStoreOptions = {
        name: 'testStore',
        type: 'keyValue',
        label: 'Test Store'
    };
    describe('Storage connection', function () {
        beforeEach(function () {
            return connectStorage(testStorageOptions.testOptions)
                .then(function (storageConnection) {
                _this.storage = storageConnection;
            }, fail);
        });
        afterEach(function () {
            return _this.storage.close().catch(fail);
        });
        describe('createStore()', function () {
            xdescribe('should return a Promise that rejects on bad options', function () {
            });
            it('should return a Promise that resolves when the store has '
                + 'been created', function () {
                return _this.storage.createStore(goodStoreOptions).then(function () {
                    if (testStorageOptions.checkStore) {
                        expect(testStorageOptions.checkStore(goodStoreOptions))
                            .toBeTruthy();
                    }
                }, fail);
            });
            it('should fail if the store already exists', function () {
                return _this.storage.createStore(goodStoreOptions).then(function () {
                    return _this.storage.createStore(goodStoreOptions)
                        .then(function (store) { return fail('Returned store ' + Object.keys(store)); }, function (error) {
                        // TODO test for type of error
                        return Promise.resolve();
                    });
                }, fail);
            });
        });
        describe('getStore()', function () {
            it('should return a promise that rejects when the store doesn\'t exist', function () {
                return _this.storage.getStore(goodStoreOptions)
                    .then(function (store) { return fail('Returned store ' + Object.keys(store)); }, function () { return Promise.resolve(); });
            });
            it('should return a promise that resolves to the Store interface when it exists', function () {
                return _this.storage.createStore(goodStoreOptions).then(function () {
                    return _this.storage.getStore(goodStoreOptions);
                }).then(function (store) {
                    expect(store.create).toEqual(jasmine.any(Function));
                    expect(store.read).toEqual(jasmine.any(Function));
                    expect(store.update).toEqual(jasmine.any(Function));
                    expect(store.delete).toEqual(jasmine.any(Function));
                    expect(store.count).toEqual(jasmine.any(Function));
                });
            });
            if (connectStorage.features.indexOf('keyValue') !== -1) {
                it('should return a promise that resolves to a KeyValueStore interface when it exists', function () {
                    return _this.storage.createStore(goodKeyValueStoreOptions).then(function () {
                        return _this.storage.getStore(goodKeyValueStoreOptions);
                    }).then(function (store) {
                        expect(store.getItem).toEqual(jasmine.any(Function));
                        expect(store.setItem).toEqual(jasmine.any(Function));
                        expect(store.removeItem).toEqual(jasmine.any(Function));
                    });
                });
            }
        });
        describe('checkStore()', function () {
            it('should return a promise that rejects when the store doesn\'t exist', function () {
                return _this.storage.checkStore(goodStoreOptions)
                    .then(fail, function () { return Promise.resolve(); });
            });
            it('should return a promise that resolves when the store is good', function () {
                return _this.storage.createStore(goodStoreOptions).then(function () {
                    return _this.storage.checkStore(goodStoreOptions);
                }).catch(fail);
            });
        });
        describe('deleteStore()', function () {
            it('should return a Promise that rejects if the storage doesn\'t exist', function () {
                return _this.storage.deleteStore(goodStoreOptions)
                    .then(fail, function () { return Promise.resolve(); });
            });
            it('should return a Promise that resolves once the given store is '
                + 'deleted', function () {
                return _this.storage.createStore(goodStoreOptions).then(function () {
                    return _this.storage.deleteStore(goodStoreOptions);
                }).then(function () {
                    // Try to open Store to confirm doesn't exist
                    return _this.storage.checkStore(goodStoreOptions).then(function () {
                        fail('deleteStore() didn\'t the store according to checkStore()');
                    }, function () { return Promise.resolve(); });
                }, fail);
            });
        });
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createStoreTests;
