"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const graphql_tools_1 = require("graphql-tools");
exports.genSchema = () => {
    const schemas = [];
    let modules = [];
    const categories = fs
        .readdirSync(path.join(__dirname, '../modules'))
        .filter(name => !name.startsWith('_'));
    categories.forEach(category => {
        console.log(`../modules/${category}`);
    });
    return graphql_tools_1.mergeSchemas({ schemas });
};
//# sourceMappingURL=genSchema.js.map