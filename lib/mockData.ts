// lib/mockData.ts
// All mock data. Replace API calls with real MySQL queries later.

export const mockUser = {
  id: 1,
  name: 'Arjun Mehta',
  email: 'arjun.mehta@gmail.com',
  role: 'admin',
  avatar: 'AM',
};

export const mockCustomers = [
  { customer_id: 1, name: 'Arjun Mehta', email: 'arjun.mehta@gmail.com', phone: '9876543210', address: 'Mumbai, Maharashtra', aadhar_number: '123456789012', created_at: '2023-01-15' },
  { customer_id: 2, name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '9123456780', address: 'Delhi, Delhi', aadhar_number: '234567890123', created_at: '2023-02-20' },
  { customer_id: 3, name: 'Rahul Verma', email: 'rahul.verma@yahoo.com', phone: '9034567891', address: 'Bengaluru, Karnataka', aadhar_number: '345678901234', created_at: '2023-03-10' },
  { customer_id: 4, name: 'Sneha Patel', email: 'sneha.patel@outlook.com', phone: '9945678902', address: 'Ahmedabad, Gujarat', aadhar_number: '456789012345', created_at: '2023-04-05' },
  { customer_id: 5, name: 'Karan Singh', email: 'karan.singh@gmail.com', phone: '9856789013', address: 'Chandigarh, Punjab', aadhar_number: '567890123456', created_at: '2023-05-18' },
  { customer_id: 6, name: 'Anita Nair', email: 'anita.nair@gmail.com', phone: '9767890124', address: 'Kochi, Kerala', aadhar_number: '678901234567', created_at: '2023-06-22' },
  { customer_id: 7, name: 'Vikram Joshi', email: 'vikram.joshi@gmail.com', phone: '9678901235', address: 'Pune, Maharashtra', aadhar_number: '789012345678', created_at: '2023-07-30' },
  { customer_id: 8, name: 'Deepika Rao', email: 'deepika.rao@gmail.com', phone: '9589012346', address: 'Hyderabad, Telangana', aadhar_number: '890123456789', created_at: '2023-08-14' },
  { customer_id: 9, name: 'Suresh Kumar', email: 'suresh.kumar@gmail.com', phone: '9490123457', address: 'Chennai, Tamil Nadu', aadhar_number: '901234567890', created_at: '2023-09-25' },
  { customer_id: 10, name: 'Meera Iyer', email: 'meera.iyer@gmail.com', phone: '9301234568', address: 'Coimbatore, Tamil Nadu', aadhar_number: '012345678901', created_at: '2023-10-08' },
  { customer_id: 11, name: 'Aditya Bhatt', email: 'aditya.bhatt@gmail.com', phone: '9212345679', address: 'Jaipur, Rajasthan', aadhar_number: '112345678902', created_at: '2023-11-12' },
  { customer_id: 12, name: 'Pooja Gupta', email: 'pooja.gupta@gmail.com', phone: '9123456790', address: 'Lucknow, UP', aadhar_number: '223456789013', created_at: '2023-12-01' },
  { customer_id: 13, name: 'Nikhil Desai', email: 'nikhil.desai@gmail.com', phone: '9034567891', address: 'Surat, Gujarat', aadhar_number: '334567890124', created_at: '2024-01-15' },
  { customer_id: 14, name: 'Isha Kapoor', email: 'isha.kapoor@gmail.com', phone: '9945678902', address: 'Kolkata, West Bengal', aadhar_number: '445678901235', created_at: '2024-02-20' },
  { customer_id: 15, name: 'Rohan Das', email: 'rohan.das@gmail.com', phone: '9856789013', address: 'Bhubaneswar, Odisha', aadhar_number: '556789012346', created_at: '2024-03-10' },
];

export const mockBranches = [
  { branch_id: 1, name: 'SBI - Connaught Place', address: 'Connaught Place, New Delhi', phone: '011-23456789', manager_name: 'Rajesh Kumar' },
  { branch_id: 2, name: 'HDFC - Bandra West', address: 'Bandra West, Mumbai', phone: '022-34567890', manager_name: 'Sunita Pillai' },
  { branch_id: 3, name: 'ICICI - MG Road', address: 'MG Road, Bengaluru', phone: '080-45678901', manager_name: 'Mohan Rao' },
  { branch_id: 4, name: 'SBI - Anna Nagar', address: 'Anna Nagar, Chennai', phone: '044-56789012', manager_name: 'Kavitha Subramanian' },
  { branch_id: 5, name: 'HDFC - Satellite', address: 'Satellite Road, Ahmedabad', phone: '079-67890123', manager_name: 'Girish Shah' },
];

