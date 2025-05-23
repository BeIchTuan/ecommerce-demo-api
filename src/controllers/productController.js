const productService = require('../services/productService');

async function getProductsByCategory(req, res, next) {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const result = await productService.getProductsByCategory(req.app.get('db'), categoryId, page, limit);
    res.json(result);
  } catch (err) {
    if (err.message === 'Category not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function searchProducts(req, res, next) {
  const { q, categoryId, storeId, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  try {
    const result = await productService.searchProducts(req.app.get('db'), {
      q,
      categoryId,
      storeId,
      minPrice,
      maxPrice,
      page,
      limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProductsByCategory,
  searchProducts,
};