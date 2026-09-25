# RCM Dashboard - React + Python Stack (No ORM)

## RECOMMENDED STACK

### Frontend
```
React 18 (with Create React App or Webpack)
├── React Router (navigation)
├── Axios (HTTP client)
├── React Query / TanStack Query (data fetching)
├── React Hook Form (forms)
├── Recharts (charts)
├── React-Table (filtering/sorting)
├── Zod (validation)
├── Tailwind CSS (styling)
└── Socket.io-client (real-time)
```

### Backend
```
Python 3.10+
├── Flask (lightweight) OR FastAPI (modern)
├── psycopg2 (PostgreSQL driver)
├── Flask-CORS (cross-origin)
└── python-socketio (real-time)
```

### Database
```
PostgreSQL
├── Raw SQL queries (no ORM)
└── SQL Alchemy for connection pooling only
```

---

## 1. FRONTEND SETUP (React)

### Option A: Create React App (Simplest)

```bash
npx create-react-app rcm-dashboard
cd rcm-dashboard
npm install react-router-dom axios @tanstack/react-query recharts @tanstack/react-table react-hook-form zod tailwindcss socket.io-client
```

### Option B: Vite (Fastest, but you said no Vite)
**Skip this**

### Frontend Structure

```
rcm-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SpecialtyChart.jsx
│   │   │   └── KPICards.jsx
│   │   ├── PriorityQueue/
│   │   │   ├── PriorityQueue.jsx
│   │   │   └── QueueItem.jsx
│   │   ├── Leads/
│   │   │   ├── LeadList.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   ├── LeadForm.jsx
│   │   │   └── Filters.jsx
│   │   ├── LinkedInOutreach/
│   │   │   ├── LinkedInOutreach.jsx
│   │   │   └── LinkedInCard.jsx
│   │   ├── EmailOutreach/
│   │   │   ├── EmailOutreach.jsx
│   │   │   └── EmailTable.jsx
│   │   ├── Activities/
│   │   │   ├── ActivityTimeline.jsx
│   │   │   ├── AddNoteForm.jsx
│   │   │   └── NoteItem.jsx
│   │   ├── Import/
│   │   │   ├── ImportExcel.jsx
│   │   │   ├── DuplicateReview.jsx
│   │   │   └── UploadProgress.jsx
│   │   └── Common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── Loading.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── LeadsPage.jsx
│   │   ├── LeadDetailPage.jsx
│   │   ├── LinkedInPage.jsx
│   │   ├── EmailPage.jsx
│   │   ├── ImportPage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/
│   │   ├── api.js (Axios setup)
│   │   ├── leadsAPI.js
│   │   ├── activitiesAPI.js
│   │   ├── outreachAPI.js
│   │   ├── importAPI.js
│   │   └── socket.js
│   ├── hooks/
│   │   ├── useLeads.js
│   │   ├── usePriorityQueue.js
│   │   ├── useActivities.js
│   │   ├── useFilters.js
│   │   └── useNotifications.js
│   ├── store/
│   │   ├── filterStore.js (Zustand or Context)
│   │   ├── uiStore.js
│   │   └── authStore.js
│   ├── types/
│   │   └── index.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── public/
├── package.json
├── tailwind.config.js
└── .env
```

### Key React Libraries

```bash
# UI Components
npm install tailwindcss shadcn-ui

# Data Fetching
npm install @tanstack/react-query axios

# Forms & Validation
npm install react-hook-form zod

# Tables/Data Grid
npm install @tanstack/react-table

# Charts
npm install recharts

# Routing
npm install react-router-dom

# State Management
npm install zustand

# Real-time
npm install socket.io-client

# File Upload
npm install react-dropzone
```

### Example Frontend Service (Axios Setup)

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Example Component (Lead List with Filtering)

```jsx
// src/components/Leads/LeadList.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import Filters from './Filters';

const LeadList = () => {
  const [filters, setFilters] = useState({
    specialty: '',
    outreach_status: '',
    search: '',
  });

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/leads', {
        params: filters,
      });
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Filters filters={filters} setFilters={setFilters} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads?.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.doctor_name}</td>
              <td>{lead.specialty}</td>
              <td>{lead.outreach_status}</td>
              <td>
                <button>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadList;
```

---

## 2. BACKEND SETUP (Python)

### Option A: Flask (Lighter, Simple)

```bash
mkdir rcm-backend
cd rcm-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install flask flask-cors psycopg2-binary python-socketio python-dotenv flask-jwt-extended
```

### Option B: FastAPI (Modern, Faster)

