import { Connection } from 'typeorm';
import * as faker from 'faker';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../../entity/User';
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

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: 'email',
        message: errMsg
      }
    ]
  });
};

describe('login', () => {
  test('email not found send back error', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await loginExpectError(
      client,
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  test('email not confirmed', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // create a user - register user
    await client.register(email, password);

    // user is not yet confirmed - we should receive a message to confirm
    await loginExpectError(client, email, password, confirmEmailError);

    // // update the user - confirm
    await User.update({ email }, { confirmed: true });

    // // ensure we get an error if using a bogus password
    await loginExpectError(
      client,
      email,
      faker.internet.password(),
      invalidLogin
    );

    // // if we login correctly - all should be well
    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
