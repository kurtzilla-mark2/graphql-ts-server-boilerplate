import axios from 'axios';

import { Connection } from 'typeorm';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';

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

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const meQuery = `
{
  me {
    id
    email
  }
}
`;

describe('test the me query', () => {
  // test('cannot get user if not logged in', async () => {
  //   // later - tbd
  // });

  test('get current user', async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password)
      },
      {
        withCredentials: true // this will ensure the cookie gets saved
      }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery
      },
      { withCredentials: true }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email
      }
    });
  });
});
