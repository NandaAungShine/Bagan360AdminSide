import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function HotAirBalloonsOrder() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ===== TOAST & CONFIRM =====
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

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // ===== SAMPLE DATA (no API) =====
  const sampleBookings = [
    {
      id: 1,
      balloon_id: 1,
      balloon_name: 'Air Balloon #1',
      pilot_name: 'U Aung Myint',
      capacity: 12,
      color: 'Red',
      customer_name: 'John Smith',
      customer_phone: '+95 9 111 222 333',
      booking_date: '2024-03-20',
      status: 'pending',
      note: 'Wants sunrise flight',
      image: null,
      passenger: 2,
      selected_price: 760000,
    },
    {
      id: 2,
      balloon_id: 1,
      balloon_name: 'Air Balloon #1',
      pilot_name: 'U Aung Myint',
      capacity: 12,
      color: 'Red',
      customer_name: 'Mary Johnson',
      customer_phone: '+95 9 222 333 444',
      booking_date: '2024-03-21',
      status: 'approved',
      note: 'Vegetarian breakfast',
      image: null,
      passenger: 4,
      selected_price: 1520000,
    },
    {
      id: 3,
      balloon_id: 2,
      balloon_name: 'Air Balloon #2',
      pilot_name: 'U Kyaw Zin',
      capacity: 10,
      color: 'Blue',
      customer_name: 'David Lee',
      customer_phone: '+95 9 333 444 555',
      booking_date: '2024-03-22',
      status: 'pending',
      note: '',
      image: null,
      passenger: 1,
      selected_price: 380000,
    },
    {
      id: 4,
      balloon_id: 3,
      balloon_name: 'Air Balloon #3',
      pilot_name: 'U Thein Win',
      capacity: 8,
      color: 'Gold',
      customer_name: 'Sarah Brown',
      customer_phone: '+95 9 444 555 666',
      booking_date: '2024-03-23',
      status: 'cancelled',
      note: 'Weather concerns',
      image: null,
      passenger: 2,
      selected_price: 720000,
    },
    {
      id: 5,
      balloon_id: 2,
      balloon_name: 'Air Balloon #2',
      pilot_name: 'U Kyaw Zin',
      capacity: 10,
      color: 'Blue',
      customer_name: 'Michael Chen',
      customer_phone: '+95 9 555 666 777',
      booking_date: '2024-03-24',
      status: 'approved',
      note: 'Anniversary celebration',
      image: null,
      passenger: 2,
      selected_price: 760000,
    },
    {
      id: 6,
      balloon_id: 4,
      balloon_name: 'Air Balloon #4',
      pilot_name: 'U Zaw Min',
      capacity: 14,
      color: 'Green',
      customer_name: 'Emma Wilson',
      customer_phone: '+95 9 666 777 888',
      booking_date: '2024-03-25',
      status: 'pending',
      note: '',
      image: null,
      passenger: 3,
      selected_price: 1140000,
    },
  ];

  // ===== LOAD & SAVE (localStorage) =====
  useEffect(() => {
    const stored = localStorage.getItem('hotAirBalloonsOrdersData');
    if (stored) {
      try { setBookings(JSON.parse(stored)); }
      catch { setBookings(sampleBookings); }
    } else {
      setBookings(sampleBookings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('hotAirBalloonsOrdersData', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ===== UPDATE STATUS (local only) =====
  const updateBookingStatus = (bookingId, newStatus) => {
    setLoading(true);
    try {
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      showToast('success', `Booking ${newStatus} successfully!`);
    } catch (err) {
      showToast('error', 'Failed to update booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (bookingId, newStatus) => {
    const actionText = newStatus === 'approved' ? 'approve' : 'cancel';
    setConfirmDialog({
      visible: true,
      message: `Are you sure you want to ${actionText} this booking?`,
      onConfirm: () => updateBookingStatus(bookingId, newStatus),
    });
  };

  // ===== FILTER =====
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      (b.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.balloon_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer_phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.pilot_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // ===== SUMMARY STATS (5 boxes) =====
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
  const uniqueBalloons = new Set(bookings.map(b => b.balloon_id)).size;

  const summaryData = [
    { label: 'Total Booking', count: totalBookings, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: pendingCount, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: approvedCount, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: cancelledCount, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Air Balloons', count: uniqueBalloons, icon: 'bi-circle', color: '#6f42c1' },
  ];

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

  // ===== CARD ACTIONS =====
  const CardActions = ({ booking }) => {
    const [isOpen, setIsOpen] = useState(false);

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

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleViewDetails}>
            <i className="bi bi-eye"></i> View Details
          </button>
          <button className="edit-btn" onClick={handleApprove}>
            <i className="bi bi-check-circle"></i> Approve
          </button>
          <button className="delete-btn" onClick={handleCancel}>
            <i className="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </div>
    );
  };

  // ===== DETAIL MODAL =====
  const DetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Booking Details #{booking.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Balloon:</strong> {booking.balloon_name}</div>
              <div><strong>Pilot:</strong> {booking.pilot_name}</div>
              <div><strong>Capacity:</strong> {booking.capacity} persons</div>
              <div><strong>Color:</strong> {booking.color}</div>
              <div><strong>Customer:</strong> {booking.customer_name}</div>
              <div><strong>Phone:</strong> {booking.customer_phone}</div>
              <div><strong>Passengers:</strong> {booking.passenger}</div>
              <div><strong>Total Price:</strong> MMK {booking.selected_price}</div>
              <div><strong>Status:</strong> {getStatusBadge(booking.status)}</div>
              <div><strong>Booking Date:</strong> {booking.booking_date}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Note:</strong> {booking.note || 'None'}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="discard-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== BOOKING CARD =====
  const BookingCard = ({ booking }) => (
    <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
      <div className="hotel-card-image" style={{ height: '200px' }}>
        <div className="image-slider">
          {booking.image ? (
            <img
              src={booking.image}
              alt={booking.balloon_name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#d97757 0%,#8a4a2a 100%);color:white">🎈</div>`;
                }
              }}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ fontSize: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #d97757 0%, #8a4a2a 100%)', color: 'white' }}>🎈</div>
          )}
        </div>
        <CardActions booking={booking} />
      </div>
      <div className="hotel-card-info">
        <h3 className="hotel-name">{booking.balloon_name}</h3>
        <p className="hotel-location">
          <i className="bi bi-person"></i> {booking.customer_name} &nbsp;
          <span style={{ fontSize: '12px', color: '#888' }}>
            <i className="bi bi-phone"></i> {booking.customer_phone}
          </span>
        </p>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          <span><i className="bi bi-person-badge"></i> {booking.pilot_name}</span>
          <span style={{ marginLeft: '8px' }}><i className="bi bi-people"></i> {booking.capacity} seats</span>
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

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hot Air Balloon Bookings" onThemeChange={handleThemeChange} />

      {loading && (
        <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>
          ⏳ Processing...
        </div>
      )}

      {/* ==================== TOAST ==================== */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 999999, width: '420px', maxWidth: '90%', borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '0', overflow: 'hidden',
            backgroundColor:
              toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') :
              toast.type === 'error' ? (isDarkMode ? '#3e1f1f' : '#f8d7da') :
              toast.type === 'warning' ? (isDarkMode ? '#3d3512' : '#fff3cd') :
              (isDarkMode ? '#112b3c' : '#d1ecf1'),
            color:
              toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') :
              toast.type === 'error' ? (isDarkMode ? '#ffa39e' : '#721c24') :
              toast.type === 'warning' ? (isDarkMode ? '#ffe58f' : '#856404') :
              (isDarkMode ? '#91d5ff' : '#0c5460'),
            borderLeft: `5px solid ${
              toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') :
              toast.type === 'error' ? (isDarkMode ? '#ff4d4f' : '#dc3545') :
              toast.type === 'warning' ? (isDarkMode ? '#faad14' : '#ffc107') :
              (isDarkMode ? '#1890ff' : '#17a2b8')
            }`,
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button
              onClick={() => {
                if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
                setToast({ ...toast, visible: false });
              }}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
              {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRM DIALOG ==================== */}
      {confirmDialog.visible && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px',
            maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Action</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd',
                  background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333',
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
                  padding: '8px 16px', borderRadius: '6px', border: 'none',
                  background: '#0d6efd', color: '#fff', cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5 SUMMARY BOXES ==================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '15px',
        marginBottom: '20px',
      }}>
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
              boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
              border: isDarkMode ? '1px solid #444' : '1px solid #555',
              transition: 'all 0.3s',
            }}
          >
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              backgroundColor: item.color, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '18px', flexShrink: 0,
            }}>
              <i className={item.icon}></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>{item.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>{item.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== SEARCH + FILTER ==================== */}
      <div className="search-actions-row" style={{ marginBottom: '20px' }}>
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by customer, balloon, pilot..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Status:</label>
          <select
            className="search-input-full"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ==================== CARD GRID ==================== */}
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
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#999',
                }}>
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No bookings found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
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

export default HotAirBalloonsOrder;