import { Resolver, GraphQLMiddlewareFunc } from '../types/graphql-utils';
//
//
// returns a regular resolver - aka middlewareFunc - that returns middleware
export const createMiddleware = (
  middlewareFunc: GraphQLMiddlewareFunc,
  resolverFunc: Resolver
) => (parent: any, args: any, context: any, info: any) =>
  middlewareFunc(resolverFunc, parent, args, context, info);
