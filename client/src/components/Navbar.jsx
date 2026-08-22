import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { Bell, CheckCircle2, DollarSign, Clock, Check, ExternalLink, X, User } from 'lucide-react';

export default function Navbar({ toastMessage, setToastMessage }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const data = await getNotifications({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications in Navbar:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 60 seconds for real-time feel
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto hide toast message after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const handleItemClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif.id);
        fetchNotifs();
      }
      setIsOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }
  };

  const handleMarkAll = async () => {
    try {
      setLoading(true);
      await markAllAsRead();
      await fetchNotifs();
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircle2 size={18} color="#16a34a" />;
      case 'payroll_processed':
        return <DollarSign size={18} color="#2563eb" />;
      case 'attendance_reminder':
        return <Clock size={18} color="#d97706" />;
      default:
        return <Bell size={18} color="#64748b" />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <header style={{ height: '64px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 100 }}>
      
      {/* Search / Title Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
          Dayflow Workspace
        </h3>
      </div>

      {/* Right Controls Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Notification Bell Dropdown Container */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            aria-label="Notifications"
          >
            <Bell size={20} color="#475569" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  padding: '2px 6px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 0 0 2px #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '360px',
                maxWidth: '90vw',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', background: '#dbeafe', color: '#1e40af', fontWeight: 700 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    disabled={loading}
                    style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items List */}
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleItemClick(n)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        background: n.isRead ? '#ffffff' : '#f0f9ff',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>{getNotifIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: n.isRead ? 600 : 800, color: n.isRead ? '#334155' : '#0f172a' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{formatTimeAgo(n.createdAt)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b', lineHeight: '1.4' }}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  View all notifications <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            JS
          </div>
        </div>

      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <CheckCircle2 size={20} color="#4ade80" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </header>
  );
}
