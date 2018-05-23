"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_import_1 = require("graphql-import");
const path = require("path");
const fs = require("fs");
const graphql_tools_1 = require("graphql-tools");
exports.genSchema = () => {
    const schemas = [];
    let modules = [];
    const modulesDir = path.join(__dirname, '../../modules');
    const categories = fs
        .readdirSync(modulesDir)
        .filter(name => !name.startsWith('_'));
    categories.forEach(category => {
        modules = fs
            .readdirSync(`${modulesDir}/${category}`)
            .filter(name => !name.startsWith('_'));
        modules.forEach(mod => {
            const { resolvers } = require(`${modulesDir}/${category}/${mod}/resolvers`);
            const typeDefs = graphql_import_1.importSchema(`${modulesDir}/${category}/${mod}/schema.graphql`);
            schemas.push(graphql_tools_1.makeExecutableSchema({ resolvers, typeDefs }));
        });
    });
    return graphql_tools_1.mergeSchemas({ schemas });
};
//# sourceMappingURL=genSchema.js.map