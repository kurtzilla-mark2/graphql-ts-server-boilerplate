import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../../types/graphql-utils';
import { User } from '../../../entity/User';
import {
  invalidLogin,
  confirmEmailError,
  forgotPasswordLockedError
} from './errorMessages';
import { userSessionIdPrefix } from '../../../utils/Lookups/constants';

const errorResponse = [
  {
    path: 'email',
    message: invalidLogin
  }
];

export const resolvers: ResolverMap = {
  Query: {
    stub: () => 'stub'
  },
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: 'email',
            message: confirmEmailError
          }
        ];
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: 'email',
            message: forgotPasswordLockedError
          }
        ];
      }

      // const userPass = user.password || '';
      // const valid = await bcrypt.compare(password, userPass);
      const valid = await bcrypt.compare(password, user.password || '');

      if (!valid) {
        return errorResponse;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);
      }

      // if you want to retrieve the redis stored sessionid
      // redis.get(`${redisSessionPrefix}${req.sessionID}`);

      return null;
    }
  }
};
