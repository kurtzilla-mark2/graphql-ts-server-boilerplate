"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const graphql_yoga_1 = require("graphql-yoga");
const session = require("express-session");
const connectRedis = require("connect-redis");
const RateLimit = require("express-rate-limit");
const RateLimitRedisStore = require("rate-limit-redis");
const passport = require("passport");
const passport_twitter_1 = require("passport-twitter");
const redis_1 = require("./redis");
const createTypeormConn_1 = require("./utils/createTypeormConn");
const confirmEmail_1 = require("./routes/confirmEmail");
const genSchema_1 = require("./utils/genSchema");
const constants_1 = require("./_lookups/constants");
const User_1 = require("./entity/User");
const RedisStore = connectRedis(session);
exports.startServer = () => __awaiter(this, void 0, void 0, function* () {
    const server = new graphql_yoga_1.GraphQLServer({
        schema: genSchema_1.genSchema(),
        context: ({ request }) => ({
            redis: redis_1.redis,
            url: request.protocol + '://' + request.get('host'),
            session: request.session,
            req: request
        })
    });
    server.express.use(new RateLimit({
        store: new RateLimitRedisStore({
            client: redis_1.redis
        }),
        windowMs: 1000 * 60 * 15,
        max: 100,
        delayMs: 0
    }));
    server.express.use(session({
        store: new RedisStore({
            client: redis_1.redis,
            prefix: constants_1.redisSessionPrefix
        }),
        name: 'qid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));
    const cors = {
        credentials: true,
        origin: process.env.NODE_ENV === 'test'
            ? '*'
            : process.env.FRONTEND_HOST
    };
    server.express.get('/confirm/:id', confirmEmail_1.confirmEmail);
    const connection = yield createTypeormConn_1.createTypeormConn();
    passport.use(new passport_twitter_1.Strategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: 'http://localhost:4000/auth/twitter/callback',
        includeEmail: true
    }, (_, __, profile, cb) => __awaiter(this, void 0, void 0, function* () {
        const { id, emails } = profile;
        const query = connection
            .getRepository(User_1.User)
            .createQueryBuilder('user')
            .where('user.twitterId = :id', { id });
        let email = null;
        if (emails) {
            email = emails[0].value;
            query.orWhere('user.email = :email', { email });
        }
        let user = yield query.getOne();
        if (!user) {
            user = yield User_1.User.create({
                twitterId: id,
                email
            }).save();
        }
        else if (!user.twitterId) {
            user.twitterId = id;
            yield user.save();
        }
        else {
        }
        return cb(null, { id: user.id });
    })));
    server.express.use(passport.initialize());
    server.express.get('/auth/twitter', passport.authenticate('twitter'));
    server.express.get('/auth/twitter/callback', passport.authenticate('twitter', { session: false }), (req, res) => {
        req.session.userId = req.user.id;
        res.redirect('/');
    });
    const app = yield server.start({
        cors,
        port: process.env.NODE_ENV === 'test' ? 0 : 4000
    });
    console.log('Server is running on localhost:4000');
    return app;
});
//# sourceMappingURL=startServer.js.map