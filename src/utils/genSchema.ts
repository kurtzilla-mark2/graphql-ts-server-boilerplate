import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];

  // loop thru the modules directory and find the categories
  let modules: string[] = [];
  const categories = fs
    .readdirSync(path.join(__dirname, '../modules'))
    .filter(name => !name.startsWith('_'));

  categories.forEach(category => {
    modules = fs
      .readdirSync(path.join(__dirname, `../modules/${category}`))
      .filter(name => !name.startsWith('_'));

    modules.forEach(mod => {
      const { resolvers } = require(`../modules/${category}/${mod}/resolvers`);
      const typeDefs = importSchema(
        path.join(__dirname, `../modules/${category}/${mod}/schema.graphql`)
      );
      schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    });
  });

  return mergeSchemas({ schemas });
};
