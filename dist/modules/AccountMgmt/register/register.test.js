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
const User_1 = require("../../../entity/User");
const errorMessages_1 = require("./errorMessages");
const createTypeormConn_1 = require("../../../utils/createTypeormConn");
const testClient_1 = require("../../../testSetup/testClient");
const email = 'tom@bob.com';
const password = 'jalksdf';
let conn;
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    conn = yield createTypeormConn_1.createTypeormConn();
}));
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    conn.close();
}));
describe('Register user', () => __awaiter(this, void 0, void 0, function* () {
    it('make sure we can register a user', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        const response = yield client.register(email, password);
        expect(response.data).toEqual({ register: null });
        const users = yield User_1.User.find({ where: { email } });
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
    }));
    it('test for dupe emails', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        const response2 = yield client.register(email, password);
        expect(response2.data.register).toHaveLength(1);
        expect(response2.data.register[0]).toEqual({
            path: 'email',
            message: errorMessages_1.duplicateEmail
        });
    }));
    it('catch bad email', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        const response3 = yield client.register('ad', password);
        expect(response3.data).toEqual({
            register: [
                {
                    path: 'email',
                    message: errorMessages_1.emailNotLongEnough
                },
                {
                    path: 'email',
                    message: errorMessages_1.invalidEmail
                }
            ]
        });
    }));
    it('catch bad password', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        const response4 = yield client.register(email, 'b');
        expect(response4.data).toEqual({
            register: [
                {
                    path: 'password',
                    message: errorMessages_1.passwordNotLongEnough
                }
            ]
        });
    }));
    it('catch bad email and password', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        const response5 = yield client.register('b', 'b');
        expect(response5.data).toEqual({
            register: [
                {
                    path: 'email',
                    message: errorMessages_1.emailNotLongEnough
                },
                {
                    path: 'email',
                    message: errorMessages_1.invalidEmail
                },
                {
                    path: 'password',
                    message: errorMessages_1.passwordNotLongEnough
                }
            ]
        });
    }));
}));
//# sourceMappingURL=register.test.js.map