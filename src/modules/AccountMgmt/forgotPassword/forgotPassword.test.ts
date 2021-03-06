import * as Redis from 'ioredis';
import * as faker from 'faker';
import { Connection } from 'typeorm';

import { User } from '../../../entity/User';
import { createTestConn } from '../../../testUtils/createTestConn';
import { createForgotPasswordLink } from '../../../utils/AccountMgmt/createForgotPasswordLink';
import { forgotPasswordLockAccount } from '../../../utils/AccountMgmt/forgotPasswordLockAccount';
import { passwordNotLongEnough } from '../register/errorMessages';
import { expiredKeyError } from './errorMessages';
import { forgotPasswordLockedError } from '../login/errorMessages';
import { TestClient } from '../../../testUtils/testClient';

let conn: Connection;
const redis = new Redis();
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = faker.internet.password();

let userId: string;
beforeAll(async () => {
  conn = await createTestConn();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.close();
});

describe('forgot password', () => {
  test('make sure it works', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    // lock account
    await forgotPasswordLockAccount(userId, redis);

    const url = await createForgotPasswordLink('', userId, redis);
    const parts = url.split('/');
    const key = parts[parts.length - 1];

    // make sure you can't login to a locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            path: 'email',
            message: forgotPasswordLockedError
          }
        ]
      }
    });

    // try changing to a password that's too short
    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: passwordNotLongEnough
          }
        ]
      }
    });

    const response = await client.forgotPasswordChange(newPassword, key);
    expect(response.data).toEqual({
      forgotPasswordChange: null
    });

    // make sure redis key expires after password change
    expect(
      await client.forgotPasswordChange(faker.internet.password(), key)
    ).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKeyError
          }
        ]
      }
    });

    // verify that we can still login
    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null
      }
    });
  });
});
