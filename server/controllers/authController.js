const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Profile } = require('../models');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/sendEmail');

// Helper to validate password: min 8 chars, 1 uppercase, 1 number, 1 special char
const isPasswordStrong = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.register = async (req, res, next) => {
  try {
    const { employeeId, email, password, role, firstName, lastName, phone, department, designation } = req.body;

    // Validation checks
    if (!employeeId || !employeeId.trim()) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!password || !isPasswordStrong(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 special character.',
      });
    }

    // Check duplicate employeeId
    const existingEmployee = await User.findOne({ where: { employeeId } });
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: 'Employee ID already in use.' });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email address already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create User
    const user = await User.create({
      employeeId,
      email,
      password: hashedPassword,
      role: role && ['Employee', 'Admin', 'HR_Officer'].includes(role) ? role : 'Employee',
      isVerified: false,
      verificationToken,
    });

    // Create associated empty profile
    await Profile.create({
      userId: user.id,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      department: department || '',
      designation: designation || '',
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const profile = await Profile.findOne({ where: { userId: user.id } });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [
        {
          model: Profile,
          as: 'profile',
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
