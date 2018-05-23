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
const yup = require("yup");
const User_1 = require("../../entity/User");
const formatYupError_1 = require("../../utils/formatYupError");
const errorMessages_1 = require("./errorMessages");
const yupSchemas_1 = require("../../yupSchemas");
const schema = yup.object().shape({
    email: yup
        .string()
        .min(3, errorMessages_1.emailNotLongEnough)
        .max(255)
        .email(errorMessages_1.invalidEmail),
    password: yupSchemas_1.registerPasswordValidation
});
exports.resolvers = {
    Query: {
        bye: () => 'bye'
    },
    Mutation: {
        register: (_, args) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield schema.validate(args, { abortEarly: false });
            }
            catch (err) {
                return formatYupError_1.formatYupError(err);
            }
            const { email, password } = args;
            const userAlreadyExists = yield User_1.User.findOne({
                where: { email },
                select: ['id']
            });
            if (userAlreadyExists) {
                return [
                    {
                        path: 'email',
                        message: errorMessages_1.duplicateEmail
                    }
                ];
            }
            const user = User_1.User.create({
                email,
                password
            });
            yield user.save();
            return null;
        })
    }
};
//# sourceMappingURL=resolvers.js.map