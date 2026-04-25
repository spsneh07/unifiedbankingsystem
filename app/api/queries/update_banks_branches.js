const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sneh@1234',
    database: 'banking_db'
  });

  try {
    // 1. Update accounts table ENUM
    await conn.query(`
      ALTER TABLE accounts 
      MODIFY COLUMN bank_name ENUM('SBI','HDFC','ICICI','Axis','Kotak','Yes Bank','IndusInd','IDFC First','Canara Bank','Punjab National Bank') NOT NULL
    `);
    console.log('Accounts bank_name ENUM updated.');

    // 2. Add more branches
    const newBranches = [
      ['Yes Bank Vasant Vihar', 'A-5 Vasant Vihar, New Delhi', '011-26145566', 'Amit Khanna', 28.5600, 77.1600],
      ['IndusInd Jubilee Hills', 'Road No 36, Jubilee Hills, Hyderabad', '040-66778899', 'Sanjay Gupta', 17.4300, 78.4000],
      ['IDFC First Gachibowli', 'Cyber City, Gachibowli, Hyderabad', '040-23001122', 'Ritu Varma', 17.4400, 78.3500],
      ['Canara Bank MG Road', 'Unity Building, MG Road, Bangalore', '080-22221133', 'Vikas Rao', 12.9700, 77.5900],
      ['SBI Salt Lake Sector V', 'Sector V, Salt Lake, Kolkata', '033-23571100', 'Arindam Das', 22.5700, 88.4300]
    ];

    for (const b of newBranches) {
      await conn.query(
        'INSERT INTO branches (name, address, phone, manager_name, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
        b
      );
    }
    console.log('More branches added.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await conn.end();
  }
})();
