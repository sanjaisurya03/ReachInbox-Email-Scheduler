# ReachInbox - Email Automation Platform

ReachInbox is a full-stack email automation and scheduling platform for creating email campaigns, uploading recipient lists, scheduling emails, and monitoring delivery status.

## Features

- User registration and login
- JWT authentication
- Google OAuth integration
- Create and manage email campaigns
- Upload recipient lists using CSV or TXT files
- Bulk recipient processing
- Email scheduling
- Configurable delay between emails
- Configurable hourly email limit
- Automatic email sending
- Email status tracking
- Campaign pause and resume
- Campaign deletion
- Sender SMTP configuration
- Dashboard email statistics
- BullMQ background job processing
- Redis queue integration
- Elasticsearch integration
- Slack notification support

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- JWT
- Google OAuth
- Elasticsearch

## Project Structure

```text
ReachInbox-Email-Scheduler/
├── frontend/
│   └── src/
├── backend/
│   ├── src/
│   └── prisma/
├── .gitignore
├── .env.example
└── README.md
```

## Requirements

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Redis
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/reachinbox-email-scheduler.git
cd reachinbox-email-scheduler
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/reachinbox"
JWT_SECRET="your_jwt_secret"
REDIS_HOST="localhost"
REDIS_PORT=6379
PORT=5000
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
ELASTICSEARCH_URL="http://localhost:9200"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

BullMQ dashboard:

```text
http://localhost:5000/admin/queues
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Email Campaign Workflow

```text
User Login
    ↓
Create Campaign
    ↓
Enter Subject & Message
    ↓
Upload CSV/TXT Recipient List
    ↓
Select Sender
    ↓
Configure Start Time
    ↓
Configure Email Delay
    ↓
Configure Hourly Limit
    ↓
Schedule Campaign
    ↓
Create Email Records
    ↓
Add Jobs to BullMQ
    ↓
Redis Queue
    ↓
Email Worker
    ↓
SMTP Server
    ↓
Recipient
    ↓
Update Email Status
```

## Recipient File Format

### TXT

One email address per line:

```text
test1@gmail.com
test2@gmail.com
test3@gmail.com
```

### CSV

```csv
email
test1@gmail.com
test2@gmail.com
test3@gmail.com
```

The application validates and processes the recipient list before scheduling emails.

## Email Scheduling

Each campaign supports:

- Start time
- Delay between emails
- Hourly email limit

Example:

```text
Start Time: 6:00 PM
Delay: 2000 ms
Hourly Limit: 200
```

Emails can then be scheduled approximately as:

```text
Email 1 → 6:00:00 PM
Email 2 → 6:00:02 PM
Email 3 → 6:00:04 PM
```

## Email Status

Emails can have the following statuses:

```text
SCHEDULED
PROCESSING
SENT
FAILED
```

The dashboard displays:

- Total Emails
- Sent
- Scheduled
- Failed

## Database

The project uses PostgreSQL with Prisma ORM.

Main models:

```text
User
Campaign
Sender
Email
SlackConnection
```

Relationships:

```text
User
├── Campaigns
│   └── Emails
├── Senders
│   └── Emails
└── SlackConnection
```

## Security

The application uses:

- JWT authentication
- Password hashing
- Protected API routes
- User-specific campaign access
- User-specific sender access
- Environment variables for secrets
- SMTP credentials outside source code

## Testing Checklist

Before deployment, test:

- User registration
- User login
- Campaign creation
- CSV upload
- TXT upload
- Multiple recipients
- Future scheduling
- Email delay
- Hourly email limit
- Email sending
- Failed email handling
- Pause campaign
- Resume campaign
- Delete campaign
- Dashboard statistics

## Current Status

The core email scheduling workflow is implemented and working, including campaign creation, recipient upload, bulk scheduling, queue processing, automatic email sending, email status updates, and dashboard statistics.

## Environment Variables

Do not commit `.env` files or real credentials.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
*.log
.vscode/
.idea/
.DS_Store
Thumbs.db
```

## Author

**Sanjai Surya V V**

B.Tech Computer Science and Engineering  
SRM Institute of Science and Technology

## License

This project is developed for educational and project purposes.
