FROM mysql:8.0

# Copy initialization script to docker-entrypoint directory
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
