"use strict";
var initialisation_spec_1 = require("./tests/initialisation.spec");
var storeTests_spec_1 = require("./tests/storeTests.spec");
var itemStoreOperationTests_spec_1 = require("./tests/itemStoreOperationTests.spec");
var keyValueStoreOperationTests_spec_1 = require("./tests/keyValueStoreOperationTests.spec");
var makeStorageTests = function (connectStorage, testStorageOptions) {
    initialisation_spec_1.default(connectStorage, testStorageOptions);
    storeTests_spec_1.default(connectStorage, testStorageOptions);
    itemStoreOperationTests_spec_1.default(connectStorage, testStorageOptions);
    if (connectStorage.features.indexOf('keyValue') !== -1) {
        keyValueStoreOperationTests_spec_1.default(connectStorage, testStorageOptions);
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeStorageTests;
