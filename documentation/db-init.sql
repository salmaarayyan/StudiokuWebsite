-- Create database (adjust credentials in backend/config/config.json or .env)
CREATE DATABASE IF NOT EXISTS studioku_jogja;
USE studioku_jogja;

-- Tables are created via Sequelize migrations
-- Run: npm run db:migrate (from backend) after configuring .env

-- Admin seeding is handled via Sequelize seeders:
-- Run: npm run db:seed (from backend)
-- If you need manual insert, hash the password with bcrypt (10 rounds) and replace <HASHED_PASSWORD> below:
-- INSERT INTO Users (username, email, password, createdAt, updatedAt) VALUES ('admin', 'admin@studiokujogja.com', '<HASHED_PASSWORD>', NOW(), NOW());
