from database import SessionLocal, engine, Base
from sqlalchemy import text

# Test database connection and list all tables
def test_connection():
    try:
        # Open a session
        db = SessionLocal()
        # Execute query to list tables
        result = db.execute(text("SHOW TABLES;"))
        tables = result.fetchall()
        if tables:
            print("Connection successful. Tables in database:")
            for table in tables:
                print(table[0])
        else:
            print("No tables found in the database.")
    except Exception as e:
        print("Connection failed:", e)
    finally:
        db.close()

if __name__ == "__main__":
    test_connection()
