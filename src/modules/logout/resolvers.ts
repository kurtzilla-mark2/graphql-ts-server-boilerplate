import { ResolverMap } from '../../types/graphql-utils';

import { removeAllUsersSessions } from '../../utils/removeAllUsersSessions';

export const resolvers: ResolverMap = {
  Query: {
    stub: () => 'stub'
  },
  Mutation: {
    logout: async (_, __, { session, redis }) => {
      // get rid of redis entry and kill the cookie
      const { userId } = session;
      if (userId) {
        removeAllUsersSessions(userId, redis);
        return true;
      }

      return false;
    }
  }
};