export const mockEmployees = [
  { employee_id: 1, name: 'Amit Tiwari', email: 'amit.tiwari@sbi.co.in', phone: '9111111111', position: 'Teller', branch_id: 1, branch_name: 'SBI - Connaught Place', hire_date: '2019-06-01' },
  { employee_id: 2, name: 'Shalini Gupta', email: 'shalini.gupta@sbi.co.in', phone: '9222222222', position: 'Loan Officer', branch_id: 1, branch_name: 'SBI - Connaught Place', hire_date: '2018-03-15' },
  { employee_id: 3, name: 'Praveen Nair', email: 'praveen.nair@hdfc.com', phone: '9333333333', position: 'Relationship Manager', branch_id: 2, branch_name: 'HDFC - Bandra West', hire_date: '2020-09-01' },
  { employee_id: 4, name: 'Lalita Sharma', email: 'lalita.sharma@hdfc.com', phone: '9444444444', position: 'Teller', branch_id: 2, branch_name: 'HDFC - Bandra West', hire_date: '2021-01-10' },
  { employee_id: 5, name: 'Sunil Bhat', email: 'sunil.bhat@icici.com', phone: '9555555555', position: 'Branch Manager', branch_id: 3, branch_name: 'ICICI - MG Road', hire_date: '2017-04-20' },
  { employee_id: 6, name: 'Rekha Menon', email: 'rekha.menon@icici.com', phone: '9666666666', position: 'Teller', branch_id: 3, branch_name: 'ICICI - MG Road', hire_date: '2022-07-05' },
  { employee_id: 7, name: 'Dinesh Reddy', email: 'dinesh.reddy@sbi.co.in', phone: '9777777777', position: 'Accountant', branch_id: 4, branch_name: 'SBI - Anna Nagar', hire_date: '2019-11-15' },
  { employee_id: 8, name: 'Usha Krishnan', email: 'usha.krishnan@sbi.co.in', phone: '9888888888', position: 'Customer Service', branch_id: 4, branch_name: 'SBI - Anna Nagar', hire_date: '2020-02-28' },
  { employee_id: 9, name: 'Mahesh Patel', email: 'mahesh.patel@hdfc.com', phone: '9999999999', position: 'Relationship Manager', branch_id: 5, branch_name: 'HDFC - Satellite', hire_date: '2018-08-01' },
  { employee_id: 10, name: 'Jyoti Agarwal', email: 'jyoti.agarwal@hdfc.com', phone: '9000000000', position: 'Teller', branch_id: 5, branch_name: 'HDFC - Satellite', hire_date: '2021-05-20' },
];

