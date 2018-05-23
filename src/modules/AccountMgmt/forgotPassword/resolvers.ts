import * as yup from 'yup';
import * as bcrypt from 'bcryptjs';

import { ResolverMap } from '../../../types/graphql-utils';
import { forgotPasswordLockAccount } from '../../../utils/AccountMgmt/forgotPasswordLockAccount';
import { createForgotPasswordLink } from '../../../utils/AccountMgmt/createForgotPasswordLink';
import { User } from '../../../entity/User';
import { userNotFoundError, expiredKeyError } from './errorMessages';
import { forgotPasswordPrefix } from '../../../utils/Lookups/constants';
import { registerPasswordValidation } from '../../_helpers/yupSchemas';
import { formatYupError } from '../../../utils/ErrorHandling/formatYupError';

// from owasp
// confirmation link should only last 20 minutes
// lock account when we ask for the forgotPassword link

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
});

export const resolvers: ResolverMap = {
  Query: {
    stub: () => 'stub'
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [
          {
            path: 'email',
            message: userNotFoundError
          }
        ];
      }

      await forgotPasswordLockAccount(user.id, redis);
      // @todo add frontend url
      await createForgotPasswordLink('', user.id, redis);
      // @todo send email with url
      return true;
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      // validate key
      const redisKey = `${forgotPasswordPrefix}${key}`;

      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: 'key',
            message: expiredKeyError
          }
        ];
      }

      // validate password
      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword
        }
      );

      const deleteKeyPromise = await redis.del(redisKey);

      await Promise.all([updatePromise, deleteKeyPromise]);

      return null;
    }
  }
};
