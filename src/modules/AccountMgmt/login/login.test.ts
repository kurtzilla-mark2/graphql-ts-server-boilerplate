import { Connection } from 'typeorm';

import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../../entity/User';
import { createTypeormConn } from '../../../utils/createTypeormConn';
import { TestClient } from '../../../utils/TestClient';

const email = 'tom@bob.com';
const password = 'jalksdf';

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeormConn();
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
      'some-email@bob.com',
      'bad password',
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
    await loginExpectError(client, email, 'aslkdfjaksdljf', invalidLogin);

    // // if we login correctly - all should be well
    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
