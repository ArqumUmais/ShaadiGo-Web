# ShaadiGo-Web
A full-stack wedding venue booking platform for Pakistan built with React, Node.js, Express, and Microsoft SQL Server.
# About
ShaadiGo is a university project that proposes a comprehensive, centralized web-based platform that digitizes and streamlines the entire wedding hall booking lifecycle. The platform serves as a single point of interaction for two primary user types — customers seeking venues and venue owners managing their properties.
Customers can browse a curated catalogue of halls, inspect availability calendars, and confirm bookings online — all from one place.
# Running Procedure
# Clone Repository
git clone https://github.com/your-username/shaadigo-web.git
cd shaadigo-web
# Open SSMS and run the following command
CREATE DATABASE fse_shaadi_go;
USE fse_shaadi_go;
# Run the following query
CREATE LOGIN shaadigo_username WITH PASSWORD = 'your_password';
USE fse_shaadi_go;
CREATE USER shaadigo_username FOR LOGIN shaadigo_username;
ALTER ROLE db_owner ADD MEMBER shaadigo_username;
# Paste the following code in the .env file
PORT=5001
DB_SERVER=localhost
DB_DATABASE=fse_shaadi_go
DB_USER=shaadigo_username
DB_PASSWORD=your_password
