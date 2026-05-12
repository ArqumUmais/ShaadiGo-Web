-- Users
CREATE TABLE users (
  user_id       INT IDENTITY(1,1) PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME DEFAULT GETDATE()
);

-- Venues
CREATE TABLE venues (
  venue_id        INT IDENTITY(1,1) PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  city            VARCHAR(50) NOT NULL,
  location        VARCHAR(100) NOT NULL,
  capacity        INT NOT NULL,
  price_per_event DECIMAL(12, 2) NOT NULL,
  rating          DECIMAL(3, 1) DEFAULT 0.0,
  review_count    INT DEFAULT 0,
  description     TEXT,
  emoji           VARCHAR(10),
  created_at      DATETIME DEFAULT GETDATE()
);

-- Booked dates per venue
CREATE TABLE venue_unavailable_dates (
  id               INT IDENTITY(1,1) PRIMARY KEY,
  venue_id         INT NOT NULL,
  unavailable_date DATE NOT NULL,
  CONSTRAINT fk_vud_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
  CONSTRAINT uq_venue_date UNIQUE (venue_id, unavailable_date)
);

-- Bookings
CREATE TABLE bookings (
  booking_id       INT IDENTITY(1,1) PRIMARY KEY,
  user_id          INT NOT NULL,
  venue_id         INT NOT NULL,
  fname            VARCHAR(50) NOT NULL,
  lname            VARCHAR(50) NOT NULL,
  phone            VARCHAR(20) NOT NULL,
  event_type       VARCHAR(30) NOT NULL,
  guest_count      INT,
  special_requests TEXT,
  event_date       DATE NOT NULL,
  hall_price       DECIMAL(12, 2) NOT NULL,
  service_fee      DECIMAL(12, 2) NOT NULL,
  total_price      DECIMAL(12, 2) NOT NULL,
  advance_paid     DECIMAL(12, 2) NOT NULL,
  status           VARCHAR(20) DEFAULT 'pending',
  created_at       DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_booking_user  FOREIGN KEY (user_id)  REFERENCES users(user_id),
  CONSTRAINT fk_booking_venue FOREIGN KEY (venue_id) REFERENCES venues(venue_id)
);

-- Contact messages
CREATE TABLE contact_messages (
  message_id   INT IDENTITY(1,1) PRIMARY KEY,
  fname        VARCHAR(50) NOT NULL,
  lname        VARCHAR(50),
  email        VARCHAR(100) NOT NULL,
  phone        VARCHAR(20),
  inquiry_type VARCHAR(20) DEFAULT 'inquiry',
  subject      VARCHAR(150),
  booking_ref  VARCHAR(30),
  priority     VARCHAR(10) DEFAULT 'med',
  message      TEXT NOT NULL,
  submitted_at DATETIME DEFAULT GETDATE()
);
-- Chat messages table
CREATE TABLE chat_messages (
  message_id   INT IDENTITY(1,1) PRIMARY KEY,
  booking_id   INT NOT NULL,
  user_id      INT NOT NULL,
  sender       VARCHAR(10) NOT NULL CHECK (sender IN ('customer','owner')),
  message      NVARCHAR(MAX) NOT NULL,
  sent_at      DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_chat_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  CONSTRAINT fk_chat_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)
);

 CREATE TABLE reviews (
  review_id   INT IDENTITY(1,1) PRIMARY KEY,
  booking_id  INT NOT NULL,
  user_id     INT NOT NULL,
  venue_id    INT NOT NULL,
  rating      DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text NVARCHAR(MAX),
  created_at  DATETIME DEFAULT GETDATE(),
  CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  CONSTRAINT fk_review_user    FOREIGN KEY (user_id)    REFERENCES users(user_id),
  CONSTRAINT fk_review_venue   FOREIGN KEY (venue_id)   REFERENCES venues(venue_id),
  CONSTRAINT uq_one_review_per_booking UNIQUE (booking_id)
);

ALTER TABLE venues ALTER COLUMN emoji NVARCHAR(10);

