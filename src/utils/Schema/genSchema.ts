import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as glob from 'glob';
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

const modulesDir = path.join(__dirname, '../../modules');

// Don't make async!!!!!!!!!!
// consuming function will flail
export const genSchema = () => {
  const schemas: GraphQLSchema[] = [];

  // find files in question - resolvers.ts and schema.graphql
  const actionableFolders = glob.sync('**/+(resolvers.ts|schema.graphql)', {
    cwd: modulesDir,
    ignore: '_*/**',
    nocase: true
  });

  // create a distinct list of folders to loop thru as we
  // need to makeExecutableSchema on a per-folder basis
  const folders = actionableFolders.reduce(
    (acc: string[], curr: string): string[] => {
      // remove filename from path
      const p = path.dirname(curr);
      if (acc.indexOf(p) === -1) {
        acc.push(p);
      }
      return acc;
    },
    []
  );

  // now loop through found set of folders and make schema
  folders.forEach(folder => {
    const { resolvers } = require(`${modulesDir}/${folder}/resolvers`);
    const typeDefs = importSchema(`${modulesDir}/${folder}/schema.graphql`);
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return mergeSchemas({ schemas });
};
