const authService = require('../services/authService');

async function login(req, res, next) {
    const { email, password } = req.body;

    try {
        const result = await authService.login(req.app.get('db'), { email, password });
        if (result.status === "success") {
            res.cookie("accessToken", result.token, {
                httpOnly: true,
                secure: false,
                sameSite: "None",
                maxAge: 86400000, // 24 hour
            });

            return res.status(200).json({
                status: "success",
                message: "Login successful",
                token: result.token,
                user: result.user,
            });
        } else {
            return res.status(401).json({
                status: "error",
                message: result.message,
            });
        }
    } catch (err) {
        if (err.message === 'User not found' || err.message === 'Invalid password') {
            return res.status(401).json({ error: err.message });
        }
        next(err);
    }
}

async function register(req, res, next) {
    const { name, email, phone, gender, role, password } = req.body;

    try {
        const user = await authService.register(req.app.get('db'), {
            name,
            email,
            phone,
            gender,
            role,
            password,
        });
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
                created_at: user.created_at,
            },
        });
    } catch (err) {
        if (err.message === 'Email already exists') {
            return res.status(409).json({ error: err.message });
        } else if (err.message.includes('Invalid role')) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
}

module.exports = {
    login,
    register,
};