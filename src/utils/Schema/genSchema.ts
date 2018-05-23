import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];

  // loop thru the modules directory and find the categories
  let modules: string[] = [];
  const modulesDir = path.join(__dirname, '../../modules');

  const categories = fs
    .readdirSync(modulesDir)
    .filter(name => !name.startsWith('_'));

  categories.forEach(category => {
    modules = fs
      .readdirSync(`${modulesDir}/${category}`)
      .filter(name => !name.startsWith('_'));

    modules.forEach(mod => {
      const {
        resolvers
      } = require(`${modulesDir}/${category}/${mod}/resolvers`);
      const typeDefs = importSchema(
        `${modulesDir}/${category}/${mod}/schema.graphql`
      );
      schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
    });
  });

  return mergeSchemas({ schemas });
};