export const mockAccounts = [
  { account_id: 1, account_no: 'SBI0001234567', customer_id: 1, customer_name: 'Arjun Mehta', branch_id: 1, bank_name: 'SBI', account_type: 'Savings', balance: 125000.00, status: 'active', created_at: '2023-01-20' },
  { account_id: 2, account_no: 'HDFC002345678', customer_id: 1, customer_name: 'Arjun Mehta', branch_id: 2, bank_name: 'HDFC', account_type: 'Current', balance: 245000.00, status: 'active', created_at: '2023-02-10' },
  { account_id: 3, account_no: 'ICICI03456789', customer_id: 1, customer_name: 'Arjun Mehta', branch_id: 3, bank_name: 'ICICI', account_type: 'Savings', balance: 87500.00, status: 'active', created_at: '2023-03-05' },
  { account_id: 4, account_no: 'SBI0004567890', customer_id: 2, customer_name: 'Priya Sharma', branch_id: 1, bank_name: 'SBI', account_type: 'Savings', balance: 34000.00, status: 'active', created_at: '2023-02-25' },
  { account_id: 5, account_no: 'HDFC005678901', customer_id: 3, customer_name: 'Rahul Verma', branch_id: 2, bank_name: 'HDFC', account_type: 'Savings', balance: 3200.00, status: 'active', created_at: '2023-03-15' },
  { account_id: 6, account_no: 'ICICI06789012', customer_id: 4, customer_name: 'Sneha Patel', branch_id: 3, bank_name: 'ICICI', account_type: 'Current', balance: 178000.00, status: 'active', created_at: '2023-04-10' },
  { account_id: 7, account_no: 'SBI0007890123', customer_id: 5, customer_name: 'Karan Singh', branch_id: 4, bank_name: 'SBI', account_type: 'Savings', balance: 56000.00, status: 'frozen', created_at: '2023-05-20' },
  { account_id: 8, account_no: 'HDFC008901234', customer_id: 6, customer_name: 'Anita Nair', branch_id: 5, bank_name: 'HDFC', account_type: 'Savings', balance: 92000.00, status: 'active', created_at: '2023-06-25' },
  { account_id: 9, account_no: 'ICICI09012345', customer_id: 7, customer_name: 'Vikram Joshi', branch_id: 3, bank_name: 'ICICI', account_type: 'Savings', balance: 4800.00, status: 'active', created_at: '2023-07-30' },
  { account_id: 10, account_no: 'SBI0010123456', customer_id: 8, customer_name: 'Deepika Rao', branch_id: 1, bank_name: 'SBI', account_type: 'Current', balance: 320000.00, status: 'active', created_at: '2023-08-15' },
  { account_id: 11, account_no: 'HDFC011234567', customer_id: 9, customer_name: 'Suresh Kumar', branch_id: 2, bank_name: 'HDFC', account_type: 'Savings', balance: 67000.00, status: 'active', created_at: '2023-09-28' },
  { account_id: 12, account_no: 'ICICI12345678', customer_id: 10, customer_name: 'Meera Iyer', branch_id: 3, bank_name: 'ICICI', account_type: 'Savings', balance: 2100.00, status: 'active', created_at: '2023-10-10' },
  { account_id: 13, account_no: 'SBI0013456789', customer_id: 11, customer_name: 'Aditya Bhatt', branch_id: 4, bank_name: 'SBI', account_type: 'Current', balance: 450000.00, status: 'active', created_at: '2023-11-15' },
  { account_id: 14, account_no: 'HDFC014567890', customer_id: 12, customer_name: 'Pooja Gupta', branch_id: 5, bank_name: 'HDFC', account_type: 'Savings', balance: 28000.00, status: 'active', created_at: '2023-12-05' },
  { account_id: 15, account_no: 'ICICI15678901', customer_id: 13, customer_name: 'Nikhil Desai', branch_id: 3, bank_name: 'ICICI', account_type: 'Savings', balance: 115000.00, status: 'active', created_at: '2024-01-18' },
  { account_id: 16, account_no: 'SBI0016789012', customer_id: 14, customer_name: 'Isha Kapoor', branch_id: 1, bank_name: 'SBI', account_type: 'Savings', balance: 9500.00, status: 'active', created_at: '2024-02-22' },
  { account_id: 17, account_no: 'HDFC017890123', customer_id: 15, customer_name: 'Rohan Das', branch_id: 2, bank_name: 'HDFC', account_type: 'Current', balance: 195000.00, status: 'closed', created_at: '2024-03-12' },
  { account_id: 18, account_no: 'ICICI18901234', customer_id: 2, customer_name: 'Priya Sharma', branch_id: 3, bank_name: 'ICICI', account_type: 'Savings', balance: 72000.00, status: 'active', created_at: '2024-01-05' },
  { account_id: 19, account_no: 'SBI0019012345', customer_id: 3, customer_name: 'Rahul Verma', branch_id: 4, bank_name: 'SBI', account_type: 'Current', balance: 1500.00, status: 'active', created_at: '2024-02-10' },
  { account_id: 20, account_no: 'HDFC020123456', customer_id: 4, customer_name: 'Sneha Patel', branch_id: 5, bank_name: 'HDFC', account_type: 'Savings', balance: 88000.00, status: 'active', created_at: '2024-03-01' },
];

