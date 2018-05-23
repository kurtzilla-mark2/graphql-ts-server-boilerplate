import { Connection } from 'typeorm';

import { createTypeormConn } from '../../../utils/createTypeormConn';
import { User } from '../../../entity/User';
import { TestClient } from '../../../utils/TestClient';

let conn: Connection;
let userId: string;
const email = 'bob5@bob.com';
const password = 'jhg8765HH';

beforeAll(async () => {
  conn = await createTypeormConn();
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

describe('test the me query', () => {
  test('return null if no cookie', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    const response = await client.me();
    expect(response.data.me).toBeNull();
  });

  test('get current user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);
    // make another request and make sure we get our cookie info back
    // withCredentials: true - ensures we make use of cookie info
    const response = await client.me();
    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