```bash
mkdir rcm-backend
cd rcm-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install fastapi uvicorn psycopg2-binary python-socketio python-dotenv pydantic
```

### Backend Structure (Flask)

```
rcm-backend/
├── app.py (main application)
├── config.py (configuration)
├── requirements.txt
├── .env
├── routes/
│   ├── __init__.py
│   ├── leads.py
│   ├── activities.py
│   ├── outreach.py
│   ├── import_data.py
│   ├── priority_queue.py
│   └── auth.py
├── services/
│   ├── __init__.py
│   ├── lead_service.py
│   ├── activity_service.py
│   ├── outreach_service.py
│   ├── import_service.py
│   ├── priority_queue_service.py
│   └── excel_service.py
├── utils/
│   ├── __init__.py
│   ├── db.py (database connection)
│   ├── validators.py
│   ├── formatters.py
│   ├── duplicate_detector.py
│   └── excel_parser.py
├── middleware/
│   ├── __init__.py
│   ├── auth.py
│   └── error_handler.py
└── migrations/ (optional, manual SQL scripts)
```

### Example Flask Setup

```python
# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['DATABASE_URL'] = os.getenv('DATABASE_URL')

# Import routes
from routes import leads, activities, outreach, priority_queue, import_data

# Register blueprints
app.register_blueprint(leads.bp)
app.register_blueprint(activities.bp)
app.register_blueprint(outreach.bp)
app.register_blueprint(priority_queue.bp)
app.register_blueprint(import_data.bp)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
```

### Database Connection (No ORM - Raw SQL)

```python
# utils/db.py
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from contextlib import contextmanager

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/rcm_db')

@contextmanager
def get_db_connection():
    """Get database connection"""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

@contextmanager
def get_db_cursor(commit=True):
    """Get database cursor with automatic commit"""
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

def execute_query(query, params=None):
    """Execute SELECT query"""
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchall()

def execute_single(query, params=None):
    """Execute SELECT query - single result"""
    with get_db_cursor(commit=False) as cursor:
        cursor.execute(query, params or ())
        return cursor.fetchone()

def execute_insert(query, params=None):
    """Execute INSERT query - returns last row id"""
    with get_db_cursor(commit=True) as cursor:
        cursor.execute(query, params or ())
        return cursor.lastrowid

def execute_update(query, params=None):
    """Execute UPDATE query"""
    with get_db_cursor(commit=True) as cursor:
        cursor.execute(query, params or ())
        return cursor.rowcount

def execute_delete(query, params=None):
    """Execute DELETE query"""
    with get_db_cursor(commit=True) as cursor:
        cursor.execute(query, params or ())
        return cursor.rowcount
```

### Example Route (Get Leads with Filters)

```python
# routes/leads.py
from flask import Blueprint, request, jsonify
from utils.db import execute_query, execute_single, execute_insert, execute_update

bp = Blueprint('leads', __name__, url_prefix='/api/leads')

@bp.route('/', methods=['GET'])
def get_leads():
    """Get leads with filtering"""
    specialty = request.args.get('specialty', '')
    outreach_status = request.args.get('outreach_status', '')
    search = request.args.get('search', '')
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)

    # Build query dynamically
    query = "SELECT * FROM leads WHERE 1=1"
    params = []

    if specialty:
        query += " AND specialty_id = %s"
        params.append(specialty)

    if outreach_status:
        query += " AND outreach_status = %s"
        params.append(outreach_status)

    if search:
        query += " AND (doctor_name ILIKE %s OR practice_name ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    # Add pagination
    query += " ORDER BY created_date DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    leads = execute_query(query, params)

    # Get total count
    count_query = "SELECT COUNT(*) as total FROM leads WHERE 1=1"
    count_params = []

    if specialty:
        count_query += " AND specialty_id = %s"
        count_params.append(specialty)
    if outreach_status:
        count_query += " AND outreach_status = %s"
        count_params.append(outreach_status)
    if search:
        count_query += " AND (doctor_name ILIKE %s OR practice_name ILIKE %s)"
        count_params.extend([f"%{search}%", f"%{search}%"])

    total = execute_single(count_query, count_params)['total']

    return jsonify({
        'data': leads,
        'total': total,
        'limit': limit,
        'offset': offset,
    }), 200

@bp.route('/<lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Get single lead with activities"""
    query = "SELECT * FROM leads WHERE id = %s"
    lead = execute_single(query, (lead_id,))

    if not lead:
        return jsonify({'error': 'Lead not found'}), 404

    # Get activities
    activities_query = "SELECT * FROM activities WHERE lead_id = %s ORDER BY activity_date DESC"
    activities = execute_query(activities_query, (lead_id,))

    lead['activities'] = activities

    return jsonify(lead), 200

@bp.route('/', methods=['POST'])
def create_lead():
    """Create new lead"""
    data = request.json

    query = """
    INSERT INTO leads (doctor_name, practice_name, specialty_id, email, phone, website, linkedin_url, outreach_status, assigned_to, created_date, updated_date)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    RETURNING id
    """

    params = (
        data.get('doctor_name'),
        data.get('practice_name'),
        data.get('specialty_id'),
        data.get('email'),
        data.get('phone'),
        data.get('website'),
        data.get('linkedin_url'),
        data.get('outreach_status', 'Not Contacted'),
        data.get('assigned_to'),
    )

    result = execute_insert(query, params)

    return jsonify({'id': result, 'message': 'Lead created'}), 201

@bp.route('/<lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Update lead"""
    data = request.json

    query = """
    UPDATE leads SET 
        outreach_status = %s,
        next_followup_date = %s,
        updated_date = NOW()
    WHERE id = %s
    """

    params = (
        data.get('outreach_status'),
        data.get('next_followup_date'),
        lead_id,
    )

    execute_update(query, params)

    return jsonify({'message': 'Lead updated'}), 200
```

