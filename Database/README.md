# Database Setup

## Overview

The database is encrypted using Fernet encryption. To set it up properly, follow the steps below.

## Quick Start

### 1. Set Up MySQL Database
- Open XAMPP and start Apache and MySQL
- Open CMD and navigate to your MySQL bin folder (e.g., C:\xampp\mysql\bin).
- Login to MySQL:
```
mysql -u root -p
```

### 2. Create Database and Tables
- Copy everything from the `Database/schema.sql` file and paste it into your MySQL command line to create the database and tables

### 3. Insert Sample Queries
- Copy everything from the `Database/sample_queries.sql` file and paste it into your MySQL command line to insert sample queries

## 4. Configure Environment Variables

To encrypt the database with Fernet, you need to generate a Fernet key. To do so, follow these steps:

- Create a new Python file anywhere locally, and paste the following code:
```
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```
- Run the file, this will output a Fernet key
- Copy this key and paste it into your `.env` file as:
```
FERNET_KEY=xxx
```