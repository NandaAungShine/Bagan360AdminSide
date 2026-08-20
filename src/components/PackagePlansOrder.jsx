// components/PackagePlansOrder.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function PackagePlansOrder() {
  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ===== 3. API CONFIG =====
  const API_BOOKING_BASE = 'http://130.94.21.185:8000/api/admin/package/booking';
  const BACKEND_URL = 'http://130.94.21.185:8000';
  const getToken = () => localStorage.getItem('token');

  // ===== 4. TOAST & CONFIRM =====
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== 5. THEME HANDLER =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ===== 6. FETCH BOOKINGS =====
  const fetchBookings = async () => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', limit);

      const response = await fetch(`${API_BOOKING_BASE}/list?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Package Bookings API Response:', result);

      if (result.success && Array.isArray(result.booking)) {
        const mapped = result.booking.map((item) => ({
          id: item.booking_id || item.id,
          user_id: item.user_id,
          package_id: item.package_id,
          price_id: item.price_id,
          customer_name: item.customer_name || 'N/A',
          customer_phone: item.customer_phone || 'N/A',
          booking_date: item.booking_date || '',
          status: item.status || 'pending',
          note: item.note || '',
          package_title: item.package_title || item.title || 'Package Plan',
          package_description: item.package_description || item.description || '',
          hotels: Array.isArray(item.hotels) ? item.hotels : [],
          restaurants: Array.isArray(item.restaurants) ? item.restaurants : [],
          transports: Array.isArray(item.transports) ? item.transports : [],
          image: item.image ? `${BACKEND_URL}/${item.image.replace(/^\/+/, '')}` : null,
          passenger: item.passenger || 1,
          selected_price: item.selected_price || 0,
        }));
        setBookings(mapped);
        setTotalItems(result.total || mapped.length);
        setTotalPages(result.totalPages || Math.ceil(mapped.length / limit) || 1);
      } else {
        throw new Error(result.message || 'Unexpected response format');
      }
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      showToast('error', 'Failed to fetch bookings: ' + err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== 7. UPDATE STATUS (Approve / Cancel) =====
  const updateBookingStatus = async (bookingId, newStatus) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        newStatus === 'approved'
          ? `${API_BOOKING_BASE}/approved/${bookingId}`
          : `${API_BOOKING_BASE}/cancelled/${bookingId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      if (result.success) {
        showToast('success', `Booking ${newStatus} successfully!`);
        await fetchBookings();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error('❌ Update Error:', err);
      showToast('error', 'Failed to update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== 8. CONFIRM DIALOG TRIGGER =====
  const handleStatusChange = (bookingId, newStatus) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'cancel';
    setConfirmDialog({
      visible: true,
      message: `Are you sure you want to ${actionText} this booking?`,
      onConfirm: () => updateBookingStatus(bookingId, newStatus),
    });
  };

  // ===== 9. SEARCH / FILTER / PAGINATION =====
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, page]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterStatus = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  // ===== 10. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#0d6efd', bg: '#cfe2ff' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status, color: '#6c757d', bg: '#e9ecef' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: s.color,
          backgroundColor: s.bg,
        }}
      >
        {s.label}
      </span>
    );
  };

  // ===== 11. CARD ACTIONS (Dropdown) =====
  const CardActions = ({ booking }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleViewDetails = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      setSelectedBooking(booking);
      setShowDetailModal(true);
    };

    const handleApprove = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      if (booking.status === 'pending') {
        handleStatusChange(booking.id, 'approved');
      } else {
        showToast('warning', 'Only pending bookings can be approved.');
      }
    };

    const handleCancel = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      if (booking.status === 'pending') {
        handleStatusChange(booking.id, 'cancelled');
      } else {
        showToast('warning', 'Only pending bookings can be cancelled.');
      }
    };

    // Dynamic positioning: if not enough space below, show above
    useEffect(() => {
      if (isOpen && dropdownRef.current && wrapperRef.current) {
        const dropdown = dropdownRef.current;
        const wrapper = wrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        const dropdownHeight = dropdown.scrollHeight || 160;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.transform = '';

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          dropdown.style.bottom = 'calc(100% + 8px)';
          dropdown.style.top = 'auto';
          dropdown.style.transform = 'translateY(0)';
        } else {
          dropdown.style.top = 'calc(100% + 8px)';
          dropdown.style.bottom = 'auto';
          dropdown.style.transform = 'translateY(0)';
        }
      }
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
      <div
        ref={wrapperRef}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 100,
        }}
      >
        <button
          onClick={handleToggle}
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s',
            backdropFilter: 'blur(4px)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>

        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            right: '0',
            minWidth: '180px',
            background: isDarkMode ? '#2d2d2d' : '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            padding: '6px 0',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            transform: isOpen ? 'scale(1)' : 'scale(0.95)',
            border: isDarkMode ? '1px solid #444' : '1px solid #e8e8e8',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={handleViewDetails}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              color: isDarkMode ? '#e0e0e0' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.15s',
              borderRadius: '0',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#3d3d3d' : '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <i className="bi bi-eye" style={{ fontSize: '16px', color: '#0d6efd' }}></i>
            View Details
          </button>

          {booking.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: isDarkMode ? '#6fcf97' : '#198754',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background 0.15s',
                  borderRadius: '0',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#3d3d3d' : '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <i className="bi bi-check-circle" style={{ fontSize: '16px' }}></i>
                Approve
              </button>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 18px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background 0.15s',
                  borderRadius: '0',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#3d3d3d' : '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <i className="bi bi-x-circle" style={{ fontSize: '16px' }}></i>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ===== 12. DETAIL MODAL =====
  const DetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Package Booking #{booking.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Package:</strong> {booking.package_title}</div>
              <div><strong>Customer:</strong> {booking.customer_name}</div>
              <div><strong>Phone:</strong> {booking.customer_phone}</div>
              <div><strong>Passengers:</strong> {booking.passenger}</div>
              <div><strong>Total Price:</strong> MMK {booking.selected_price}</div>
              <div><strong>Status:</strong> {getStatusBadge(booking.status)}</div>
              <div><strong>Booking Date:</strong> {booking.booking_date}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Description:</strong><br />
                <span style={{ fontSize: '14px' }}>{booking.package_description || 'N/A'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Note:</strong> {booking.note || 'None'}
              </div>

              {/* Hotels */}
              {booking.hotels && booking.hotels.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>🏨 Hotels:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {booking.hotels.map((h, idx) => (
                      <li key={idx}>{h.title || h.name} {h.link && <a href={h.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0d6efd' }}>🔗</a>}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Restaurants */}
              {booking.restaurants && booking.restaurants.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>🍽️ Restaurants:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {booking.restaurants.map((r, idx) => (
                      <li key={idx}>{r.title || r.name} {r.link && <a href={r.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0d6efd' }}>🔗</a>}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transports */}
              {booking.transports && booking.transports.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>🚗 Transports:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {booking.transports.map((t, idx) => (
                      <li key={idx}>{t.title || t.name} {t.link && <a href={t.link} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0d6efd' }}>🔗</a>}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="discard-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 13. ORDER CARD =====
  const BookingCard = ({ booking }) => (
    <div className="hotel-card-vertical" style={{ cursor: 'default', position: 'relative' }}>
      <div className="hotel-card-image" style={{ height: '200px', position: 'relative' }}>
        <div className="image-slider" style={{ height: '100%', overflow: 'hidden' }}>
          {booking.image ? (
            <img
              src={booking.image}
              alt={booking.package_title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#d97757 0%,#8a4a2a 100%);color:white">📦</div>`;
                }
              }}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ fontSize: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #d97757 0%, #8a4a2a 100%)', color: 'white' }}>📦</div>
          )}
        </div>
        <CardActions booking={booking} />
      </div>
      <div className="hotel-card-info">
        <h3 className="hotel-name">{booking.package_title}</h3>
        <p className="hotel-location">
          <i className="bi bi-person"></i> {booking.customer_name} &nbsp;
          <span style={{ fontSize: '12px', color: '#888' }}>
            <i className="bi bi-phone"></i> {booking.customer_phone}
          </span>
        </p>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          <span><i className="bi bi-building"></i> {booking.hotels?.length || 0} hotels</span>
          <span style={{ marginLeft: '8px' }}><i className="bi bi-shop"></i> {booking.restaurants?.length || 0} restaurants</span>
          <span style={{ marginLeft: '8px' }}><i className="bi bi-truck"></i> {booking.transports?.length || 0} transports</span>
        </div>
        <p className="hotel-price">
          Total: <span>MMK {booking.selected_price}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {getStatusBadge(booking.status)}
          <span style={{ fontSize: '12px', color: '#999' }}>
            <i className="bi bi-calendar3"></i> {booking.booking_date || 'N/A'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          <i className="bi bi-people"></i> {booking.passenger} passenger{booking.passenger > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );

  // ===== 14. LOADING =====
  if (loading && bookings.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Package Plan Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  // ===== 15. SUMMARY DATA =====
  const summaryData = [
    { label: 'Total Bookings', count: bookings.length, icon: 'bi-box-seam', color: '#0d6efd' },
    {
      label: 'Pending',
      count: bookings.filter((b) => b.status === 'pending').length,
      icon: 'bi-clock-history',
      color: '#ffc107',
    },
    {
      label: 'Approved',
      count: bookings.filter((b) => b.status === 'approved').length,
      icon: 'bi-check-circle',
      color: '#198754',
    },
    {
      label: 'Cancelled',
      count: bookings.filter((b) => b.status === 'cancelled').length,
      icon: 'bi-x-circle',
      color: '#dc3545',
    },
    { label: 'Packages', count: bookings.length, icon: 'bi-box', color: '#6f42c1' },
  ];

  // ===== 16. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Package Plan Bookings" onThemeChange={handleThemeChange} />

      {/* TOAST */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999999,
            width: '420px',
            maxWidth: '90%',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            padding: '0',
            overflow: 'hidden',
            backgroundColor:
              toast.type === 'success'
                ? isDarkMode
                  ? '#1e3a2e'
                  : '#d4edda'
                : '#f8d7da',
            color:
              toast.type === 'success'
                ? isDarkMode
                  ? '#b7eb8f'
                  : '#155724'
                : '#721c24',
            borderLeft: `5px solid ${
              toast.type === 'success'
                ? isDarkMode
                  ? '#52c41a'
                  : '#28a745'
                : '#dc3545'
            }`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: `1px solid ${
                isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button
              onClick={() => {
                if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
                setToast({ ...toast, visible: false });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : (
                <i className="bi bi-x-circle-fill"></i>
              )}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      {confirmDialog.visible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: isDarkMode ? '#2d2d2d' : '#fff',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>
              Confirm Action
            </h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: isDarkMode ? '#ccc' : '#333',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ ...confirmDialog, visible: false });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0d6efd',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY BOXES (5 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        {summaryData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#2d2d2d',
              padding: '15px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: isDarkMode
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.15)',
              border: isDarkMode ? '1px solid #444' : '1px solid #555',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              <i className={item.icon}></i>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#bbb',
                  fontWeight: '500',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH + FILTER */}
      <div className="search-actions-row" style={{ marginBottom: '20px' }}>
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by customer, package..."
            className="search-input-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Status:</label>
          <select
            className="search-input-full"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={handleFilterStatus}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* BOOKING CARDS (3 per row) */}
      <div className="hotels-two-columns">
        <div className="hotels-cards-column" style={{ gridColumn: '1 / -1' }}>
          <div className="hotels-scroll-area">
            <div
              className="hotels-grid-3cols"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}
            >
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#999',
                  }}
                >
                  <i
                    className="bi bi-inbox"
                    style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}
                  ></i>
                  <p>No package bookings found.</p>
                </div>
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  padding: '10px 0',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    backgroundColor: page === 1 ? '#e9ecef' : 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <i className="bi bi-chevron-left"></i> Prev
                </button>
                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      backgroundColor: page === num + 1 ? '#0d6efd' : 'white',
                      color: page === num + 1 ? 'white' : '#212529',
                      cursor: 'pointer',
                      fontWeight: page === num + 1 ? 'bold' : 'normal',
                    }}
                  >
                    {num + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    backgroundColor: page === totalPages ? '#e9ecef' : 'white',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>
                <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <DetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default PackagePlansOrder;