FROM mysql:8.0

# Copy schema file to initialization directory
# MySQL will automatically run .sql files in this directory on first startup
COPY schema.sql /docker-entrypoint-initdb.d/

# Use native password authentication
CMD ["mysqld", "--default-authentication-plugin=mysql_native_password"]
