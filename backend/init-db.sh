#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Run database migrations or initialization
python -c "
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from models import Base
from database import engine
import os

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print('Database tables created successfully!')

        # Check if we should populate sample data
        from sqlalchemy.orm import Session
        from models import Product
        session = Session(bind=engine)

        # Only populate if the database is empty
        if session.query(Product).count() == 0:
            print('Database is empty, populating sample data...')
            import populate_sample_data
        else:
            print('Database already contains data, skipping population.')

        session.close()
        break
    except OperationalError as e:
        retry_count += 1
        print(f'Database connection failed, retrying... ({retry_count}/{max_retries})')
        time.sleep(2)
    except Exception as e:
        print(f'Error initializing database: {e}')
        break
"

echo "Database initialization complete!"