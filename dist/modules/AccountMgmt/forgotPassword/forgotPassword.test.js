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
const Redis = require("ioredis");
const User_1 = require("../../../entity/User");
const createTypeormConn_1 = require("../../../utils/createTypeormConn");
const TestClient_1 = require("../../../utils/TestClient");
const createForgotPasswordLink_1 = require("../../../utils/createForgotPasswordLink");
const forgotPasswordLockAccount_1 = require("../../../utils/forgotPasswordLockAccount");
const errorMessages_1 = require("../register/errorMessages");
const errorMessages_2 = require("./errorMessages");
const errorMessages_3 = require("../login/errorMessages");
let conn;
const redis = new Redis();
const email = 'bob5@bob.com';
const password = 'jhg8765HH';
const newPassword = 'joeSjipHarry1';
let userId;
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    conn = yield createTypeormConn_1.createTypeormConn();
    const user = yield User_1.User.create({
        email,
        password,
        confirmed: true
    }).save();
    userId = user.id;
}));
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    conn.close();
}));
describe('forgot password', () => {
    test('make sure it works', () => __awaiter(this, void 0, void 0, function* () {
        const client = new TestClient_1.TestClient(process.env.TEST_HOST);
        yield forgotPasswordLockAccount_1.forgotPasswordLockAccount(userId, redis);
        const url = yield createForgotPasswordLink_1.createForgotPasswordLink('', userId, redis);
        const parts = url.split('/');
        const key = parts[parts.length - 1];
        expect(yield client.login(email, password)).toEqual({
            data: {
                login: [
                    {
                        path: 'email',
                        message: errorMessages_3.forgotPasswordLockedError
                    }
                ]
            }
        });
        expect(yield client.forgotPasswordChange('a', key)).toEqual({
            data: {
                forgotPasswordChange: [
                    {
                        path: 'newPassword',
                        message: errorMessages_1.passwordNotLongEnough
                    }
                ]
            }
        });
        const response = yield client.forgotPasswordChange(newPassword, key);
        expect(response.data).toEqual({
            forgotPasswordChange: null
        });
        expect(yield client.forgotPasswordChange('adskflskjhflkjhsldfkjh', key)).toEqual({
            data: {
                forgotPasswordChange: [
                    {
                        path: 'key',
                        message: errorMessages_2.expiredKeyError
                    }
                ]
            }
        });
        expect(yield client.login(email, newPassword)).toEqual({
            data: {
                login: null
            }
        });
    }));
});
//# sourceMappingURL=forgotPassword.test.js.map