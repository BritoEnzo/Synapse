"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Instância padrão do PrismaClient (lê a configuração do prisma.config.ts)
const prisma = new client_1.PrismaClient();
class UserService {
    async register(email, name, password) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return { user: { id: user.id, email: user.email, name: user.name }, token };
    }
    async login(email, password) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return { user: { id: user.id, email: user.email, name: user.name }, token };
    }
}
exports.UserService = UserService;
