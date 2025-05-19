# TaskUp – Focused Work, Beautifully Managed

TaskUp is a modern, full-featured project management system for effective task tracking, team collaboration, resource planning, and scope management—all wrapped in a clean and intuitive interface.

## Features

- Project creation & management  
- Task assignment & tracking  
- Team collaboration tools  
- Resource planning & allocation  
- Risk tracking & mitigation  
- File attachments  
- Real-time user notifications  
- Scope, schedule, and cost control  

## Prerequisites

- Python 3.8+  
- Node.js 16+  
- npm or yarn  
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/MetinAbaszade/Project-Management-System.git
cd Project-Management-System
```

## Backend Setup

### 2. Install Python dependencies

No virtual environment needed. From the root:

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-jose[cryptography] passlib[bcrypt] python-multipart python-dotenv alembic
```

### 3. Create .env in the API/ directory

```ini
# API/.env

DATABASE_URL=sqlite:///./app.db

SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

CORS_ORIGINS=http://localhost:3000

UPLOAD_FOLDER=./uploads
```

### 4. Initialize the database

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Frontend Setup

### 5. Navigate to the Frontend directory

```bash
cd Frontend
```

### 6. Install dependencies (with legacy peer support)

```bash
npm install --legacy-peer-deps
# or
yarn install
```

### 7. Create .env.local in the Frontend/ directory

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running the Application

### Start backend

#### Terminal 1 – Run tunnel for database access:

```bash
python Core/run_tunnel.py
```

#### Terminal 2 – Start the FastAPI server:

```bash
uvicorn API.main:app --reload
```

The API will be available at: http://localhost:8000

### Start frontend

#### Terminal 3 – Run the Next.js dev server:

```bash
cd Frontend
npm run dev
# or
yarn dev
```

The frontend will be available at: http://localhost:3000

## Project Structure

```
Project-Management-System/
├── API/
│   ├── Models/        # SQLAlchemy models
│   ├── Routes/        # API endpoints
│   ├── Services/      # Business logic
│   ├── Db/            # Database config
│   └── main.py        # FastAPI app entry point
├── Core/
│   └── run_tunnel.py  # Tunnel for DB access
└── Frontend/
    ├── public/        # Static files
    ├── src/
    │   ├── api/       # API calls
    │   ├── app/       # Pages/layouts
    │   ├── components/# UI components
    │   ├── contexts/  # Context providers
    │   └── hooks/     # Custom hooks
    └── next.config.js # Next.js config
```

## Key Entities

- User  
- Project  
- Task  
- Team  
- Resource  
- Risk  
- ProjectScope

## API Documentation

Available at:  
http://localhost:8000/docs (Swagger UI)

## Troubleshooting

- Database connection issues? Double-check DATABASE_URL in API/.env  
- Frontend not connecting? Ensure NEXT_PUBLIC_API_URL matches your backend address  
- CORS errors? Confirm CORS_ORIGINS in API/.env  
- File upload fails? Make sure UPLOAD_FOLDER exists and is writable

## Contributing

1. Fork the repository  
2. Create a feature branch  
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. Commit your changes  
   ```bash
   git commit -m "Add awesome feature"
   ```
4. Push the branch  
   ```bash
   git push origin feature/awesome-feature
   ```
5. Open a Pull Request

## License

Licensed under the MIT License. See the LICENSE file for full details.
