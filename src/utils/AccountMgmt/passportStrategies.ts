import * as passport from 'passport';
import { Strategy } from 'passport-twitter';
import { Connection } from 'typeorm';
import { GraphQLServer } from 'graphql-yoga';

import { User } from '../../entity/User';

export const implementPassportStrategies = async (
  connection: Connection,
  server: GraphQLServer
) => {
  if (process.env.PASSPORT_TWITTER === 'true') {
    passport.use(
      new Strategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
          callbackURL: `${process.env.API_HOST}/auth/twitter/callback`,
          includeEmail: true
        },
        async (_, __, profile, cb) => {
          const { id, emails } = profile;

          const query = connection
            .getRepository(User)
            .createQueryBuilder('user')
            .where('user.twitterId = :id', { id });

          let email: string | null = null;

          if (emails) {
            email = emails[0].value;
            query.orWhere('user.email = :email', { email });
          }

          let user = await query.getOne();

          // this user needs to be registered
          if (!user) {
            user = await User.create({
              twitterId: id,
              email
            }).save();
          } else if (!user.twitterId) {
            // merge account
            // we found user by email
            user.twitterId = id;
            await user.save();
          } else {
            // we have a twitterId - nothing to do
            // login
          }

          return cb(null, { id: user.id });
        }
      )
    );
  }

  // init if we are using any strategies
  if (
    process.env.PASSPORT_TWITTER === 'true' ||
    process.env.PASSPORT_FACEBOOK === 'true' ||
    process.env.PASSPORT_GOOGLE === 'true'
  ) {
    server.express.use(passport.initialize());
  }

  if (process.env.PASSPORT_TWITTER === 'true') {
    // this is where user goes to sign in - redirects to twitter
    server.express.get('/auth/twitter', passport.authenticate('twitter'));
    // this is where twitter redirects back to after auth (or failure)
    server.express.get(
      '/auth/twitter/callback',
      passport.authenticate('twitter', { session: false }),
      (req, res) => {
        (req.session as any).userId = (req.user as any).id;
        // @todo redirect to frontend
        res.redirect('/');
      }
    );
  }
};
