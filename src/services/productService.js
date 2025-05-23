async function getProductsByCategory(db, categoryId, page, limit) {
  const offset = (page - 1) * limit;

  // Check if category exists
  const categoryCheck = await db.query('SELECT 1 FROM categories WHERE id = $1', [categoryId]);
  if (categoryCheck.rowCount === 0) {
    throw new Error('Category not found');
  }

  // Fetch products
  const productsQuery = `
    SELECT p.*, json_agg(
      json_build_object(
        'id', pv.id,
        'size', pv.size,
        'color', pv.color,
        'price', pv.price,
        'quantity', pv.quantity
      )
    ) as variants
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.category_id = $1
    GROUP BY p.id
    LIMIT $2 OFFSET $3
  `;
  const countQuery = 'SELECT COUNT(*) FROM products WHERE category_id = $1';

  const [productsResult, countResult] = await Promise.all([
    db.query(productsQuery, [categoryId, limit, offset]),
    db.query(countQuery, [categoryId]),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    products: productsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function searchProducts(db, { q, categoryId, storeId, minPrice, maxPrice, page, limit }) {
  const offset = (page - 1) * limit;
  let whereClauses = [];
  let params = [];
  let paramIndex = 1;

  if (q) {
    whereClauses.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${q}%`);
    paramIndex++;
  }
  if (categoryId) {
    whereClauses.push(`p.category_id = $${paramIndex}`);
    params.push(categoryId);
    paramIndex++;
  }
  if (storeId) {
    whereClauses.push(`p.store_id = $${paramIndex}`);
    params.push(storeId);
    paramIndex++;
  }
  if (minPrice) {
    whereClauses.push(`pv.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }
  if (maxPrice) {
    whereClauses.push(`pv.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
  const productsQuery = `
    SELECT p.*, json_agg(
      json_build_object(
        'id', pv.id,
        'size', pv.size,
        'color', pv.color,
        'price', pv.price,
        'quantity', pv.quantity
      )
    ) as variants
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    ${whereClause}
    GROUP BY p.id
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const countQuery = `
    SELECT COUNT(DISTINCT p.id)
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    ${whereClause}
  `;
  params.push(limit, offset);

  const [productsResult, countResult] = await Promise.all([
    db.query(productsQuery, params),
    db.query(countQuery, params.slice(0, -2)),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    products: productsResult.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  getProductsByCategory,
  searchProducts,
};