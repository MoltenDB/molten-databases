"use strict";
var _this = this;
var createStoreTests = function (connectStorage, testStorageOptions) {
    var goodStoreOptions = {
        name: 'testStore',
        label: 'Test Store',
        fields: []
    };
    beforeEach(function () {
        return connectStorage(testStorageOptions.testOptions)
            .then(function (storageConnection) {
            _this.storage = storageConnection;
        }, fail);
    });
    afterEach(function () {
        return _this.storage.close().catch(fail);
    });
    describe('MDB.Storage.Storage.createStore()', function () {
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
                    .then(fail, function (error) {
                    // TODO test for type of error
                    return Promise.resolve();
                });
            }, fail);
        });
    });
    describe('Storage.checkStore()', function () {
        it('should return a promise that rejects when the store doesn\'t exist', function () {
            return _this.storage.checkStore('nonExistentStore')
                .then(fail, function () { return Promise.resolve(); });
        });
        it('should return a promise that resolves when the store is good', function () {
            return _this.storage.createStore(goodStoreOptions).then(function () {
                return _this.storage.checkStore(goodStoreOptions.name);
            }).catch(fail);
        });
    });
    describe('Storage.deleteStore()', function () {
        it('should return a Promise that rejects if the storage doesn\'t exist', function () {
            return _this.storage.deleteStore('nonExistentStore')
                .then(fail, function () { return Promise.resolve(); });
        });
        it('should return a Promise that resolves once the given store is '
            + 'deleted', function () {
            return _this.storage.createStore(goodStoreOptions).then(function () {
                return _this.storage.deleteStore(goodStoreOptions.name);
            }).then(function () {
                // Try to open Store to confirm doesn't exist
                return _this.storage.checkStore(goodStoreOptions.name).then(function () {
                    fail('deleteStore() didn\'t the store according to checkStore()');
                }, function () { return Promise.resolve(); });
            }, fail);
        });
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createStoreTests;
