"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userService_1 = require("../services/userService");
const userService = new userService_1.UserService();
class AuthController {
    async register(req, res) {
        try {
            const { email, name, password } = req.body;
            const result = await userService.register(email, name, password);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.login(email, password);
            res.json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
