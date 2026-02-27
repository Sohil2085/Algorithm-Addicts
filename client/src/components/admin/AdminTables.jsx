import { useState } from 'react';

const AdminTables = () => {
    const [activeTab, setActiveTab] = useState('users');

    // Dummy Data
    const users = [
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@techstart.com', role: 'MSME', status: 'Active', joinDate: '2024-01-15' },
        { id: 2, name: 'Priya Sharma', email: 'priya@capital.com', role: 'LENDER', status: 'Active', joinDate: '2024-02-01' },
        { id: 3, name: 'Amit Patel', email: 'amit@solutions.com', role: 'MSME', status: 'Inactive', joinDate: '2024-01-20' },
        { id: 4, name: 'Neha Singh', email: 'neha@ventures.com', role: 'LENDER', status: 'Active', joinDate: '2024-02-05' },
        { id: 5, name: 'Vikram Gupta', email: 'vikram@enterprises.com', role: 'MSME', status: 'Active', joinDate: '2024-02-10' },
    ];

    const invoices = [
        { id: 1, invoiceNo: 'INV-2024-001', msme: 'TechStart Solutions', amount: '₹5,50,000', status: 'Approved', dueDate: '2024-03-15' },
        { id: 2, invoiceNo: 'INV-2024-002', msme: 'Digital Innovations', amount: '₹8,75,000', status: 'Pending', dueDate: '2024-03-20' },
        { id: 3, invoiceNo: 'INV-2024-003', msme: 'Creative Services', amount: '₹3,25,000', status: 'Flagged', dueDate: '2024-03-10' },
        { id: 4, invoiceNo: 'INV-2024-004', msme: 'Finance Corp', amount: '₹12,50,000', status: 'Approved', dueDate: '2024-03-25' },
        { id: 5, invoiceNo: 'INV-2024-005', msme: 'Business Solutions', amount: '₹6,75,000', status: 'Pending', dueDate: '2024-04-01' },
    ];

    const transactions = [
        { id: 1, txnId: 'TXN-2024-156', from: 'Capital Ventures', to: 'TechStart Solutions', amount: '₹5,00,000', status: 'Completed', date: '2024-02-12' },
        { id: 2, txnId: 'TXN-2024-157', from: 'Prime Investments', to: 'Digital Innovations', amount: '₹3,50,000', status: 'Completed', date: '2024-02-11' },
        { id: 3, txnId: 'TXN-2024-158', from: 'Global Finance', to: 'Creative Services', amount: '₹2,10,000', status: 'Processing', date: '2024-02-10' },
        { id: 4, txnId: 'TXN-2024-159', from: 'Capital Ventures', to: 'Finance Corp', amount: '₹7,50,000', status: 'Completed', date: '2024-02-09' },
        { id: 5, txnId: 'TXN-2024-160', from: 'Prime Investments', to: 'Business Solutions', amount: '₹4,25,000', status: 'Failed', date: '2024-02-08' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            Active: 'status-active',
            Inactive: 'status-inactive',
            Approved: 'status-approved',
            Pending: 'status-pending',
            Flagged: 'status-flagged',
            Completed: 'status-completed',
            Processing: 'status-processing',
            Failed: 'status-failed',
        };
        return statusMap[status] || 'status-default';
    };

    return (
        <div className="tables-section">
            {/* Tabs */}
            <div className="table-tabs">
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Recent Users
                </button>
                <button
                    className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                >
                    Recent Invoices
                </button>
                <button
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Recent Transactions
                </button>
            </div>

            {/* Users Table */}
            {activeTab === 'users' && (
                <div className="table-wrapper overflow-x-auto">
                    <table className="admin-table min-w-[800px]">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Join Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="name-cell">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">{user.joinDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Invoices Table */}
            {activeTab === 'invoices' && (
                <div className="table-wrapper overflow-x-auto">
                    <table className="admin-table min-w-[800px]">
                        <thead>
                            <tr>
                                <th>Invoice No</th>
                                <th>MSME</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="invoice-id">{invoice.invoiceNo}</td>
                                    <td>{invoice.msme}</td>
                                    <td className="amount-cell">{invoice.amount}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">{invoice.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transactions Table */}
            {activeTab === 'transactions' && (
                <div className="table-wrapper overflow-x-auto">
                    <table className="admin-table min-w-[800px]">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td className="txn-id">{txn.txnId}</td>
                                    <td>{txn.from}</td>
                                    <td>{txn.to}</td>
                                    <td className="amount-cell">{txn.amount}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(txn.status)}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="date-cell">{txn.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminTables;