export const mockTransactions = [
  { transaction_id: 1, account_id: 1, account_no: 'SBI0001234567', customer_name: 'Arjun Mehta', type: 'deposit', amount: 50000, balance_after: 125000, description: 'Salary credit', transaction_date: '2024-04-01T09:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 2, account_id: 1, account_no: 'SBI0001234567', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 2500, balance_after: 122500, description: 'ATM withdrawal', transaction_date: '2024-04-02T11:30:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 3, account_id: 2, account_no: 'HDFC002345678', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 8000, balance_after: 237000, description: 'Grocery shopping', transaction_date: '2024-04-03T14:00:00', is_suspicious: false, category: 'Food' },
  { transaction_id: 4, account_id: 3, account_no: 'ICICI03456789', customer_name: 'Arjun Mehta', type: 'deposit', amount: 15000, balance_after: 87500, description: 'Freelance income', transaction_date: '2024-04-04T10:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 5, account_id: 1, account_no: 'SBI0001234567', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 200000, balance_after: 87500, description: 'Large cash withdrawal', transaction_date: '2024-04-05T16:00:00', is_suspicious: true, category: 'Other' },
  { transaction_id: 6, account_id: 4, account_no: 'SBI0004567890', customer_name: 'Priya Sharma', type: 'deposit', amount: 20000, balance_after: 34000, description: 'Monthly savings', transaction_date: '2024-04-01T10:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 7, account_id: 5, account_no: 'HDFC005678901', customer_name: 'Rahul Verma', type: 'withdraw', amount: 3000, balance_after: 3200, description: 'Electricity bill', transaction_date: '2024-04-03T09:00:00', is_suspicious: false, category: 'Bills' },
  { transaction_id: 8, account_id: 6, account_no: 'ICICI06789012', customer_name: 'Sneha Patel', type: 'transfer', amount: 500000, balance_after: 178000, description: 'Business transfer', transaction_date: '2024-04-04T15:00:00', is_suspicious: true, category: 'Other' },
  { transaction_id: 9, account_id: 8, account_no: 'HDFC008901234', customer_name: 'Anita Nair', type: 'deposit', amount: 30000, balance_after: 92000, description: 'Salary', transaction_date: '2024-04-01T09:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 10, account_id: 10, account_no: 'SBI0010123456', customer_name: 'Deepika Rao', type: 'withdraw', amount: 10000, balance_after: 310000, description: 'Travel booking', transaction_date: '2024-04-06T12:00:00', is_suspicious: false, category: 'Travel' },
  { transaction_id: 11, account_id: 2, account_no: 'HDFC002345678', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 5000, balance_after: 232000, description: 'Zomato order', transaction_date: '2024-04-07T19:00:00', is_suspicious: false, category: 'Food' },
  { transaction_id: 12, account_id: 3, account_no: 'ICICI03456789', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 12000, balance_after: 75500, description: 'Online shopping', transaction_date: '2024-04-08T14:00:00', is_suspicious: false, category: 'Shopping' },
  { transaction_id: 13, account_id: 11, account_no: 'HDFC011234567', customer_name: 'Suresh Kumar', type: 'deposit', amount: 25000, balance_after: 67000, description: 'Salary credit', transaction_date: '2024-04-01T09:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 14, account_id: 13, account_no: 'SBI0013456789', customer_name: 'Aditya Bhatt', type: 'deposit', amount: 100000, balance_after: 450000, description: 'Business income', transaction_date: '2024-04-02T11:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 15, account_id: 13, account_no: 'SBI0013456789', customer_name: 'Aditya Bhatt', type: 'withdraw', amount: 350000, balance_after: 100000, description: 'Property payment', transaction_date: '2024-04-08T10:00:00', is_suspicious: true, category: 'Other' },
  { transaction_id: 16, account_id: 1, account_no: 'SBI0001234567', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 3000, balance_after: 84500, description: 'Movie tickets', transaction_date: '2024-04-10T20:00:00', is_suspicious: false, category: 'Entertainment' },
  { transaction_id: 17, account_id: 2, account_no: 'HDFC002345678', customer_name: 'Arjun Mehta', type: 'withdraw', amount: 7500, balance_after: 224500, description: 'Doctor visit', transaction_date: '2024-04-11T10:00:00', is_suspicious: false, category: 'Healthcare' },
  { transaction_id: 18, account_id: 4, account_no: 'SBI0004567890', customer_name: 'Priya Sharma', type: 'withdraw', amount: 5000, balance_after: 29000, description: 'Phone bill', transaction_date: '2024-04-05T09:00:00', is_suspicious: false, category: 'Bills' },
  { transaction_id: 19, account_id: 6, account_no: 'ICICI06789012', customer_name: 'Sneha Patel', type: 'deposit', amount: 80000, balance_after: 258000, description: 'Client payment', transaction_date: '2024-04-09T14:00:00', is_suspicious: false, category: 'Other' },
  { transaction_id: 20, account_id: 15, account_no: 'ICICI15678901', customer_name: 'Nikhil Desai', type: 'deposit', amount: 45000, balance_after: 115000, description: 'Freelance project', transaction_date: '2024-04-10T16:00:00', is_suspicious: false, category: 'Other' },
];

export const mockScheduled = [
  { schedule_id: 1, account_id: 1, account_no: 'SBI0001234567', recipient_account_id: 4, recipient_no: 'SBI0004567890', amount: 5000, frequency: 'monthly', start_date: '2024-01-01', end_date: '2024-12-31', next_execution: '2024-05-01', is_active: true },
  { schedule_id: 2, account_id: 2, account_no: 'HDFC002345678', recipient_account_id: 8, recipient_no: 'HDFC008901234', amount: 2000, frequency: 'weekly', start_date: '2024-03-01', end_date: null, next_execution: '2024-04-22', is_active: true },
  { schedule_id: 3, account_id: 3, account_no: 'ICICI03456789', recipient_account_id: 15, recipient_no: 'ICICI15678901', amount: 10000, frequency: 'monthly', start_date: '2024-02-15', end_date: '2025-02-15', next_execution: '2024-05-15', is_active: true },
  { schedule_id: 4, account_id: 11, account_no: 'HDFC011234567', recipient_account_id: 14, recipient_no: 'HDFC014567890', amount: 500, frequency: 'daily', start_date: '2024-04-01', end_date: '2024-04-30', next_execution: '2024-04-20', is_active: false },
];

export const mockAlerts = [
  { alert_id: 1, customer_id: 3, customer_name: 'Rahul Verma', type: 'low_balance', message: 'Account HDFC005678901 balance is ₹3,200, below ₹5,000 threshold.', is_read: false, created_at: '2024-04-15T10:00:00' },
  { alert_id: 2, customer_id: 1, customer_name: 'Arjun Mehta', type: 'high_transaction', message: 'High transaction of ₹2,00,000 on SBI0001234567.', is_read: false, created_at: '2024-04-05T16:00:00' },
  { alert_id: 3, customer_id: 4, customer_name: 'Sneha Patel', type: 'suspicious_activity', message: 'Suspicious transfer of ₹5,00,000 detected on ICICI06789012.', is_read: true, created_at: '2024-04-04T15:00:00' },
  { alert_id: 4, customer_id: 7, customer_name: 'Vikram Joshi', type: 'low_balance', message: 'Account ICICI09012345 balance is ₹4,800, below ₹5,000 threshold.', is_read: false, created_at: '2024-04-14T08:00:00' },
  { alert_id: 5, customer_id: 10, customer_name: 'Meera Iyer', type: 'low_balance', message: 'Account ICICI12345678 balance is ₹2,100, critically low.', is_read: false, created_at: '2024-04-13T11:00:00' },
  { alert_id: 6, customer_id: 11, customer_name: 'Aditya Bhatt', type: 'suspicious_activity', message: 'Suspicious withdrawal of ₹3,50,000 detected on SBI0013456789.', is_read: false, created_at: '2024-04-08T10:00:00' },
];

export const mockAnalytics = {
  totalBalance: 2375100,
  totalAccounts: 20,
  totalCustomers: 15,
  totalTransactions: 20,
  monthlySpending: [
    { month: 'Nov', deposits: 180000, withdrawals: 95000 },
    { month: 'Dec', deposits: 210000, withdrawals: 130000 },
    { month: 'Jan', deposits: 175000, withdrawals: 110000 },
    { month: 'Feb', deposits: 240000, withdrawals: 160000 },
    { month: 'Mar', deposits: 195000, withdrawals: 120000 },
    { month: 'Apr', deposits: 420000, withdrawals: 1115000 },
  ],
  bankDistribution: [
    { name: 'SBI', value: 8, color: '#00d4aa' },
    { name: 'HDFC', value: 7, color: '#f0c040' },
    { name: 'ICICI', value: 5, color: '#4090f0' },
  ],
  transactionTypes: [
    { name: 'Deposit', value: 9, color: '#00d4aa' },
    { name: 'Withdrawal', value: 9, color: '#f05050' },
    { name: 'Transfer', value: 2, color: '#4090f0' },
  ],
  spendingByCategory: [
    { category: 'Food', amount: 15000, color: '#f0c040' },
    { category: 'Travel', amount: 10000, color: '#4090f0' },
    { category: 'Shopping', amount: 12000, color: '#f05050' },
    { category: 'Bills', amount: 8000, color: '#00d4aa' },
    { category: 'Entertainment', amount: 3000, color: '#a040f0' },
    { category: 'Healthcare', amount: 7500, color: '#f06040' },
    { category: 'Other', amount: 1170000, color: '#606880' },
  ],
};

export const suspiciousTransactions = mockTransactions.filter(t => t.is_suspicious);

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const maskAccountNo = (no: string) =>
  no.slice(0, 4) + '****' + no.slice(-4);
