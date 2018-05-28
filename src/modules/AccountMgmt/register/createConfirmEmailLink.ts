import { v4 } from 'uuid';
import { Redis } from 'ioredis';

// http://localhost:4000
// https://my-ste.com
// => https://my-site.com/confirm/<id>

export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis
) => {
  const id = v4();
  await redis.set(id, userId, 'ex', 60 * 60 * 24); // 24 hours
  return `${url}/confirm/${id}`;
};