### Example Route (Priority Queue)

```python
# routes/priority_queue.py
from flask import Blueprint, jsonify
from utils.db import execute_query
from datetime import date

bp = Blueprint('priority_queue', __name__, url_prefix='/api/priority-queue')

@bp.route('/today', methods=['GET'])
def get_todays_priority():
    """Get today's priority queue"""
    
    # Get overdue follow-ups
    overdue_query = """
    SELECT l.*, a.next_followup_date as latest_followup
    FROM leads l
    LEFT JOIN activities a ON l.id = a.lead_id
    WHERE a.next_followup_date < CURRENT_DATE
    ORDER BY a.next_followup_date ASC
    """
    overdue = execute_query(overdue_query)

    # Get today's follow-ups
    today_query = """
    SELECT l.*, a.next_followup_date
    FROM leads l
    LEFT JOIN activities a ON l.id = a.lead_id
    WHERE a.next_followup_date = CURRENT_DATE
    ORDER BY a.next_followup_date ASC
    """
    today = execute_query(today_query)

    # Get LinkedIn checks due
    linkedin_query = """
    SELECT l.*, lt.check_date
    FROM leads l
    LEFT JOIN linkedin_tracking lt ON l.id = lt.lead_id
    WHERE lt.status = 'Request Sent' 
    AND lt.check_date <= CURRENT_DATE
    AND lt.status != 'Accepted'
    """
    linkedin = execute_query(linkedin_query)

    # Get email follow-ups due
    email_query = """
    SELECT l.*, et.followup_date
    FROM leads l
    LEFT JOIN email_tracking et ON l.id = et.lead_id
    WHERE et.followup_date = CURRENT_DATE
    """
    emails = execute_query(email_query)

    return jsonify({
        'overdue': {
            'count': len(overdue),
            'items': overdue,
            'priority': 1,
        },
        'today': {
            'count': len(today),
            'items': today,
            'priority': 2,
        },
        'linkedin_checks': {
            'count': len(linkedin),
            'items': linkedin,
            'priority': 3,
        },
        'email_followups': {
            'count': len(emails),
            'items': emails,
            'priority': 4,
        },
        'summary': {
            'overdue_count': len(overdue),
            'today_count': len(today),
            'linkedin_count': len(linkedin),
            'email_count': len(emails),
            'total_actions': len(overdue) + len(today) + len(linkedin) + len(emails),
        }
    }), 200
```

### Example Service (Excel Import)

