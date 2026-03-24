require('dotenv').config();
console.log('ENV CHECK:');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
const express = require('express');
const cors    = require('cors');
const sql     = require('mssql');

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ── DB CONFIG ─────────────────────────────────────────────────────────────────
const dbConfig = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    instanceName:           'SQLEXPRESS',
    trustServerCertificate: true
  }
};
const pool        = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();
pool.on('error', err => console.error('SQL Pool Error:', err));

// ── SIGNUP ────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });

  if (password.length < 8)
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

  try {
    await poolConnect;

    const existing = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT user_id FROM users WHERE username = @username');

    if (existing.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });

    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('INSERT INTO users (username, password_hash) VALUES (@username, @password)');

    res.json({ success: true, message: 'Account created successfully! You can now log in.' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });

  try {
    await poolConnect;

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT user_id FROM users WHERE username = @username AND password_hash = @password');

    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });

    res.json({
      success: true,
      message: 'Login successful!',
      user: { user_id: result.recordset[0].user_id, username }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── BOOKING ───────────────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  const {
    userId, fname, lname, phone,
    eventType, guests, venueId,
    eventDate, advancePaid
  } = req.body;

  if (!userId || !fname || !lname || !phone || !eventType || !venueId || !eventDate)
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });

  try {
    await poolConnect;

    // Get venue price to calculate fees server-side
    const venueResult = await pool.request()
      .input('venueId', sql.Int, venueId)
      .query('SELECT venue_id, price_per_event FROM venues WHERE venue_id = @venueId');

    if (venueResult.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Venue not found.' });

    const hallPrice  = parseFloat(venueResult.recordset[0].price_per_event);
    const serviceFee = Math.round(hallPrice * 0.05);
    const totalPrice = hallPrice + serviceFee;

    // Check for date conflict
    const conflict = await pool.request()
      .input('venueId',   sql.Int,  venueId)
      .input('eventDate', sql.Date, eventDate)
      .query(`
        SELECT booking_id FROM bookings
        WHERE venue_id   = @venueId
          AND event_date = @eventDate
          AND status    != 'cancelled'
      `);

    if (conflict.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'This venue is already booked on that date. Please choose another date.' });

    // Insert booking
    const insert = await pool.request()
      .input('userId',          sql.Int,              userId)
      .input('venueId',         sql.Int,              venueId)
      .input('fname',           sql.VarChar,          fname)
      .input('lname',           sql.VarChar,          lname)
      .input('phone',           sql.VarChar,          phone)
      .input('eventType',       sql.VarChar,          eventType)
      .input('guestCount',      sql.Int,              guests    || null)
      .input('specialRequests', sql.NVarChar(sql.MAX),req.body.special || null)
      .input('eventDate',       sql.Date,             eventDate)
      .input('hallPrice',       sql.Decimal(12,2),    hallPrice)
      .input('serviceFee',      sql.Decimal(12,2),    serviceFee)
      .input('totalPrice',      sql.Decimal(12,2),    totalPrice)
      .input('advancePaid',     sql.Decimal(12,2),    advancePaid || 0)
      .query(`
        INSERT INTO bookings
          (user_id, venue_id, fname, lname, phone, event_type, guest_count,
           special_requests, event_date, hall_price, service_fee, total_price,
           advance_paid, status)
        OUTPUT INSERTED.booking_id
        VALUES
          (@userId, @venueId, @fname, @lname, @phone, @eventType, @guestCount,
           @specialRequests, @eventDate, @hallPrice, @serviceFee, @totalPrice,
           @advancePaid, 'confirmed')
      `);

    // Block this date on the venue calendar
    await pool.request()
      .input('venueId',   sql.Int,  venueId)
      .input('eventDate', sql.Date, eventDate)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM venue_unavailable_dates
          WHERE venue_id = @venueId AND unavailable_date = @eventDate
        )
        INSERT INTO venue_unavailable_dates (venue_id, unavailable_date)
        VALUES (@venueId, @eventDate)
      `);

    const bookingId = insert.recordset[0].booking_id;

    res.json({
      success:   true,
      message:   'Booking confirmed successfully!',
      bookingId,
      reference: `SG-${new Date().getFullYear()}-${String(bookingId).padStart(5, '0')}`
    });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CONTACT ───────────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { fname, lname, email, phone, inquiryType, subject, bookingRef, priority, message } = req.body;

  if (!fname || !email || !message)
    return res.status(400).json({ success: false, message: 'First name, email and message are required.' });

  try {
    await poolConnect;

    await pool.request()
      .input('fname',       sql.VarChar,           fname)
      .input('lname',       sql.VarChar,           lname       || null)
      .input('email',       sql.VarChar,           email)
      .input('phone',       sql.VarChar,           phone       || null)
      .input('inquiryType', sql.VarChar,           inquiryType || 'inquiry')
      .input('subject',     sql.VarChar,           subject     || null)
      .input('bookingRef',  sql.VarChar,           bookingRef  || null)
      .input('priority',    sql.VarChar,           priority    || 'med')
      .input('message',     sql.NVarChar(sql.MAX), message)
      .query(`
        INSERT INTO contact_messages
          (fname, lname, email, phone, inquiry_type, subject, booking_ref, priority, message)
        VALUES
          (@fname, @lname, @email, @phone, @inquiryType, @subject, @bookingRef, @priority, @message)
      `);

    res.json({ success: true, message: 'Message received! We will respond shortly.' });

  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET VENUES ────────────────────────────────────────────────────────────────
app.get('/api/venues', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM venues ORDER BY venue_id');
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Venues error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET BOOKED DATES FOR A VENUE (for calendar) ───────────────────────────────
app.get('/api/booking/unavailable/:venueId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`
        SELECT CONVERT(varchar, unavailable_date, 23) AS unavailable_date
        FROM venue_unavailable_dates
        WHERE venue_id = @venueId
      `);
    res.json({ success: true, dates: result.recordset.map(r => r.unavailable_date) });
  } catch (err) {
    console.error('Unavailable dates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log('   POST /api/signup');
      console.log('   POST /api/login');
      console.log('   POST /api/booking');
      console.log('   POST /api/contact');
      console.log('   GET  /api/venues');
      console.log('   GET  /api/booking/unavailable/:venueId\n');
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is busy. Run: taskkill /F /IM node.exe`);
        process.exit(1);
      }
    });

    await poolConnect;
    console.log('✅ Connected to MSSQL database');

  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();