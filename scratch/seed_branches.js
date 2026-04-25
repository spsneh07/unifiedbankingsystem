const mysql = require('mysql2/promise');

async function seed() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sneh@1234',
      database: 'banking_db'
    });

    const branches = [
      ['Nexus Main Branch - New Delhi', 'Parliament St, New Delhi, Delhi 110001', '+91 11-2345-6789', 'Rajesh Kumar', 28.6304, 77.2177],
      ['Nexus Mumbai Hub', 'Nariman Point, Mumbai, Maharashtra 400021', '+91 22-9876-5432', 'Sanjana Shah', 18.9284, 72.8227],
      ['Nexus Bangalore Tech Park', 'Electronic City, Bangalore, Karnataka 560100', '+91 80-4455-6677', 'Anil Murthy', 12.8391, 77.6778],
      ['Nexus Kolkata Heritage', 'Park Street, Kolkata, West Bengal 700016', '+91 33-1122-3344', 'Amitabh Bose', 22.5487, 88.3516],
      ['Nexus Chennai Marina', 'Beach Road, Chennai, Tamil Nadu 600001', '+91 44-5566-7788', 'Sivakumar R.', 13.0475, 80.2824],
      ['Nexus Hyderabad HiTech', 'Madhapur, Hyderabad, Telangana 500081', '+91 40-8899-0011', 'Priyanka Reddy', 17.4483, 78.3915],
      ['Nexus Pune IT Center', 'Hinjewadi, Pune, Maharashtra 411057', '+91 20-2233-4455', 'Mahesh Deshpande', 18.5913, 73.7389],
      ['Nexus Ahmedabad Business', 'Ashram Road, Ahmedabad, Gujarat 380009', '+91 79-6677-8899', 'Bhavesh Patel', 23.0338, 72.5633],
      ['Nexus Jaipur Palace', 'M.I. Road, Jaipur, Rajasthan 302001', '+91 141-2233-445', 'Vikram Singh', 26.9124, 75.8145],
      ['Nexus Lucknow Gomti', 'Gomti Nagar, Lucknow, Uttar Pradesh 226010', '+91 522-4455-667', 'Suresh Yadav', 26.8467, 80.9462],
      ['Nexus Chandigarh Capitol', 'Sector 17, Chandigarh 160017', '+91 172-1122-334', 'Harpreet Singh', 30.7333, 76.7794],
      ['Nexus Kochi Port', 'Willingdon Island, Kochi, Kerala 682003', '+91 484-5566-778', 'Kurian Jacob', 9.9658, 76.2673],
      ['Nexus Patna City', 'Boring Road, Patna, Bihar 800001', '+91 612-8899-001', 'Ravi Ranjan', 25.6127, 85.1376],
      ['Nexus Indore Clean Hub', 'Vijay Nagar, Indore, MP 452010', '+91 731-2233-445', 'Megha Sharma', 22.7533, 75.8937],
      ['Nexus Guwahati Gateway', 'G.S. Road, Guwahati, Assam 781005', '+91 361-5566-778', 'Bishal Baruah', 26.1445, 91.7362]
    ];

    console.log('Synchronizing branches...');
    for (const b of branches) {
      const [existing] = await conn.execute('SELECT branch_id FROM branches WHERE name = ?', [b[0]]);
      if (existing.length > 0) {
        await conn.execute(
          'UPDATE branches SET address = ?, phone = ?, manager_name = ?, latitude = ?, longitude = ? WHERE name = ?',
          [b[1], b[2], b[3], b[4], b[5], b[0]]
        );
      } else {
        await conn.execute(
          'INSERT INTO branches (name, address, phone, manager_name, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
          b
        );
      }
    }

    console.log('Branch synchronization completed successfully.');
  } catch (err) {
    console.error('Sync Error:', err.message);
  } finally {
    if (conn) await conn.end();
  }
}

seed();
