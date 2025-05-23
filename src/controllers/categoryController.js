const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res, next) => {
    try {
        const pool = req.app.get('db');
        if (!pool) {
            throw new Error('Database connection not available');
        }
        const categories = await categoryService.getAllCategories(pool);
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories
};