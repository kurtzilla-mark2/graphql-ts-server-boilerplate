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
const errorMessages_1 = require("./errorMessages");
const User_1 = require("../../../entity/User");
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
const loginExpectError = (client, e, p, errMsg) => __awaiter(this, void 0, void 0, function* () {
    const response = yield client.login(e, p);
    expect(response.data).toEqual({
        login: [
            {
                path: 'email',
                message: errMsg
            }
        ]
    });
});
describe('login', () => {
    test('email not found send back error', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        yield loginExpectError(client, 'some-email@bob.com', 'bad password', errorMessages_1.invalidLogin);
    }));
    test('email not confirmed', () => __awaiter(this, void 0, void 0, function* () {
        const client = new testClient_1.TestClient(process.env.TEST_HOST);
        yield client.register(email, password);
        yield loginExpectError(client, email, password, errorMessages_1.confirmEmailError);
        yield User_1.User.update({ email }, { confirmed: true });
        yield loginExpectError(client, email, 'aslkdfjaksdljf', errorMessages_1.invalidLogin);
        const response = yield client.login(email, password);
        expect(response.data).toEqual({ login: null });
    }));
});
//# sourceMappingURL=login.test.js.map