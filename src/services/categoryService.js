async function getAllCategories(pool) {
  try {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }
}

module.exports = {
  getAllCategories,
};