-- Update all emojis
UPDATE venues SET emoji = N'🏛️' WHERE venue_id = 1;
UPDATE venues SET emoji = N'✨'  WHERE venue_id = 2;
UPDATE venues SET emoji = N'🌸'  WHERE venue_id = 3;
UPDATE venues SET emoji = N'🌹'  WHERE venue_id = 4;
UPDATE venues SET emoji = N'🕌'  WHERE venue_id = 5;
UPDATE venues SET emoji = N'🏰'  WHERE venue_id = 6;


select * from contact_messages
INSERT INTO venues (name, city, location, capacity, price_per_event, rating, review_count, description, emoji)
VALUES
  ('Pearl Continental Hall',  'Lahore',    'Gulberg, Lahore',   800,  450000, 4.8, 124, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '🏛️'),
  ('Royal Banquet Gardens',   'Karachi',   'Clifton, Karachi',  1200, 600000, 4.8,  98, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '✨'),
  ('Margalla Majestic Hall',  'Islamabad', 'F-7, Islamabad',    600,  380000, 4.8,  76, 'Our venue offers professional planning services to ensure every detail of your special day is sorted in seconds for a seamless, royal experience.', '🌸'),
  ('Golden Marquee Lahore',   'Lahore',    'DHA, Lahore',       1000, 320000, 4.6,  55, 'A breathtaking marquee venue with lush greenery, world-class catering and an expert wedding management team at your service.', '🌹'),
  ('Al-Noor Grand Hall',      'Karachi',   'Gulshan, Karachi',  900,  520000, 4.7,  89, 'Timeless elegance meets warm hospitality in this iconic Karachi venue, perfect for both intimate and grand celebrations.', '🕌'),
  ('Serene Garden Marquee',   'Islamabad', 'E-11, Islamabad',   500,  280000, 4.5,  42, 'An open-air paradise surrounded by manicured gardens, fairy lights and mountain backdrop views for an unforgettable evening.', '🏰');

-- Add refund columns to bookings table
ALTER TABLE bookings ADD refund_percent  INT DEFAULT 0;
ALTER TABLE bookings ADD refund_amount   DECIMAL(12,2) DEFAULT 0;
ALTER TABLE bookings ADD refund_status   VARCHAR(20) DEFAULT 'none';
ALTER TABLE bookings ADD cancelled_at    DATETIME NULL;


-- ═══════════════════════════════════════════════════════════════
--  OWNER PORTAL
-- ═══════════════════════════════════════════════════════════════

-- 1. Add role column to users table (only if not already present)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='role')
BEGIN
    ALTER TABLE users ADD role VARCHAR(10) NOT NULL DEFAULT 'customer'
      CONSTRAINT chk_user_role CHECK (role IN ('customer','owner'));
END

-- 2. Link venues to an owner (only if not already present)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='venues' AND COLUMN_NAME='owner_id')
BEGIN
    ALTER TABLE venues ADD owner_id INT NULL
      CONSTRAINT fk_venue_owner FOREIGN KEY (owner_id) REFERENCES users(user_id);
END

-- 3. Allow owner to reply in chat (sender already allows 'owner')
--    message_type + image_data columns (add only if not already present)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='message_type')
    ALTER TABLE chat_messages ADD message_type VARCHAR(10) NOT NULL DEFAULT 'text';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='image_data')
    ALTER TABLE chat_messages ADD image_data NVARCHAR(MAX) NULL;



-- 5. Refund columns on bookings (add if not present)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='bookings' AND COLUMN_NAME='refund_percent')
  ALTER TABLE bookings ADD refund_percent INT NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='bookings' AND COLUMN_NAME='refund_amount')
  ALTER TABLE bookings ADD refund_amount  DECIMAL(12,2) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='bookings' AND COLUMN_NAME='refund_status')
  ALTER TABLE bookings ADD refund_status  VARCHAR(20) NULL;
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='bookings' AND COLUMN_NAME='cancelled_at')
  ALTER TABLE bookings ADD cancelled_at   DATETIME NULL;



