"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const aiController = new aiController_1.AIController();
router.post('/analyze', auth_1.authMiddleware, (req, res) => aiController.analyzeNote(req, res));
exports.default = router;
