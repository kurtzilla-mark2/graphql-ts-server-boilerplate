import { Connection } from 'typeorm';
import * as faker from 'faker';

import { User } from '../../../entity/User';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from './errorMessages';
import { createTestConn } from '../../../testUtils/createTestConn';
import { TestClient } from '../../../testUtils/testClient';

const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConn();
});

afterAll(async () => {
  conn.close();
});

describe('Register user', async () => {
  it('make sure we can register a user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.register(email, password);
    expect(response.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it('test for dupe emails', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response2 = await client.register(email, password);
    expect(response2.data.register).toHaveLength(1);
    expect(response2.data.register[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    });
  });

  it('catch bad email', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response3: any = await client.register('ad', password);
    expect(response3.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        },
        {
          path: 'email',
          message: invalidEmail
        }
      ]
    });
  });

  it('catch bad password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response4: any = await client.register(faker.internet.email(), 'b');
    expect(response4.data).toEqual({
      register: [
        {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it('catch bad email and password', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response5: any = await client.register('b', 'b');
    expect(response5.data).toEqual({
      register: [
        {
          path: 'email',
          message: emailNotLongEnough
        },
        {
          path: 'email',
          message: invalidEmail
        },
        {
          path: 'password',
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