-- ═══════════════════════════════════════════════════════════════
--  PATCH: price_per_guest + refund confirmation
-- ═══════════════════════════════════════════════════════════════

-- 1. Rename price_per_event to price_per_guest in venues
EXEC sp_rename 'venues.price_per_event', 'price_per_guest', 'COLUMN';



-- 3. Recalculate existing venue prices

  UPDATE venues SET price_per_guest = ROUND(price_per_guest / capacity, 0);




-- ═══════════════════════════════════════════════════════════════
--   Remove image_data and message_type from chat_messages
-- ═══════════════════════════════════════════════════════════════

USE fse_shaadi_go;

-- Drop image_data column
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='image_data')
BEGIN
    ALTER TABLE chat_messages DROP COLUMN image_data;
    PRINT 'image_data column dropped';
END

-- Drop message_type column
IF EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME='chat_messages' AND COLUMN_NAME='message_type')
BEGIN
    -- Must drop default constraint first if one exists
    DECLARE @constraint NVARCHAR(200);
    SELECT @constraint = dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    JOIN sys.tables t  ON c.object_id = t.object_id
    WHERE t.name = 'chat_messages' AND c.name = 'message_type';

    IF @constraint IS NOT NULL
        EXEC('ALTER TABLE chat_messages DROP CONSTRAINT ' + @constraint);

    ALTER TABLE chat_messages DROP COLUMN message_type;
    PRINT 'message_type column dropped';
END


USE fse_shaadi_go;

SELECT user_id, username, role FROM users;

-- Assign ALL venues to the owner userUPDATE venues
SET owner_id = (
    SELECT TOP 1 user_id 
    FROM users 
    WHERE role = 'owner'
)
WHERE owner_id IS NULL OR owner_id = 0;


USE fse_shaadi_go;

-- Convert flat prices to per-guest prices (round to nearest 100)

UPDATE venues SET price_per_guest = ROUND(price_per_guest / capacity, -2)
WHERE price_per_guest > 1000 AND capacity > 0;
-- The condition price_per_guest > 1000 ensures we only convert venues





-- Set correct per-guest prices directly based on original flat prices / capacity
UPDATE venues SET price_per_guest = 600  WHERE venue_id = 1;  -- Pearl Continental: 450000/800 = 562 → 600
UPDATE venues SET price_per_guest = 500  WHERE venue_id = 2;  -- Royal Banquet: 600000/1200 = 500
UPDATE venues SET price_per_guest = 600  WHERE venue_id = 3;  -- Margalla Majestic: 380000/600 = 633 → 600
UPDATE venues SET price_per_guest = 300  WHERE venue_id = 4;  -- Golden Marquee: 320000/1000 = 320 → 300
UPDATE venues SET price_per_guest = 600  WHERE venue_id = 5;  -- Al-Noor Grand: 520000/900 = 578 → 600
UPDATE venues SET price_per_guest = 600  WHERE venue_id = 6;  -- Serene Garden: 280000/500 = 560 → 600

-- For owner-added venues with 0 price, set a default or leave for owner to update
-- FAST Hall (venue_id=7): set 0 means owner never set it — skip or set manually
-- Gorilla (venue_id=8): already has 3.00 — seems wrong, set a reasonable value
UPDATE venues SET price_per_guest = 2500 WHERE venue_id = 8 AND price_per_guest < 100;
UPDATE venues SET price_per_guest = 2500 WHERE venue_id = 9 AND price_per_guest = 0;
UPDATE venues SET price_per_guest = 2500 WHERE venue_id = 7 AND price_per_guest = 0;
--==============================================
-- CREATING VIEWS 
--==============================================

create view user_view AS
select * from users;

select * from user_view

create view booking_view as
select* from bookings;

create view venue_view as 
select * from venues

create view chat_view as
select * from chat_messages

create view review_view as 
select * from reviews

--==============================================
-- VIEW SCHEMA 
--==============================================
use fse_shaadi_go
select * from user_view
select * from booking_view
select * from venue_view
select * from chat_view
select * from review_view

