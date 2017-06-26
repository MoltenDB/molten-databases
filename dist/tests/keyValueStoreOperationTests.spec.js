"use strict";
var _this = this;
var createKeyValueStoreOperationTests = function (connectStorage, testStorageOptions) {
    var testStoreOptions = {
        name: 'testoperationstore',
        type: 'keyValue',
        label: 'Operation Tests Store',
    };
    describe('Key-Value Store Instance', function () {
        beforeEach(function () {
            return connectStorage(testStorageOptions.testOptions).then(function (storage) {
                _this.storage = storage;
                return _this.storage.createStore(testStoreOptions).then(function (store) {
                    _this.store = store;
                });
            });
        });
        describe('setItem()', function () {
            it('should return a Promise that rejects if no id given', function () {
                return _this.store.setItem().then(fail, function () { return Promise.resolve(); });
            });
            it('should return a Promise that resolves to the new value', function () {
                return _this.store.setItem('test', 'value').then(function (newValue) {
                    expect(newValue).toEqual('value');
                });
            });
        });
        describe('getItem()', function () {
            beforeEach(function () {
                return _this.store.setItem('test', 'value');
            });
            it('should return a Promise that resolves to the stored value', function () {
                return _this.store.getItem('test').then(function (value) {
                    expect(value).toEqual('value');
                });
            });
            it('should return a Promise that resolves to undefined if there is no stored value', function () {
                return _this.store.getItem('noValue').then(function (value) {
                    expect(value).not.toBeDefined();
                });
            });
        });
        describe('removeItem()', function () {
            beforeEach(function () {
                return _this.store.setItem('test', 'value');
            });
            it('should return a Promise that resolves once the value has been removed', function () {
                return _this.store.removeItem('test').then(function () {
                    return _this.store.getItem('test').then(function (value) {
                        expect(value).not.toBeDefined();
                    });
                });
            });
            it('should return a Promise that resolves if a value didn\'t exist', function () {
                return _this.store.removeItem('noValue');
            });
        });
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createKeyValueStoreOperationTests;
