const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

async function login(db, { email, password }) {
    const result = await db.query('SELECT id, email, name, role, password FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
        throw new Error('User not found');
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN, {
        expiresIn: '1h',
    });

    return {
        status: "success",
        token, 
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
}

async function register(db, { name, email, phone, gender, role, password }) {
    if (!(['customer'].includes(role) || ['seller'].includes(role))) {
        throw new Error('Invalid role: only customer or seller registration is allowed');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await db.query(
            'INSERT INTO users (name, email, phone, gender, role, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, gender, role, created_at',
            [name, email, phone, gender, role, hashedPassword]
        );
        return result.rows[0];
    } catch (err) {
        if (err.code === '23505') {
            throw new Error('Email already exists');
        }
        throw err;
    }
}

module.exports = {
    login,
    register,
};