-- ============================================================
-- STORED PROCEDURES
-- ============================================================


-- ============================================================
-- 1. Register New User
-- ============================================================

create procedure sp_register_user
(
    @username varchar(50),
    @password_hash varchar(255),
    @role varchar(10) = 'customer'
)
as
begin

    if exists (
        select 1 from users where username = @username
    )
    begin
        print 'Username already exists';
        return;
    end

    insert into users(username, password_hash, role)
    values(@username, @password_hash, @role);

    print 'User registered successfully';

end
go


-- ============================================================
-- 2. Book Venue
-- ============================================================

create procedure sp_book_venue
(
    @user_id int,
    @venue_id int,
    @fname varchar(50),
    @lname varchar(50),
    @phone varchar(20),
    @event_type varchar(30),
    @guest_count int,
    @special_requests text,
    @event_date date,
    @advance_paid decimal(12,2)
)
as
begin

    declare @price_per_guest decimal(12,2);
    declare @hall_price decimal(12,2);
    declare @service_fee decimal(12,2);
    declare @total_price decimal(12,2);

    -- check availability
    if exists (
        select 1
        from venue_unavailable_dates
        where venue_id = @venue_id
        and unavailable_date = @event_date
    )
    begin
        print 'Venue already booked on this date';
        return;
    end

    -- get venue price
    select @price_per_guest = price_per_guest
    from venues
    where venue_id = @venue_id;

    set @hall_price = @price_per_guest * @guest_count;
    set @service_fee = @hall_price * 0.05;
    set @total_price = @hall_price + @service_fee;

    insert into bookings
    (
        user_id,
        venue_id,
        fname,
        lname,
        phone,
        event_type,
        guest_count,
        special_requests,
        event_date,
        hall_price,
        service_fee,
        total_price,
        advance_paid
    )
    values
    (
        @user_id,
        @venue_id,
        @fname,
        @lname,
        @phone,
        @event_type,
        @guest_count,
        @special_requests,
        @event_date,
        @hall_price,
        @service_fee,
        @total_price,
        @advance_paid
    );

    print 'Booking successful';

end
go


-- ============================================================
-- 3. Cancel Booking
-- ============================================================

create procedure sp_cancel_booking
(
    @booking_id int
)
as
begin

    declare @event_date date;
    declare @advance_paid decimal(12,2);
    declare @refund_percent int;
    declare @refund_amount decimal(12,2);

    select
        @event_date = event_date,
        @advance_paid = advance_paid
    from bookings
    where booking_id = @booking_id;

    -- refund policy
    if datediff(day, getdate(), @event_date) >= 30
        set @refund_percent = 80;
    else if datediff(day, getdate(), @event_date) >= 15
        set @refund_percent = 50;
    else
        set @refund_percent = 20;

    set @refund_amount =
        (@advance_paid * @refund_percent) / 100;

    update bookings
    set
        status = 'cancelled',
        refund_percent = @refund_percent,
        refund_amount = @refund_amount,
        refund_status = 'processed',
        cancelled_at = getdate()
    where booking_id = @booking_id;
    DELETE FROM venue_unavailable_dates
WHERE venue_id = (
    SELECT venue_id
    FROM bookings
    WHERE booking_id = @booking_id
)
AND unavailable_date = @event_date;

    print 'Booking cancelled successfully';

end
go


-- ============================================================
-- 4. Add Review
-- ============================================================

create procedure sp_add_review
(
    @booking_id int,
    @user_id int,
    @venue_id int,
    @rating decimal(2,1),
    @review_text nvarchar(max)
)
as
begin

    if exists (
        select 1 from reviews
        where booking_id = @booking_id
    )
    begin
        print 'Review already exists for this booking';
        return;
    end

    insert into reviews
    (
        booking_id,
        user_id,
        venue_id,
        rating,
        review_text
    )
    values
    (
        @booking_id,
        @user_id,
        @venue_id,
        @rating,
        @review_text
    );

    print 'Review added successfully';

end
go


-- ============================================================
-- 5. Send Chat Message
-- ============================================================

