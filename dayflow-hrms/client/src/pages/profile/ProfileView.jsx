import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  DollarSign,
  FileText,
  Download,
  Edit3,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, role: currentRole } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isViewingOtherUser = Boolean(userId) && userId !== currentUser?.id;
  const isAdminOrHR = currentRole === 'Admin' || currentRole === 'HR_Officer';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let res;
        if (isViewingOtherUser && isAdminOrHR) {
          res = await profileService.getUserProfile(userId);
        } else {
          res = await profileService.getMyProfile();
        }

        if (res.success) {
          setProfileUser(res.user);
          setProfileData(res.profile || res.user?.profile);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isViewingOtherUser, isAdminOrHR]);

  const getInitials = () => {
    const fn = profileData?.firstName;
    const ln = profileData?.lastName;
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn[0].toUpperCase();
    return profileUser?.employeeId ? profileUser.employeeId.slice(0, 2).toUpperCase() : 'U';
  };

  const fullName = profileData?.firstName || profileData?.lastName
    ? `${profileData?.firstName || ''} ${profileData?.lastName || ''}`.trim()
    : profileUser?.employeeId || 'User Profile';

  // Role Color Coding
  const getRoleBadgeStyle = (roleName) => {
    switch (roleName) {
      case 'Admin':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HR_Officer':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Employee':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const salary = profileData?.salaryStructure || {
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
  };

  const documents = profileData?.documents && Array.isArray(profileData.documents)
    ? profileData.documents
    : [
        { name: 'Government ID Proof', uploadedAt: '2026-01-15' },
        { name: 'Employment Offer Letter', uploadedAt: '2026-01-20' },
      ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-48 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96 flex flex-col items-center justify-center space-y-4">
            <div className="w-36 h-36 rounded-full bg-slate-800"></div>
            <div className="h-6 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96 space-y-6">
            <div className="h-6 bg-slate-800 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-800 rounded"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        {isViewingOtherUser ? (
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        ) : (
          <div className="text-sm font-semibold text-slate-400">My HR Profile</div>
        )}

        <div className="flex items-center space-x-3">
          {(isAdminOrHR || !isViewingOtherUser) && (
            <button
              onClick={() =>
                navigate(isViewingOtherUser ? `/profile/${userId}/edit` : '/profile/edit')
              }
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (1/3 Width) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col items-center text-center space-y-5 h-fit">
          {/* Profile Picture */}
          <div className="relative">
            {profileData?.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt={fullName}
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-slate-800 border-4 border-blue-500 flex items-center justify-center text-blue-400 font-extrabold text-4xl shadow-xl">
                {getInitials()}
              </div>
            )}
            <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
          </div>

          {/* Name & Title */}
          <div>
            <h2 className="text-2xl font-extrabold text-white">{fullName}</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">{profileUser?.email}</p>
          </div>

          {/* Badges Stack */}
          <div className="w-full space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Role:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${getRoleBadgeStyle(profileUser?.role)}`}>
                <Shield className="w-3 h-3 inline mr-1" />
                {profileUser?.role || 'Employee'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Department:</span>
              <span className="font-semibold text-white">
                {profileData?.department || 'Engineering'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Designation:</span>
              <span className="font-semibold text-white">
                {profileData?.designation || 'Software Engineer'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Joined:</span>
              <span className="font-semibold text-slate-300">
                {profileData?.joinDate || 'Jan 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Personal Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Employee ID</p>
                <p className="font-mono font-bold text-blue-400 text-sm mt-0.5">{profileUser?.employeeId}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="font-semibold text-white text-sm mt-0.5">{profileUser?.email}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Phone Number</p>
                <p className="font-semibold text-white text-sm mt-0.5">{profileData?.phone || 'Not specified'}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Residential Address</p>
                <p className="font-semibold text-slate-300 text-sm mt-0.5">{profileData?.address || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Job Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Department</p>
                <p className="font-semibold text-white text-sm mt-0.5">{profileData?.department || 'General'}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Designation</p>
                <p className="font-semibold text-white text-sm mt-0.5">{profileData?.designation || 'Staff'}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">Date of Joining</p>
                <p className="font-semibold text-white text-sm mt-0.5">{profileData?.joinDate || 'Jan 2026'}</p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">System Role</p>
                <p className="font-semibold text-purple-400 text-sm mt-0.5">{profileUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Section 3: Salary Structure */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Salary Structure</h3>
            </div>

            {/* Salary Breakdown Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Component</th>
                    <th className="px-4 py-3 text-right">Amount (Monthly)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                  <tr>
                    <td className="px-4 py-3 text-slate-300">Basic Pay</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      ${salary.basic?.toLocaleString() || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-300">House Rent Allowance (HRA)</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      ${salary.hra?.toLocaleString() || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-300">Other Allowances</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      ${salary.allowances?.toLocaleString() || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-300 text-rose-400">Total Deductions</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-rose-400">
                      -${salary.deductions?.toLocaleString() || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Highlighted Net Salary Box */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Net Monthly Take-Home Salary</p>
                <p className="text-xs text-slate-400">Calculated after standard tax & deductions</p>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                ${salary.netSalary?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Section 4: Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Uploaded Documents</h3>
            </div>

            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{doc.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Uploaded on {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.success(`Downloading ${doc.name}...`)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