```python
# utils/excel_parser.py
import pandas as pd
from utils.db import execute_query, execute_insert, execute_update

def parse_excel(file_path):
    """Parse Excel file"""
    df = pd.read_excel(file_path)
    return df.to_dict('records')

def detect_duplicates(new_records, existing_leads):
    """Detect duplicate records"""
    duplicates = []
    
    for new_record in new_records:
        for existing in existing_leads:
            # Check exact match
            if (new_record.get('doctor_name') == existing['doctor_name'] and
                new_record.get('practice_name') == existing['practice_name']):
                duplicates.append({
                    'new': new_record,
                    'existing': existing,
                    'type': 'exact',
                })
            
            # Check fuzzy match on name
            if (new_record.get('email') == existing['email']):
                duplicates.append({
                    'new': new_record,
                    'existing': existing,
                    'type': 'email',
                })

    return duplicates

def import_records(records, skip_duplicates=False):
    """Import records into database"""
    imported = 0
    skipped = 0
    errors = []

    existing_query = "SELECT id, doctor_name, practice_name, email FROM leads"
    existing_leads = execute_query(existing_query)

    duplicates = detect_duplicates(records, existing_leads)

    for record in records:
        # Check if duplicate
        is_duplicate = any(
            dup['new'].get('doctor_name') == record.get('doctor_name') and
            dup['new'].get('practice_name') == record.get('practice_name')
            for dup in duplicates
        )

        if is_duplicate and skip_duplicates:
            skipped += 1
            continue

        try:
            query = """
            INSERT INTO leads (
                doctor_name, practice_name, specialty_id, email, phone, 
                website, linkedin_url, outreach_status, created_date, updated_date
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """
            
            params = (
                record.get('doctor_name'),
                record.get('practice_name'),
                record.get('specialty_id'),
                record.get('email'),
                record.get('phone'),
                record.get('website'),
                record.get('linkedin_url'),
                'Not Contacted',
            )

            execute_insert(query, params)
            imported += 1

        except Exception as e:
            errors.append({'record': record, 'error': str(e)})
            skipped += 1

    return {
        'imported': imported,
        'skipped': skipped,
        'errors': errors,
        'duplicates': duplicates,
    }
```

---

## 3. DATABASE SCHEMA (PostgreSQL)

```sql
-- Create database
CREATE DATABASE rcm_db;

-- Specialties table
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    doctor_name VARCHAR(255) NOT NULL,
    practice_name VARCHAR(255),
    specialty_id INTEGER REFERENCES specialties(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    outreach_status VARCHAR(50) DEFAULT 'Not Contacted',
    lead_status VARCHAR(50) DEFAULT 'Not Engaged',
    assigned_to VARCHAR(100),
    next_followup_date DATE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX(specialty_id),
    INDEX(outreach_status),
    INDEX(next_followup_date),
    INDEX(created_date)
);

-- Activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50), -- 'Call', 'Email', 'LinkedIn', 'Note'
    note TEXT,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_followup_date DATE,
    
    INDEX(lead_id),
    INDEX(activity_date)
);

-- LinkedIn tracking table
CREATE TABLE linkedin_tracking (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    request_date DATE,
    status VARCHAR(50), -- 'Not Sent', 'Sent', 'Accepted', 'Not Accepted'
    check_date DATE,
    
    INDEX(lead_id),
    INDEX(status)
);

-- Email tracking table
CREATE TABLE email_tracking (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    email_address VARCHAR(255),
    sent_date TIMESTAMP,
    status VARCHAR(50), -- 'Not Sent', 'Sent', 'Opened', 'Responded'
    followup_date DATE,
    
    INDEX(lead_id),
    INDEX(sent_date)
);

-- Outreach table
CREATE TABLE outreach (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel VARCHAR(50), -- 'LinkedIn', 'Email', 'Call'
    status VARCHAR(50),
    outreach_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    followup_date DATE,
    
    INDEX(lead_id),
    INDEX(channel)
);

-- Milestones table
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    date DATE,
    target_type VARCHAR(50), -- 'Calls', 'LinkedIn', 'Emails'
    target_count INTEGER,
    completed_count INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_leads_specialty ON leads(specialty_id);
CREATE INDEX idx_leads_status ON leads(outreach_status);
CREATE INDEX idx_leads_followup ON leads(next_followup_date);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_linkedin_lead ON linkedin_tracking(lead_id);
CREATE INDEX idx_email_lead ON email_tracking(lead_id);
```

---

## 4. KEY PACKAGES & REQUIREMENTS

### Frontend (React)

```
react==18.2.0
react-dom==18.2.0
react-router-dom==6.x
axios==1.x
@tanstack/react-query==5.x
@tanstack/react-table==8.x
react-hook-form==7.x
zod==3.x
recharts==2.x
tailwindcss==3.x
socket.io-client==4.x
zustand==4.x
```

### Backend (Python)

```
# Flask
flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.0
python-socketio==5.9.0

# Database
psycopg2-binary==2.9.9

# Excel
pandas==2.1.0
openpyxl==3.1.0

# Utils
python-dotenv==1.0.0
python-dateutil==2.8.2
requests==2.31.0
```

### Frontend requirements.txt (Python)

```bash
pip install flask flask-cors flask-socketio python-socketio psycopg2-binary pandas openpyxl python-dotenv python-dateutil requests
```

