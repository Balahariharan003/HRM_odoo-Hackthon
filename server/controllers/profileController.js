const path = require('path');
const { User, Profile } = require('../models');

// ─────────────────────────────────────────────
// GET /api/profile/me
// ─────────────────────────────────────────────
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [{ model: Profile, as: 'profile' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user, profile: user.profile });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/profile/:userId  (Admin/HR)
// ─────────────────────────────────────────────
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [{ model: Profile, as: 'profile' }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, user, profile: user.profile });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Helper: build update payload based on role
// ─────────────────────────────────────────────
const buildProfilePayload = (body, files, role) => {
  const isAdminOrHR = role === 'Admin' || role === 'HR_Officer';

  // All roles can update these
  const payload = {
    phone: body.phone ?? undefined,
    address: body.address ?? undefined,
  };

  // Profile picture file
  if (files?.profilePicture?.[0]) {
    payload.profilePicture = `/uploads/profile-pictures/${files.profilePicture[0].filename}`;
  }

  // Admin/HR can also update these
  if (isAdminOrHR) {
    if (body.firstName !== undefined) payload.firstName = body.firstName;
    if (body.lastName !== undefined) payload.lastName = body.lastName;
    if (body.department !== undefined) payload.department = body.department;
    if (body.designation !== undefined) payload.designation = body.designation;
    if (body.joinDate !== undefined) payload.joinDate = body.joinDate;

    // Salary structure
    if (body.basic !== undefined) {
      const basic = Number(body.basic) || 0;
      const hra = Number(body.hra) || 0;
      const allowances = Number(body.allowances) || 0;
      const deductions = Number(body.deductions) || 0;
      payload.salaryStructure = {
        basic,
        hra,
        allowances,
        deductions,
        netSalary: basic + hra + allowances - deductions,
      };
    }
  }

  return payload;
};

// ─────────────────────────────────────────────
// Helper: merge new documents into existing list
// ─────────────────────────────────────────────
const mergeDocuments = (currentDocuments, newFiles, removedDocNames) => {
  let docs = Array.isArray(currentDocuments) ? [...currentDocuments] : [];

  // Remove documents by name if specified
  if (removedDocNames) {
    const removeList = Array.isArray(removedDocNames) ? removedDocNames : [removedDocNames];
    docs = docs.filter((d) => !removeList.includes(d.name));
  }

  // Add newly uploaded documents
  if (newFiles?.documents?.length) {
    for (const file of newFiles.documents) {
      docs.push({
        name: file.originalname,
        path: `/uploads/documents/${file.filename}`,
        uploadedAt: new Date().toISOString(),
      });
    }
  }

  return docs;
};

// ─────────────────────────────────────────────
// PUT /api/profile/me  — update own profile
// ─────────────────────────────────────────────
exports.updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const payload = buildProfilePayload(req.body, req.files, role);
    const updatedDocs = mergeDocuments(
      profile.documents,
      req.files,
      req.body.removedDocuments
    );
    if (req.files?.documents?.length || req.body.removedDocuments) {
      payload.documents = updatedDocs;
    }

    await profile.update(payload);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [{ model: Profile, as: 'profile' }],
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      profile: updatedUser.profile,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/profile/:userId  — Admin/HR update any profile
// ─────────────────────────────────────────────
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const role = req.user.role; // Always Admin/HR thanks to route middleware

    const profile = await Profile.findOne({ where: { userId } });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    const payload = buildProfilePayload(req.body, req.files, role);
    const updatedDocs = mergeDocuments(
      profile.documents,
      req.files,
      req.body.removedDocuments
    );
    if (req.files?.documents?.length || req.body.removedDocuments) {
      payload.documents = updatedDocs;
    }

    await profile.update(payload);

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
      include: [{ model: Profile, as: 'profile' }],
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      profile: updatedUser.profile,
    });
  } catch (error) {
    next(error);
  }
};
