"use strict";
var initialisation_spec_1 = require("./tests/initialisation.spec");
var tableTests_spec_1 = require("./tests/tableTests.spec");
var operationTests_spec_1 = require("./tests/operationTests.spec");
var makeDatabaseTests = function (connectStorage, testStorageOptions) {
    initialisation_spec_1.default(connectStorage, testStorageOptions);
    tableTests_spec_1.default(connectStorage, testStorageOptions);
    operationTests_spec_1.default(connectStorage, testStorageOptions);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeDatabaseTests;
