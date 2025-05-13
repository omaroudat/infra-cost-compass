
// This is a placeholder for MySQL database connection configuration
// In a real application, you would use a backend API to handle database operations

export const mysqlConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'constructfin',
};

/*
MySQL Database Schema:

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'dataEntry') NOT NULL
);

-- BOQ Items Table
CREATE TABLE boq_items (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  unit_rate DECIMAL(15,2) NOT NULL,
  parent_id VARCHAR(36) NULL,
  FOREIGN KEY (parent_id) REFERENCES boq_items(id) ON DELETE CASCADE
);

-- Percentage Adjustments Table
CREATE TABLE percentage_adjustments (
  id VARCHAR(36) PRIMARY KEY,
  keyword VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  percentage DECIMAL(6,4) NOT NULL
);

-- WIRs Table
CREATE TABLE wirs (
  id VARCHAR(36) PRIMARY KEY,
  boq_item_id VARCHAR(36) NOT NULL,
  description TEXT NOT NULL,
  submittal_date DATE NOT NULL,
  received_date DATE NULL,
  status ENUM('A', 'B', 'C') NOT NULL,
  status_conditions TEXT NULL,
  calculated_amount DECIMAL(15,2) NULL,
  adjustment_applied_id VARCHAR(36) NULL,
  FOREIGN KEY (boq_item_id) REFERENCES boq_items(id),
  FOREIGN KEY (adjustment_applied_id) REFERENCES percentage_adjustments(id)
);

Notes:
- In a real application, you would use an API to connect to this database
- Passwords should be hashed before storing in the database
- Add appropriate indexes for better performance
- Consider using transactions for operations that modify multiple tables
*/
