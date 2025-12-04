import { useState } from 'react';
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
import './AdminPayments.css';

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  // Mock data - will be replaced with Stripe API data
  const [payments] = useState([
    {
      id: 'PAY001',
      transactionId: 'ch_3Nqz4R2eZvKYlo2C0Wc',
      bookingRef: 'BK001',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      amount: 1250.00,
      currency: 'USD',
      status: 'Succeeded',
      paymentMethod: 'Visa •••• 4242',
      cardBrand: 'visa',
      date: '2025-11-23 14:30',
      description: 'Hotel Booking - Le Grand Hotel',
      fee: 36.25,
      net: 1213.75,
      refundable: true,
      threeDSecure: true
    },
    {
      id: 'PAY002',
      transactionId: 'ch_3Nqz4S2eZvKYlo2C1Xd',
      bookingRef: 'BK002',
      customer: 'Sarah Smith',
      email: 'sarah.smith@example.com',
      amount: 890.00,
      currency: 'USD',
      status: 'Pending',
      paymentMethod: 'Mastercard •••• 5555',
      cardBrand: 'mastercard',
      date: '2025-11-23 15:45',
      description: 'Flight Booking - Tokyo',
      fee: 25.81,
      net: 864.19,
      refundable: true,
      threeDSecure: true
    },
    {
      id: 'PAY003',
      transactionId: 'ch_3Nqz4T2eZvKYlo2C2Ye',
      bookingRef: 'BK003',
      customer: 'Mike Johnson',
      email: 'mike.j@example.com',
      amount: 2100.00,
      currency: 'USD',
      status: 'Succeeded',
      paymentMethod: 'Amex •••• 8431',
      cardBrand: 'amex',
      date: '2025-11-22 09:15',
      description: 'Hotel Booking - Burj Al Arab',
      fee: 60.90,
      net: 2039.10,
      refundable: true,
      threeDSecure: true
    },
    {
      id: 'PAY004',
      transactionId: 'ch_3Nqz4U2eZvKYlo2C3Zf',
      bookingRef: 'BK004',
      customer: 'Emily Brown',
      email: 'emily.brown@example.com',
      amount: 3500.00,
      currency: 'USD',
      status: 'Succeeded',
      paymentMethod: 'Visa •••• 1234',
      cardBrand: 'visa',
      date: '2025-11-21 16:20',
      description: 'Cruise Booking - Caribbean',
      fee: 101.50,
      net: 3398.50,
      refundable: true,
      threeDSecure: true
    },
    {
      id: 'PAY005',
      transactionId: 'ch_3Nqz4V2eZvKYlo2C4Ag',
      bookingRef: 'BK005',
      customer: 'David Wilson',
      email: 'david.w@example.com',
      amount: 780.00,
      currency: 'USD',
      status: 'Refunded',
      paymentMethod: 'Visa •••• 9876',
      cardBrand: 'visa',
      date: '2025-11-20 11:30',
      description: 'Hotel Booking - The Savoy',
      fee: -22.62,
      net: 0,
      refundable: false,
      threeDSecure: true
    },
    {
      id: 'PAY006',
      transactionId: 'ch_3Nqz4W2eZvKYlo2C5Bh',
      bookingRef: 'BK006',
      customer: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      amount: 1580.00,
      currency: 'USD',
      status: 'Failed',
      paymentMethod: 'Visa •••• 4321',
      cardBrand: 'visa',
      date: '2025-11-23 10:00',
      description: 'Hotel Booking - Plaza Hotel',
      fee: 0,
      net: 0,
      refundable: false,
      threeDSecure: false
    }
  ]);

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
    const matchesMethod = filterMethod === 'all' || payment.cardBrand.toLowerCase() === filterMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalTransactions = payments.length;
  const succeededPayments = payments.filter(p => p.status === 'Succeeded').length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'Succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalFees = payments
    .filter(p => p.status === 'Succeeded')
    .reduce((sum, p) => sum + p.fee, 0);
  const netRevenue = payments
    .filter(p => p.status === 'Succeeded')
    .reduce((sum, p) => sum + p.net, 0);

  const handleRefund = (paymentId) => {
    toast.loading('Processing refund...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Refund processed successfully!');
    }, 2000);
  };

  return (
    <div className="admin-payments">
      <div className="payments-header">
        <div>
          <h1 className="payments-title">Payments Management</h1>
          <p className="payments-subtitle">Track transactions, refunds, and payment analytics</p>
        </div>
        <button className="export-btn">
          <Download size={20} />
          Export Data
        </button>
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
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">Amex</option>
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
            <div className="stat-value">${totalFees.toLocaleString()}</div>
            <div className="stat-label">Total Fees</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon net">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="stat-value">${netRevenue.toLocaleString()}</div>
            <div className="stat-label">Net Revenue</div>
          </div>
        </div>
      </div>

      {/* Stripe Integration Alert */}
      <div className="integration-alert">
        <AlertCircle size={20} />
        <div>
          <strong>Stripe Integration with 3-D Secure</strong>
          <p>This section will be connected to Stripe API for real-time payment processing and transaction management.</p>
        </div>
      </div>

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
                <td className="transaction-id">{payment.transactionId}</td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{payment.customer}</div>
                    <div className="customer-email">{payment.email}</div>
                  </div>
                </td>
                <td className="booking-ref">{payment.bookingRef}</td>
                <td className="description">{payment.description}</td>
                <td className="amount">${payment.amount.toFixed(2)}</td>
                <td className="fee">${payment.fee.toFixed(2)}</td>
                <td className="net">${payment.net.toFixed(2)}</td>
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
                    <button className="action-btn view" title="View Details">
                      <Eye size={16} />
                    </button>
                    {payment.refundable && payment.status === 'Succeeded' && (
                      <button
                        className="action-btn refund"
                        title="Refund Payment"
                        onClick={() => handleRefund(payment.id)}
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
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