create procedure sp_send_message
(
    @booking_id int,
    @user_id int,
    @sender varchar(10),
    @message nvarchar(max)
)
as
begin

    insert into chat_messages
    (
        booking_id,
        user_id,
        sender,
        message
    )
    values
    (
        @booking_id,
        @user_id,
        @sender,
        @message
    );

    print 'Message sent';

end
go


-- ============================================================
-- 6. Venue Search By City
-- ============================================================

create procedure sp_search_venues
(
    @city varchar(50)
)
as
begin

    select *
    from venues
    where city = @city
    order by rating desc;

end
go



-- ============================================================
-- TRIGGERS
-- ============================================================


-- ============================================================
-- 1. Prevent Double Booking
-- ============================================================

create trigger trg_prevent_double_booking
on bookings
instead of insert
as
begin

    declare @venue_id int;
    declare @event_date date;

    select
        @venue_id = venue_id,
        @event_date = event_date
    from inserted;

    if exists (
        select 1
        from bookings
        where venue_id = @venue_id
        and event_date = @event_date
        and status <> 'cancelled'
    )
    begin
        raiserror('Venue already booked for this date',16,1);
        rollback transaction;
        return;
    end

    insert into bookings
    (
        user_id,
        venue_id,
        fname,
        lname,
        phone,
        event_type,
        guest_count,
        special_requests,
        event_date,
        hall_price,
        service_fee,
        total_price,
        advance_paid,
        status
    )
    select
        user_id,
        venue_id,
        fname,
        lname,
        phone,
        event_type,
        guest_count,
        special_requests,
        event_date,
        hall_price,
        service_fee,
        total_price,
        advance_paid,
        status
    from inserted;

end
go


-- ============================================================
-- 2. Add Unavailable Date Automatically
-- ============================================================

create trigger trg_add_unavailable_date
on bookings
after insert
as
begin

    insert into venue_unavailable_dates
    (
        venue_id,
        unavailable_date
    )
    select
        venue_id,
        event_date
    from inserted;

end
go


-- ============================================================
-- 3. Update Venue Rating Automatically
-- ============================================================

create trigger trg_update_venue_rating
on reviews
after insert
as
begin

    declare @venue_id int;

    select @venue_id = venue_id
    from inserted;

    update venues
    set
        rating =
        (
            select avg(rating)
            from reviews
            where venue_id = @venue_id
        ),

        review_count =
        (
            select count(*)
            from reviews
            where venue_id = @venue_id
        )

    where venue_id = @venue_id;

end
go


-- ============================================================
-- 4. Prevent Guest Count Exceeding Capacity
-- ============================================================

create trigger trg_check_capacity
on bookings
instead of insert
as
begin

    declare @capacity int;
    declare @guest_count int;
    declare @venue_id int;

    select
        @venue_id = venue_id,
        @guest_count = guest_count
    from inserted;

    select
        @capacity = capacity
    from venues
    where venue_id = @venue_id;

    if @guest_count > @capacity
    begin
        raiserror('Guest count exceeds venue capacity',16,1);
        rollback transaction;
        return;
    end

    insert into bookings
    (
        user_id,
        venue_id,
        fname,
        lname,
        phone,
        event_type,
        guest_count,
        special_requests,
        event_date,
        hall_price,
        service_fee,
        total_price,
        advance_paid,
        status
    )
    select
        user_id,
        venue_id,
        fname,
        lname,
        phone,
        event_type,
        guest_count,
        special_requests,
        event_date,
        hall_price,
        service_fee,
        total_price,
        advance_paid,
        status
    from inserted;

end
go


-- ============================================================
-- 5. Log Deleted Reviews
-- ============================================================

create table deleted_reviews_log
(
    log_id int identity(1,1) primary key,
    review_id int,
    venue_id int,
    deleted_at datetime default getdate()
);
go

create trigger trg_log_deleted_review
on reviews
after delete
as
begin

    insert into deleted_reviews_log
    (
        review_id,
        venue_id
    )
    select
        review_id,
        venue_id
    from deleted;

end
go

