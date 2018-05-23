import { Resolver } from '../../../types/graphql-utils';
// import { logger } from '../../utils/logger';

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  // TODO some ideas of what to do here - see video part 18
  // TODO add logging here
  // logger(...params);
  // console.log('args given: ', args);
  // // if user is not logged in
  // if (!context.session || !context.session.userId) {
  //   return null;
  // }
  // TODO throw an error
  // if (!context.session || !context.session.userId) {
  //   throw new Error('no cookie');
  // }
  // TODO check roles
  // check if a user is an admin
  // const user = User.findOne({where: {id: context.session.userId}});
  // if(!user || !user.isAdmin...)
  // middleware
  const result = await resolver(parent, args, context, info);
  // afterware
  // console.log('result: ', result);
  return result;
};
