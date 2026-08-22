import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';
import {
  User,
  Camera,
  Briefcase,
  DollarSign,
  FileText,
  Save,
  X,
  Upload,
  Trash2,
  ArrowLeft,
  Lock,
  Loader2,
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ProfileEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, role: currentRole } = useAuth();

  const isAdminOrHR = currentRole === 'Admin' || currentRole === 'HR_Officer';
  const isEditingOther = Boolean(userId);

  // ─── State ──────────────────────────────────
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    department: '',
    designation: '',
    joinDate: '',
    basic: '',
    hra: '',
    allowances: '',
    deductions: '',
  });

  // File state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [documents, setDocuments] = useState([]);
  const [newDocFiles, setNewDocFiles] = useState([]);
  const [removedDocNames, setRemovedDocNames] = useState([]);

  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);

  // ─── Derived stats ──────────────────────────
  const netSalary =
    (Number(form.basic) || 0) +
    (Number(form.hra) || 0) +
    (Number(form.allowances) || 0) -
    (Number(form.deductions) || 0);

  // ─── On mount: load profile ─────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = isEditingOther && isAdminOrHR
          ? await profileService.getUserProfile(userId)
          : await profileService.getMyProfile();

        if (res.success) {
          const p = res.profile || res.user?.profile;
          const u = res.user;
          setProfileUser(u);
          setCurrentAvatar(p?.profilePicture || '');
          setDocuments(Array.isArray(p?.documents) ? p.documents : []);
          setForm({
            firstName: p?.firstName || '',
            lastName: p?.lastName || '',
            phone: p?.phone || '',
            address: p?.address || '',
            department: p?.department || '',
            designation: p?.designation || '',
            joinDate: p?.joinDate || '',
            basic: p?.salaryStructure?.basic || '',
            hra: p?.salaryStructure?.hra || '',
            allowances: p?.salaryStructure?.allowances || '',
            deductions: p?.salaryStructure?.deductions || '',
          });
        }
      } catch (err) {
        toast.error('Failed to load profile');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isEditingOther, isAdminOrHR]);

  // ─── Field change ────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ─── Avatar selection ────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return toast.error('Please select an image file');
    }
    if (file.size > MAX_FILE_SIZE) {
      return toast.error('Profile picture must be under 5MB');
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ─── Document selection ──────────────────────
  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    const valid = [];
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        toast.error(`"${f.name}" is not a supported type (PDF, JPG, PNG)`);
      } else if (f.size > MAX_FILE_SIZE) {
        toast.error(`"${f.name}" exceeds the 5MB limit`);
      } else {
        valid.push(f);
      }
    }
    setNewDocFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeNewDoc = (index) => {
    setNewDocFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (docName) => {
    setDocuments((prev) => prev.filter((d) => d.name !== docName));
    setRemovedDocNames((prev) => [...prev, docName]);
  };

  // ─── Submit ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const fd = new FormData();
      fd.append('phone', form.phone);
      fd.append('address', form.address);

      if (isAdminOrHR) {
        fd.append('firstName', form.firstName);
        fd.append('lastName', form.lastName);
        fd.append('department', form.department);
        fd.append('designation', form.designation);
        fd.append('joinDate', form.joinDate);
        fd.append('basic', form.basic);
        fd.append('hra', form.hra);
        fd.append('allowances', form.allowances);
        fd.append('deductions', form.deductions);
      }

      if (avatarFile) {
        fd.append('profilePicture', avatarFile);
      }

      for (const f of newDocFiles) {
        fd.append('documents', f);
      }

      for (const name of removedDocNames) {
        fd.append('removedDocuments', name);
      }

      const res = isEditingOther && isAdminOrHR
        ? await profileService.updateUserProfile(userId, fd)
        : await profileService.updateMyProfile(fd);

      if (res.success) {
        toast.success('Profile updated successfully!');
        navigate(isEditingOther ? `/profile/${userId}` : '/profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ─── Skeleton ───────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80"></div>
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80"></div>
        </div>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────
  const getInitials = () => {
    if (form.firstName && form.lastName) return `${form.firstName[0]}${form.lastName[0]}`.toUpperCase();
    if (form.firstName) return form.firstName[0].toUpperCase();
    return profileUser?.employeeId?.slice(0, 2).toUpperCase() || 'U';
  };

  const inputCls = (disabled) =>
    `w-full px-4 py-2.5 rounded-xl text-sm border transition-colors focus:outline-none ${
      disabled
        ? 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed'
        : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 placeholder-slate-600'
    }`;

  const labelCls = 'block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(isEditingOther ? `/profile/${userId}` : '/profile')}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(isEditingOther ? `/profile/${userId}` : '/profile')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center space-y-6 h-fit">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {avatarPreview || currentAvatar ? (
                  <img
                    src={avatarPreview || `http://localhost:5000${currentAvatar}`}
                    alt="Profile preview"
                    className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-slate-800 border-4 border-blue-500 flex items-center justify-center text-blue-400 font-extrabold text-4xl shadow-xl">
                    {getInitials()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center border-2 border-slate-900 shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-slate-500 text-center">Click the camera icon to change<br />your profile picture (max 5MB)</p>
            </div>

            {/* Employee Info */}
            <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between px-2 py-1.5">
                <span className="text-slate-500">Employee ID</span>
                <span className="font-mono font-bold text-blue-400">{profileUser?.employeeId}</span>
              </div>
              <div className="flex justify-between px-2 py-1.5">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-300 text-right max-w-[160px] truncate">{profileUser?.email}</span>
              </div>
              <div className="flex justify-between px-2 py-1.5">
                <span className="text-slate-500">Role</span>
                <span className="text-purple-400 font-semibold">{profileUser?.role}</span>
              </div>
            </div>

            {!isAdminOrHR && (
              <div className="w-full flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <p>Some fields are locked. Contact Admin to update.</p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Personal Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Personal Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    First Name {!isAdminOrHR && <Lock className="w-3 h-3 inline ml-1 text-slate-600" />}
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={!isAdminOrHR}
                    className={inputCls(!isAdminOrHR)}
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Last Name {!isAdminOrHR && <Lock className="w-3 h-3 inline ml-1 text-slate-600" />}
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={!isAdminOrHR}
                    className={inputCls(!isAdminOrHR)}
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputCls(false)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Residential Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputCls(false)} resize-none`}
                    placeholder="123 Street, City, State"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Job Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Job Details</h3>
                {!isAdminOrHR && (
                  <span className="text-xs text-slate-500 flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Read-only for Employees
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    disabled={!isAdminOrHR}
                    className={inputCls(!isAdminOrHR)}
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div>
                  <label className={labelCls}>Designation</label>
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    disabled={!isAdminOrHR}
                    className={inputCls(!isAdminOrHR)}
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                <div>
                  <label className={labelCls}>Date of Joining</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={form.joinDate}
                    onChange={handleChange}
                    disabled={!isAdminOrHR}
                    className={inputCls(!isAdminOrHR)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Salary Structure (Admin/HR only) */}
            {isAdminOrHR && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Salary Structure</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Basic Pay ($)</label>
                    <input
                      type="number"
                      name="basic"
                      value={form.basic}
                      onChange={handleChange}
                      min="0"
                      className={inputCls(false)}
                      placeholder="e.g. 30000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>HRA ($)</label>
                    <input
                      type="number"
                      name="hra"
                      value={form.hra}
                      onChange={handleChange}
                      min="0"
                      className={inputCls(false)}
                      placeholder="e.g. 12000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Other Allowances ($)</label>
                    <input
                      type="number"
                      name="allowances"
                      value={form.allowances}
                      onChange={handleChange}
                      min="0"
                      className={inputCls(false)}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Deductions ($)</label>
                    <input
                      type="number"
                      name="deductions"
                      value={form.deductions}
                      onChange={handleChange}
                      min="0"
                      className={inputCls(false)}
                      placeholder="e.g. 3000"
                    />
                  </div>
                </div>

                {/* Auto-calculated Net Salary */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Net Monthly Salary (Auto-Calculated)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Basic + HRA + Allowances − Deductions</p>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ${netSalary.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Documents */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Documents</h3>
                </div>
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleDocChange}
                />
              </div>

              {/* Existing documents */}
              {documents.length === 0 && newDocFiles.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Existing'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingDoc(doc.name)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* New documents queued for upload */}
                  {newDocFiles.map((file, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-xs font-semibold text-white">{file.name}</p>
                          <p className="text-[10px] text-emerald-500">
                            New — {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewDoc(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-slate-600">
                Accepted: PDF, JPG, PNG • Max 5MB per file
              </p>
            </div>

            {/* Bottom Action Row */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(isEditingOther ? `/profile/${userId}` : '/profile')}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileEdit;
