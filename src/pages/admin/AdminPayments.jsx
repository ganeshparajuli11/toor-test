import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.service';
import './AdminPayments.css';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    completedAmount: 0,
    demoTransactions: 0,
    realTransactions: 0
  });

  // Fetch payments from backend
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/payments');
      const paymentsData = response.data.data || [];

      // Transform payments data
      const transformedPayments = paymentsData.map(payment => ({
        id: payment.id,
        transactionId: payment.id,
        bookingRef: payment.bookingId,
        customer: payment.customerName || 'Guest',
        email: payment.customerEmail || 'N/A',
        amount: payment.amount || 0,
        currency: payment.currency || 'USD',
        status: payment.status === 'completed' ? 'Succeeded' : payment.status === 'refunded' ? 'Refunded' : 'Pending',
        paymentMethod: payment.isDemo ? 'Demo Card •••• 4242' : 'Stripe Card',
        cardBrand: payment.isDemo ? 'demo' : 'stripe',
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A',
        description: `${payment.type?.charAt(0).toUpperCase()}${payment.type?.slice(1) || 'Hotel'} Booking - ${payment.itemName || 'Booking'}`,
        fee: payment.isDemo ? 0 : (payment.amount * 0.029 + 0.30).toFixed(2), // Stripe fee: 2.9% + $0.30
        net: payment.isDemo ? payment.amount : (payment.amount - (payment.amount * 0.029 + 0.30)).toFixed(2),
        refundable: payment.status === 'completed',
        threeDSecure: !payment.isDemo,
        isDemo: payment.isDemo || false
      }));

      setPayments(transformedPayments);
      setSummary(response.data.summary || {
        totalTransactions: transformedPayments.length,
        totalAmount: transformedPayments.reduce((sum, p) => sum + p.amount, 0),
        completedAmount: transformedPayments.filter(p => p.status === 'Succeeded').reduce((sum, p) => sum + p.amount, 0),
        demoTransactions: transformedPayments.filter(p => p.isDemo).length,
        realTransactions: transformedPayments.filter(p => !p.isDemo).length
      });

    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return 'status-succeeded';
      case 'pending':
        return 'status-pending';
      case 'refunded':
        return 'status-refunded';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'refunded':
        return <RefreshCw size={16} />;
      case 'failed':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getCardBrandClass = (brand) => {
    return `card-brand-${brand.toLowerCase()}`;
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || payment.status.toLowerCase() === filterStatus;
    const matchesMethod = filterMethod === 'all' ||
      (filterMethod === 'demo' && payment.isDemo) ||
      (filterMethod === 'stripe' && !payment.isDemo);

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalTransactions = payments.length;
  const succeededPayments = payments.filter(p => p.status === 'Succeeded').length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'Succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalFees = payments
    .filter(p => p.status === 'Succeeded' && !p.isDemo)
    .reduce((sum, p) => sum + parseFloat(p.fee || 0), 0);
  const netRevenue = totalRevenue - totalFees;

  const handleRefund = async (paymentId, bookingId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) return;

    toast.loading('Processing refund...');
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.dismiss();
      toast.success('Refund processed successfully!');
      fetchPayments();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to process refund');
    }
  };

  const handleExport = () => {
    const headers = ['Transaction ID', 'Customer', 'Email', 'Booking Ref', 'Amount', 'Fee', 'Net', 'Status', 'Method', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => [
        p.transactionId,
        p.customer,
        p.email,
        p.bookingRef,
        p.amount,
        p.fee,
        p.net,
        p.status,
        p.isDemo ? 'Demo' : 'Stripe',
        p.date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Payments exported successfully');
  };

  if (loading) {
    return (
      <div className="admin-payments">
        <div className="payments-header">
          <div>
            <h1 className="payments-title">Payments Management</h1>
            <p className="payments-subtitle">Loading payments...</p>
          </div>
        </div>
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payments">
      <div className="payments-header">
        <div>
          <h1 className="payments-title">Payments Management</h1>
          <p className="payments-subtitle">Track transactions, refunds, and payment analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchPayments} style={{
            padding: '10px 16px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="export-btn" onClick={handleExport}>
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="payments-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by customer, booking ref, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="filter-group">
            <CreditCard size={18} />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Methods</option>
              <option value="stripe">Stripe</option>
              <option value="demo">Demo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="payments-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stat-value">{totalTransactions}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon succeeded">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{succeededPayments}</div>
            <div className="stat-label">Succeeded</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon pending">
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-value">{pendingPayments}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon revenue">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon fees">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">${totalFees.toFixed(2)}</div>
            <div className="stat-label">Total Fees</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon net">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="stat-value">${netRevenue.toFixed(2)}</div>
            <div className="stat-label">Net Revenue</div>
          </div>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {summary.demoTransactions > 0 && (
        <div className="integration-alert" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <AlertCircle size={20} />
          <div>
            <strong>Demo Payments Active</strong>
            <p style={{ margin: 0, opacity: 0.9 }}>
              You have {summary.demoTransactions} demo payment(s). Configure Stripe in Admin Settings for real payments.
            </p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Booking Ref</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Net</th>
              <th>Method</th>
              <th>3DS</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td className="transaction-id">
                  {payment.transactionId.substring(0, 20)}...
                  {payment.isDemo && (
                    <span style={{
                      fontSize: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginLeft: '6px'
                    }}>DEMO</span>
                  )}
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{payment.customer}</div>
                    <div className="customer-email">{payment.email}</div>
                  </div>
                </td>
                <td className="booking-ref">{payment.bookingRef}</td>
                <td className="description">{payment.description}</td>
                <td className="amount">${payment.amount.toFixed(2)}</td>
                <td className="fee">${parseFloat(payment.fee).toFixed(2)}</td>
                <td className="net">${parseFloat(payment.net).toFixed(2)}</td>
                <td>
                  <div className={`payment-method ${getCardBrandClass(payment.cardBrand)}`}>
                    <CreditCard size={14} />
                    <span>{payment.paymentMethod}</span>
                  </div>
                </td>
                <td>
                  {payment.threeDSecure ? (
                    <span className="secure-badge">
                      <CheckCircle size={14} />
                      Yes
                    </span>
                  ) : (
                    <span className="insecure-badge">
                      <XCircle size={14} />
                      No
                    </span>
                  )}
                </td>
                <td className="date">
                  <Calendar size={14} />
                  <span>{payment.date}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      title="View Details"
                      onClick={() => toast.info(`Transaction: ${payment.transactionId}\nAmount: $${payment.amount}\nCustomer: ${payment.customer}`)}
                    >
                      <Eye size={16} />
                    </button>
                    {payment.refundable && payment.status === 'Succeeded' && (
                      <button
                        className="action-btn refund"
                        title="Refund Payment"
                        onClick={() => handleRefund(payment.id, payment.bookingRef)}
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="no-results">
          <p>No payments found matching your criteria</p>
          {payments.length === 0 && (
            <p style={{ color: '#666', marginTop: '10px' }}>
              Payments will appear here when customers complete bookings.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
