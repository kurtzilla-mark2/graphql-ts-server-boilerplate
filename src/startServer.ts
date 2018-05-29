import 'reflect-metadata'; // necessary for typeorm
import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import * as RateLimit from 'express-rate-limit';
import * as RateLimitRedisStore from 'rate-limit-redis';

import { redis } from './redis';
import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/Schema/genSchema';
import { redisSessionPrefix } from './utils/Lookups/constants';
import { implementPassportStrategies } from './utils/AccountMgmt/passportStrategies';
import { createTestConn } from './testUtils/createTestConn';

const {
  NODE_ENV,
  FRONTEND_HOST,
  API_PORT,
  SESSION_KEY_NAME,
  SESSION_SECRET
} = process.env;

const RedisStore = connectRedis(session);

export const startServer = async () => {
  if (NODE_ENV === 'test') {
    await redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
      session: request.session,
      req: request
    })
  });

  server.express.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 1000 * 60 * 15, // every 15 minutes
      max: 100, // limit each ip to xxx reqs per windowMs
      delayMs: 0 // disable delaying - full speed until max limit is reached
    })
  );

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: SESSION_KEY_NAME as string,
      secret: SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    credentials: true,
    origin: NODE_ENV === 'test' ? '*' : FRONTEND_HOST
  };

  server.express.get('/confirm/:id', confirmEmail);

  const connection =
    NODE_ENV === 'test'
      ? await createTestConn(true)
      : await createTypeormConn();

  implementPassportStrategies(connection, server);

  const app = await server.start({
    cors,
    port: NODE_ENV === 'test' ? 0 : API_PORT
  });

  console.log(`Server is running on localhost:${API_PORT}`);

  return app;
};
