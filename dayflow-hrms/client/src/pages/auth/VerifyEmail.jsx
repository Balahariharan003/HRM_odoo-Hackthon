import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('Verifying your email address...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing from URL.');
      return;
    }

    const handleVerification = async () => {
      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(res.message || 'Invalid or expired verification token.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    handleVerification();
  }, [token]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/signin');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-10 px-6 shadow-2xl rounded-2xl text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto" />
              <h2 className="text-xl font-bold text-white">Verifying Email</h2>
              <p className="text-slate-400 text-sm">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
              <p className="text-slate-300 text-sm">{message}</p>
              <p className="text-xs text-indigo-400 font-medium">
                Redirecting to Sign In in {countdown} seconds...
              </p>
              <div className="pt-2">
                <Link
                  to="/signin"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Sign In Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-5">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="text-slate-300 text-sm">{message}</p>
              <div className="pt-2">
                <Link
                  to="/signin"
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
