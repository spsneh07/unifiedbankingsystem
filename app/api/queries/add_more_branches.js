const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sneh@1234',
    database: 'banking_db'
  });

  try {
    const moreBranches = [
      ['Punjab National Bank Model Town', 'Main Market, Model Town, Jalandhar', '0181-2233445', 'Karan Johar', 31.3260, 75.5760],
      ['SBI Gariahat', 'Gariahat Crossing, Kolkata', '033-24641122', 'Soma Roy', 22.5190, 88.3650],
      ['HDFC Hinjewadi', 'Phase 1, Hinjewadi IT Park, Pune', '020-66554433', 'Rohan Mehta', 18.5910, 73.7380],
      ['ICICI T Nagar', 'G.N. Chetty Road, T. Nagar, Chennai', '044-42125566', 'Venkatesh K', 13.0410, 80.2330],
      ['Axis Bank Gomti Nagar', 'Vibhuti Khand, Gomti Nagar, Lucknow', '0522-2304455', 'Alok Gupta', 26.8460, 81.0000],
      ['Kotak Residency Road', 'Residency Road, Srinagar', '0194-2455667', 'Zahid Khan', 34.0830, 74.8050],
      ['Yes Bank Panjim', 'MG Road, Panjim, Goa', '0832-2422334', 'Maria Fernandes', 15.4900, 73.8270],
      ['IndusInd Malviya Nagar', 'Sector 1, Malviya Nagar, Jaipur', '0141-2722334', 'Deepak Pareek', 26.8530, 75.8050],
      ['IDFC First Infocity', 'Patia, Bhubaneswar', '0674-2725566', 'Prajna Panda', 20.3500, 85.8200],
      ['Canara Bank Hazratganj', 'MG Marg, Hazratganj, Lucknow', '0522-2622334', 'Shailesh Mishra', 26.8500, 80.9500]
    ];

    for (const b of moreBranches) {
      await conn.query(
        'INSERT INTO branches (name, address, phone, manager_name, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
        b
      );
    }
    console.log('10 more branches added successfully.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await conn.end();
  }
})();
