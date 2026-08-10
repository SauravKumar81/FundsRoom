"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const express_1 = require("express");
const errorHandler = (err, req, res, next) => {
    console.error('[API Error]:', err);
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: {
            code: err.code || 'SERVER_ERROR',
            message: message
        }
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map