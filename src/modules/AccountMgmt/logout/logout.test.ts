import { Connection } from 'typeorm';

import { createTypeormConn } from '../../../utils/createTypeormConn';
import { User } from '../../../entity/User';
import { TestClient } from '../../../testSetup/testClient';

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

describe('logout', () => {
  test('multiple session logout', async () => {
    const sess1 = new TestClient(process.env.TEST_HOST as string);
    const sess2 = new TestClient(process.env.TEST_HOST as string);

    await sess1.login(email, password);
    await sess2.login(email, password);

    expect(await sess1.me()).toEqual(await sess2.me());
    await sess1.logout();
    expect(await sess1.me()).toEqual(await sess2.me());
  });

  test('single session logout', async () => {
    const client = new TestClient(process.env.TEST_HOST as string);

    await client.login(email, password);
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email
      }
    });

    await client.logout();
    const response2 = await client.me();
    expect(response2.data.me).toBeNull();
  });
});