---

## 5. EXAMPLE API ENDPOINTS

### Leads
```
GET    /api/leads                    - Get all leads (with filters)
GET    /api/leads/<id>               - Get single lead
POST   /api/leads                    - Create lead
PUT    /api/leads/<id>               - Update lead
DELETE /api/leads/<id>               - Delete lead
```

### Activities
```
GET    /api/leads/<id>/activities    - Get lead activities
POST   /api/activities               - Create activity/note
PUT    /api/activities/<id>          - Update activity
```

### Priority Queue
```
GET    /api/priority-queue/today     - Get today's tasks
GET    /api/priority-queue/upcoming  - Get upcoming tasks
GET    /api/priority-queue/overdue   - Get overdue tasks
```

### Outreach
```
GET    /api/linkedin                 - Get LinkedIn data
POST   /api/linkedin/<id>            - Create LinkedIn record
PUT    /api/linkedin/<id>            - Update LinkedIn status
GET    /api/email                    - Get email data
POST   /api/email                    - Create email record
```

### Import
```
POST   /api/import/excel             - Upload Excel file
GET    /api/import/status/<id>       - Get import status
POST   /api/import/confirm           - Confirm import
GET    /api/import/duplicates/<id>   - Get duplicate review
```

---

## 6. EXAMPLE ENV FILE

```bash
# .env (Backend)
DATABASE_URL=postgresql://user:password@localhost:5432/rcm_db
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# .env (Frontend - .env in React root)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 7. QUICK START GUIDE

### Step 1: Backend Setup (Python)

```bash
mkdir rcm-backend
cd rcm-backend
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Create database
psql -U postgres
CREATE DATABASE rcm_db;
\q

# Run schema
psql -U postgres rcm_db < schema.sql

# Start backend
python app.py
# Runs on http://localhost:5000
```

### Step 2: Frontend Setup (React)

```bash
npx create-react-app rcm-dashboard
cd rcm-dashboard
npm install react-router-dom axios @tanstack/react-query recharts react-hook-form tailwindcss socket.io-client

npm start
# Runs on http://localhost:3000
```

### Step 3: Test

```bash
# Test API
curl http://localhost:5000/health

# Test React
Open http://localhost:3000
```

---

## 8. IMPORTANT NOTES

### Raw SQL (No ORM)
- You write SQL directly in your routes
- Use parameterized queries to prevent SQL injection
- Use `%s` placeholders with `psycopg2`

**Example (Safe):**
```python
query = "SELECT * FROM leads WHERE specialty_id = %s"
results = execute_query(query, (specialty_id,))
```

**Bad (SQL Injection Risk):**
```python
query = f"SELECT * FROM leads WHERE specialty_id = {specialty_id}"  # DON'T DO THIS
```

### Database Connection
- Use connection pooling for production (not implemented in basic example)
- Each request opens a connection and closes it
- For high traffic, add pooling library like `pgbouncer` or `SQLAlchemy connection pooling`

### Performance Tips
- Add indexes on frequently filtered columns
- Use `LIMIT` and `OFFSET` for pagination
- Cache priority queue queries in Redis (optional)
- Use raw SQL for complex queries

---

## 9. FILE SETUP CHECKLIST

```
rcm-backend/
  ✅ app.py
  ✅ config.py
  ✅ requirements.txt
  ✅ .env
  ✅ routes/leads.py
  ✅ routes/activities.py
  ✅ routes/outreach.py
  ✅ routes/priority_queue.py
  ✅ routes/import_data.py
  ✅ utils/db.py
  ✅ utils/excel_parser.py
  ✅ utils/duplicate_detector.py
  ✅ schema.sql

rcm-dashboard/
  ✅ src/components/ (all components)
  ✅ src/pages/ (all pages)
  ✅ src/services/ (API calls)
  ✅ src/hooks/ (React hooks)
  ✅ src/store/ (State management)
  ✅ .env
  ✅ package.json
  ✅ tailwind.config.js
```

---

## FINAL STACK SUMMARY

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 (Create React App) |
| **Backend** | Python Flask |
| **Database** | PostgreSQL (Raw SQL) |
| **HTTP Client** | Axios |
| **State Management** | Zustand + React Query |
| **Forms** | React Hook Form |
| **Validation** | Zod |
| **Tables** | TanStack React Table |
| **Charts** | Recharts |
| **Styling** | Tailwind CSS |
| **Real-time** | Socket.io |
| **Database Driver** | psycopg2 |

---

Ready to start building? Let me know when you want code examples for specific components or routes! 🚀
