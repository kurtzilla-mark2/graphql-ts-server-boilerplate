import { Redis } from 'ioredis';
import { removeAllUsersSessions } from './removeAllUsersSessions';
import { User } from '../../entity/User';

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  // make it so they can't login
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  // remove all of their sessions
  removeAllUsersSessions(userId, redis);
};
