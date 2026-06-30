# Public-Eye Backend
This is the FastAPI backend for the Public-Eye system using PostgreSQL via Supabase.

## Requirements
- Python 3.11
- PostgreSQL

## Setup Local Environment

```bash
# Set up a venv
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Setup Environment Variables
Create a `.env` file referencing `.env.example`. You need a Supabase project and database connection string.

## Migrations

Initialize database schemas:
```bash
alembic revision --autogenerate -m "Initial Migration"
alembic upgrade head
```

## Running Local Dev Server
```bash
uvicorn app.main:app --reload
```
