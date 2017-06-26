"use strict";
var createInitialisationTests = function (connectStorage, testStorageOptions) {
    describe('connectStorage()', function () {
        it('should have `types` property of array of types that the storage supports', function () {
            expect(connectStorage.types).toEqual(jasmine.any(Array));
        });
        it('should have `features` property of array of features that the storage supports', function () {
            expect(connectStorage.features).toEqual(jasmine.any(Array));
        });
        describe('should return a Promise that rejects on bad options', function () {
            var makeTestFunction = function (options) {
                return function () {
                    return connectStorage(options).then(function () {
                        fail('Promise resolved');
                    }, function () { return Promise.resolve(); });
                };
            };
            if (testStorageOptions.badOptions instanceof Array) {
                testStorageOptions.badOptions.forEach(function (option, index) {
                    it(option.label || "with bad option " + index, makeTestFunction(option.options));
                });
            }
        });
        describe('should return a Promise MDB.Storage interface object when given valid '
            + 'options', function () {
            var makeTestFunction = function (options) {
                return function () {
                    return connectStorage(options).then(function (storage) {
                        expect(storage).toEqual(jasmine.any(Object));
                        expect(storage.close).toEqual(jasmine.any(Function));
                    });
                };
            };
            if (testStorageOptions.goodOptions instanceof Array) {
                testStorageOptions.goodOptions.forEach(function (option, index) {
                    it(option.label || "with good option" + index, makeTestFunction(option.options));
                });
            }
            it('with testStorageOptions', makeTestFunction(testStorageOptions.testOptions));
        });
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createInitialisationTests;
