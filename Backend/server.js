require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const sql     = require('mssql');

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
  const { username, password, role = 'customer' } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  if (password.length < 8)
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  if (!['customer', 'owner'].includes(role))
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  try {
    await poolConnect;
    // Check duplicate before calling SP (SP uses PRINT not error for duplicate)
    const existing = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT user_id FROM users WHERE username = @username');
    if (existing.recordset.length > 0)
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });
    // Call stored procedure sp_register_user
    await pool.request()
      .input('username',      sql.VarChar, username)
      .input('password_hash', sql.VarChar, password)
      .input('role',          sql.VarChar, role)
      .execute('sp_register_user');
    // Get the new user_id
    const newUser = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT user_id FROM users WHERE username = @username');
    res.json({ success: true, message: 'Account created successfully! You can now log in.', user_id: newUser.recordset[0].user_id });
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
      .query('SELECT user_id, role FROM users WHERE username = @username AND password_hash = @password');
    if (result.recordset.length === 0)
      return res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    const { user_id, role } = result.recordset[0];
    res.json({ success: true, message: 'Login successful!', user: { user_id, username, role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── BOOKING ───────────────────────────────────────────────────────────────────
app.post('/api/booking', async (req, res) => {

  const {
    userId,
    fname,
    lname,
    phone,
    eventType,
    guests,
    venueId,
    eventDate,
    advancePaid,
    special
  } = req.body;

  if (
    !userId ||
    !fname ||
    !lname ||
    !phone ||
    !eventType ||
    !venueId ||
    !eventDate ||
    !guests
  ) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be filled.'
    });
  }

  try {

    await poolConnect;

    // Call stored procedure
    await pool.request()
      .input('user_id',          sql.Int, userId)
      .input('venue_id',         sql.Int, venueId)
      .input('fname',            sql.VarChar(50), fname)
      .input('lname',            sql.VarChar(50), lname)
      .input('phone',            sql.VarChar(20), phone)
      .input('event_type',       sql.VarChar(30), eventType)
      .input('guest_count',      sql.Int, parseInt(guests))
      .input('special_requests', sql.Text, special || null)
      .input('event_date',       sql.Date, eventDate)
      .input('advance_paid',     sql.Decimal(12,2), advancePaid || 0)
      .execute('sp_book_venue');

    // Get latest inserted booking
    const latestBooking = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT TOP 1 booking_id
        FROM bookings
        WHERE user_id = @userId
        ORDER BY booking_id DESC
      `);

    const bookingId = latestBooking.recordset[0].booking_id;

    res.json({
      success: true,
      message: 'Booking confirmed successfully!',
      bookingId,
      reference: `SG-${new Date().getFullYear()}-${String(bookingId).padStart(5, '0')}`
    });

  } catch (err) {

    console.error('Booking error:', err);

    // Handle trigger/SP errors
    if (err.message.includes('Venue already booked')) {
      return res.status(409).json({
        success: false,
        message: 'This venue is already booked on that date.'
      });
    }

    if (err.message.includes('Guest count exceeds venue capacity')) {
      return res.status(400).json({
        success: false,
        message: 'Guest count exceeds venue capacity.'
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });

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
      .query(`INSERT INTO contact_messages (fname, lname, email, phone, inquiry_type, subject, booking_ref, priority, message)
              VALUES (@fname, @lname, @email, @phone, @inquiryType, @subject, @bookingRef, @priority, @message)`);
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

// ── SEARCH & FILTER VENUES ────────────────────────────────────────────────────
app.get('/api/venues/search', async (req, res) => {
  const { search, city, minPrice, maxPrice, minCapacity } = req.query;
  try {
    await poolConnect;
    // For city-only filter use sp_search_venues SP, otherwise use dynamic query
    if (city && !search && !minPrice && !maxPrice && !minCapacity) {
      const result = await pool.request()
        .input('city', sql.VarChar, city)
        .execute('sp_search_venues');
      return res.json({ success: true, venues: result.recordset });
    }
    // Dynamic multi-filter query for combined filters
    const request = pool.request();
    let query = 'SELECT * FROM venues WHERE 1=1';
    if (search) {
      query += ' AND (name LIKE @search OR location LIKE @search OR description LIKE @search)';
      request.input('search', sql.VarChar, `%${search}%`);
    }
    if (city) {
      query += ' AND city = @city';
      request.input('city', sql.VarChar, city);
    }
    if (minPrice) {
      query += ' AND price_per_guest >= @minPrice';
      request.input('minPrice', sql.Decimal(12,2), parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ' AND price_per_guest <= @maxPrice';
      request.input('maxPrice', sql.Decimal(12,2), parseFloat(maxPrice));
    }
    if (minCapacity) {
      query += ' AND capacity >= @minCapacity';
      request.input('minCapacity', sql.Int, parseInt(minCapacity));
    }
    query += ' ORDER BY rating DESC';
    const result = await request.query(query);
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET BOOKED DATES FOR A VENUE ──────────────────────────────────────────────
app.get('/api/booking/unavailable/:venueId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT CONVERT(varchar, unavailable_date, 23) AS unavailable_date
              FROM venue_unavailable_dates WHERE venue_id = @venueId`);
    res.json({ success: true, dates: result.recordset.map(r => r.unavailable_date) });
  } catch (err) {
    console.error('Unavailable dates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET USER BOOKINGS ─────────────────────────────────────────────────────────
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, req.params.userId)
      .query(`
        SELECT b.booking_id, b.venue_id, b.event_type, b.event_date, b.status,
               b.hall_price, b.service_fee, b.total_price, b.advance_paid,
               b.guest_count, b.special_requests, b.created_at,
               b.refund_percent, b.refund_amount, b.refund_status, b.cancelled_at,
               v.name AS venue_name, v.location, v.city
        FROM bookings b
        JOIN venues v ON v.venue_id = b.venue_id
        WHERE b.user_id = @userId
        ORDER BY b.created_at DESC
      `);
    res.json({ success: true, bookings: result.recordset });
  } catch (err) {
    console.error('Bookings fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CANCEL BOOKING ────────────────────────────────────────────────────────────
app.patch('/api/booking/:bookingId/cancel', async (req, res) => {
  const { userId } = req.body;
  try {
    await poolConnect;
    // Validate ownership before calling SP
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId',    sql.Int, userId)
      .query(`SELECT booking_id FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId AND status != 'cancelled'`);
    if (check.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'Booking not found or already cancelled.' });
    // Call stored procedure sp_cancel_booking
    // SP handles: days calc, refund policy, status update, free date
    await pool.request()
      .input('booking_id', sql.Int, req.params.bookingId)
      .execute('sp_cancel_booking');
    // Fetch updated booking to return refund details
    const updated = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT refund_percent, refund_amount,
              DATEDIFF(DAY, CAST(GETDATE() AS DATE), event_date) AS days_until
              FROM bookings WHERE booking_id = @bookingId`);
    const { refund_percent, refund_amount, days_until } = updated.recordset[0];
    res.json({
      success: true, message: 'Booking cancelled successfully.',
      refundPercent: refund_percent,
      refundAmount:  refund_amount,
      daysUntil:     days_until
    });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── CUSTOMER CONFIRM REFUND RECEIVED ─────────────────────────────────────────
app.patch('/api/booking/:bookingId/refund-received', async (req, res) => {
  const { userId } = req.body;
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('userId',    sql.Int, userId)
      .query(`SELECT booking_id FROM bookings
              WHERE booking_id = @bookingId AND user_id = @userId
              AND status = 'cancelled' AND refund_status = 'pending'`);
    if (check.recordset.length === 0)
      return res.status(404).json({ success: false, message: 'No pending refund found for this booking.' });
    await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`UPDATE bookings SET refund_status = 'received' WHERE booking_id = @bookingId`);
    res.json({ success: true, message: 'Refund confirmed. Thank you!' });
  } catch (err) {
    console.error('Refund confirm error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET CHAT MESSAGES ─────────────────────────────────────────────────────────
app.get('/api/chat/:bookingId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT m.message_id, m.sender, m.message, m.sent_at, u.username
              FROM chat_messages m
              JOIN users u ON u.user_id = m.user_id
              WHERE m.booking_id = @bookingId
              ORDER BY m.sent_at ASC`);
    res.json({ success: true, messages: result.recordset });
  } catch (err) {
    console.error('Chat fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SEND CHAT MESSAGE — uses sp_send_message ─────────────────────────────────
app.post('/api/chat/:bookingId', async (req, res) => {
  const { userId, message, senderRole } = req.body;
  const sender = senderRole === 'owner' ? 'owner' : 'customer';
  if (!message?.trim())
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT booking_id FROM bookings WHERE booking_id = @bookingId`);
    if (check.recordset.length === 0)
      return res.status(403).json({ success: false, message: 'Booking not found.' });
    // Call stored procedure sp_send_message
    await pool.request()
      .input('booking_id', sql.Int,               req.params.bookingId)
      .input('user_id',    sql.Int,               userId)
      .input('sender',     sql.VarChar,           sender)
      .input('message',    sql.NVarChar(sql.MAX), message.trim())
      .execute('sp_send_message');
    // Get the inserted message details
    const newMsg = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT TOP 1 message_id, sent_at FROM chat_messages
              WHERE booking_id = @bookingId ORDER BY sent_at DESC`);
    res.json({ success: true, message_id: newMsg.recordset[0].message_id, sent_at: newMsg.recordset[0].sent_at });
  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── REVIEWS ───────────────────────────────────────────────────────────────────
app.post('/api/review', async (req, res) => {
  const { bookingId, userId, venueId, rating, reviewText } = req.body;
  if (!bookingId || !userId || !venueId || !rating)
    return res.status(400).json({ success: false, message: 'Missing required fields.' });
  try {
    await poolConnect;
    // Validate eligibility before calling SP
    const check = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('userId',    sql.Int, userId)
      .input('venueId',   sql.Int, venueId)
      .query(`SELECT booking_id FROM bookings WHERE booking_id=@bookingId AND user_id=@userId
              AND venue_id=@venueId AND status='confirmed' AND event_date < CAST(GETDATE() AS DATE)`);
    if (check.recordset.length === 0)
      return res.status(403).json({ success: false, message: 'Not eligible to review this booking.' });
    // Call stored procedure sp_add_review
    // trg_update_venue_rating trigger fires automatically after INSERT to recalculate rating
    await pool.request()
      .input('booking_id',  sql.Int,               bookingId)
      .input('user_id',     sql.Int,               userId)
      .input('venue_id',    sql.Int,               venueId)
      .input('rating',      sql.Decimal(2,1),      rating)
      .input('review_text', sql.NVarChar(sql.MAX), reviewText || null)
      .execute('sp_add_review');
    res.json({ success: true, message: 'Review submitted successfully!' });
  } catch (err) {
    if (err.message?.includes('uq_one_review_per_booking'))
      return res.status(409).json({ success: false, message: 'You have already reviewed this booking.' });
    console.error('Review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reviews/:venueId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`SELECT r.review_id, r.rating, r.review_text, r.created_at, u.username, b.event_type
              FROM reviews r
              JOIN users u    ON u.user_id    = r.user_id
              JOIN bookings b ON b.booking_id = r.booking_id
              WHERE r.venue_id = @venueId ORDER BY r.created_at DESC`);
    res.json({ success: true, reviews: result.recordset });
  } catch (err) {
    console.error('Reviews fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/review/check/:bookingId', async (req, res) => {
  try {
    await poolConnect;
    const already = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .query(`SELECT review_id FROM reviews WHERE booking_id=@bookingId`);
    res.json({ success: true, reviewed: already.recordset.length > 0 });
  } catch (err) {
    console.error('Review check error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  OWNER PORTAL ROUTES
// ════════════════════════════════════════════════════════════════

// ── GET OWNER'S VENUES ────────────────────────────────────────────────────────
app.get('/api/owner/venues/:ownerId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`SELECT v.*,
                (SELECT COUNT(*) FROM bookings b WHERE b.venue_id=v.venue_id AND b.status != 'cancelled') AS total_bookings,
                (SELECT COUNT(*) FROM bookings b WHERE b.venue_id=v.venue_id AND b.status='pending')     AS pending_count,
                (SELECT COUNT(*) FROM bookings b WHERE b.venue_id=v.venue_id AND b.status='confirmed')   AS confirmed_count
              FROM venues v WHERE v.owner_id = @ownerId ORDER BY v.created_at DESC`);
    res.json({ success: true, venues: result.recordset });
  } catch (err) {
    console.error('Owner venues error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADD VENUE (owner) ─────────────────────────────────────────────────────────
app.post('/api/owner/venues', async (req, res) => {
  console.log('ADD VENUE BODY:', req.body);
  const { ownerId, name, city, location, capacity, price_per_guest, description } = req.body;
  if (!ownerId || !name || !city || !location || !capacity || !price_per_guest)
    return res.status(400).json({ success: false, message: `Missing: ownerId=${ownerId} name=${name} city=${city} location=${location} capacity=${capacity} price_per_guest=${price_per_guest}` });
  try {
    await poolConnect;
    // Verify the user is actually an owner
    const roleCheck = await pool.request()
      .input('ownerId', sql.Int, ownerId)
      .query(`SELECT role FROM users WHERE user_id=@ownerId`);
    if (!roleCheck.recordset.length || roleCheck.recordset[0].role !== 'owner')
      return res.status(403).json({ success: false, message: 'Only owners can add venues.' });
    const insert = await pool.request()
      .input('ownerId',       sql.Int,          ownerId)
      .input('name',          sql.VarChar,      name)
      .input('city',          sql.VarChar,      city)
      .input('location',      sql.VarChar,      location)
      .input('capacity',      sql.Int,          parseInt(capacity))
      .input('price',         sql.Decimal(12,2),parseFloat(price_per_guest))
      .input('description',   sql.NVarChar(sql.MAX), description || null)
      .query(`INSERT INTO venues (owner_id, name, city, location, capacity, price_per_guest, description)
              OUTPUT INSERTED.venue_id
              VALUES (@ownerId, @name, @city, @location, @capacity, @price, @description)`);
    res.json({ success: true, message: 'Venue added successfully!', venue_id: insert.recordset[0].venue_id });
  } catch (err) {
    console.error('Add venue error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── UPDATE VENUE (owner) ──────────────────────────────────────────────────────
app.put('/api/owner/venues/:venueId', async (req, res) => {
  const { ownerId, name, city, location, capacity, price_per_guest, description } = req.body;
  try {
    await poolConnect;
    const check = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .input('ownerId', sql.Int, ownerId)
      .query(`SELECT venue_id FROM venues WHERE venue_id=@venueId AND owner_id=@ownerId`);
    if (!check.recordset.length)
      return res.status(403).json({ success: false, message: 'Venue not found or not yours.' });
    await pool.request()
      .input('venueId',     sql.Int,          req.params.venueId)
      .input('name',        sql.VarChar,      name)
      .input('city',        sql.VarChar,      city)
      .input('location',    sql.VarChar,      location)
      .input('capacity',    sql.Int,          parseInt(capacity))
      .input('price',       sql.Decimal(12,2),parseFloat(price_per_guest))
      .input('description', sql.NVarChar(sql.MAX), description || null)
      .query(`UPDATE venues SET name=@name, city=@city, location=@location, capacity=@capacity,
              price_per_guest=@price, description=@description
              WHERE venue_id=@venueId`);
    res.json({ success: true, message: 'Venue updated successfully!' });
  } catch (err) {
    console.error('Update venue error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE VENUE (owner) ──────────────────────────────────────────────────────
app.delete('/api/owner/venues/:venueId', async (req, res) => {
  const { ownerId } = req.body;
  try {
    await poolConnect;
    const check = await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .input('ownerId', sql.Int, ownerId)
      .query(`SELECT venue_id FROM venues WHERE venue_id=@venueId AND owner_id=@ownerId`);
    if (!check.recordset.length)
      return res.status(403).json({ success: false, message: 'Venue not found or not yours.' });
    await pool.request()
      .input('venueId', sql.Int, req.params.venueId)
      .query(`DELETE FROM venues WHERE venue_id=@venueId`);
    res.json({ success: true, message: 'Venue deleted.' });
  } catch (err) {
    console.error('Delete venue error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OWNER DASHBOARD STATS ─────────────────────────────────────────────────────
app.get('/api/owner/dashboard/:ownerId', async (req, res) => {
  try {
    await poolConnect;
    const stats = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT
          COUNT(DISTINCT v.venue_id) AS total_venues,
          COUNT(b.booking_id)        AS total_bookings,
          SUM(CASE WHEN b.status='pending'   THEN 1 ELSE 0 END) AS pending_bookings,
          SUM(CASE WHEN b.status='confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
          SUM(CASE WHEN b.status='cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
          ISNULL(SUM(b.advance_paid), 0)  AS total_revenue,
          ISNULL(AVG(v.rating), 0)        AS avg_rating
        FROM venues v
        LEFT JOIN bookings b ON b.venue_id = v.venue_id
        WHERE v.owner_id = @ownerId
      `);
    // Recent bookings for owner's venues
    const recentBookings = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT TOP 10
          b.booking_id, b.fname, b.lname, b.event_type, b.event_date,
          b.status, b.total_price, b.advance_paid, b.created_at,
          v.name AS venue_name
        FROM bookings b
        JOIN venues v ON v.venue_id = b.venue_id
        WHERE v.owner_id = @ownerId
        ORDER BY b.created_at DESC
      `);
    // Pending payment verifications (bookings where status='pending' and image sent)
    const pendingVerifications = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT b.booking_id, b.fname, b.lname, b.event_type, b.event_date,
               b.advance_paid, b.status, v.name AS venue_name
        FROM bookings b
        JOIN venues v ON v.venue_id = b.venue_id
        WHERE v.owner_id = @ownerId AND b.status = 'pending'
        ORDER BY b.created_at DESC
      `);
    res.json({
      success: true,
      stats: stats.recordset[0],
      recentBookings: recentBookings.recordset,
      pendingVerifications: pendingVerifications.recordset
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OWNER: ALL CHATS (across all venues) ─────────────────────────────────────
app.get('/api/owner/chats/:ownerId', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT
          b.booking_id, b.fname, b.lname, b.event_type, b.event_date, b.status,
          b.total_price, b.advance_paid, b.guest_count,
          v.name AS venue_name,
          u.username AS customer_username,
          (SELECT TOP 1 message  FROM chat_messages cm WHERE cm.booking_id=b.booking_id ORDER BY cm.sent_at DESC) AS last_message,
          (SELECT TOP 1 sent_at  FROM chat_messages cm WHERE cm.booking_id=b.booking_id ORDER BY cm.sent_at DESC) AS last_message_at,
          (SELECT COUNT(*)       FROM chat_messages cm WHERE cm.booking_id=b.booking_id AND cm.sender='customer') AS unread_count
        FROM bookings b
        JOIN venues v ON v.venue_id = b.venue_id
        JOIN users u  ON u.user_id  = b.user_id
        WHERE v.owner_id = @ownerId
        ORDER BY b.created_at DESC
      `);
    res.json({ success: true, chats: result.recordset });
  } catch (err) {
    console.error('Owner chats error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── OWNER: UPDATE BOOKING STATUS ──────────────────────────────────────────────
app.patch('/api/owner/booking/:bookingId/status', async (req, res) => {
  const { ownerId, status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  try {
    await poolConnect;
    const check = await pool.request()
      .input('bookingId', sql.Int, req.params.bookingId)
      .input('ownerId',   sql.Int, ownerId)
      .query(`SELECT b.booking_id FROM bookings b
              JOIN venues v ON v.venue_id=b.venue_id
              WHERE b.booking_id=@bookingId AND v.owner_id=@ownerId`);
    if (!check.recordset.length)
      return res.status(403).json({ success: false, message: 'Booking not found or not yours.' });
    await pool.request()
      .input('bookingId', sql.Int,     req.params.bookingId)
      .input('status',    sql.VarChar, status)
      .query(`UPDATE bookings SET status=@status WHERE booking_id=@bookingId`);
    res.json({ success: true, message: `Booking status updated to ${status}.` });
  } catch (err) {
    console.error('Owner status update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── START SERVER ──────────────────────────────────────────────────────────────
async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    });
    server.on('error', err => {
      if (err.code === 'EADDRINUSE') { console.log(`❌ Port ${PORT} busy.`); process.exit(1); }
    });
    await poolConnect;
    console.log('✅ Connected to MSSQL database');
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
