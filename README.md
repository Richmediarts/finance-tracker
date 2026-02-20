# Finance Tracker

A self-hosted personal budgeting app built with Next.js, PostgreSQL, and Prisma.

## Features

- **Dashboard**: View net worth, income, expenses, and savings rate at a glance
- **Accounts**: Manage bank accounts, credit cards, cash, investments
- **Transactions**: Track income and expenses with categorization
- **Budgets**: Set spending limits by category (envelope budgeting)
- **Savings Goals**: Save for large purchases with progress tracking
- **Debt Tracker**: Pay down debt with snowball/avalanche methods
- **Investments**: Track portfolio value and performance
- **Partner Collaboration**: Share accounts and budgets with household members

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials
- **Charts**: Recharts

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker (optional, for containerized deployment)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/finance-tracker.git
cd finance-tracker

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# 4. Initialize database
npx prisma migrate dev

# 5. Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t finance-tracker .
docker run -p 3000:3000 finance-tracker
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| NEXTAUTH_SECRET | Secret for NextAuth | Required |
| NEXTAUTH_URL | App URL | http://localhost:3000 |

## Default Categories

The app creates these default categories on first run:
- Income
- Food & Dining
- Transportation
- Housing
- Utilities
- Entertainment
- Shopping
- Healthcare
- Personal
- Other

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/*` | * | NextAuth routes |
| `/api/accounts` | GET, POST | Manage accounts |
| `/api/transactions` | GET, POST | Manage transactions |
| `/api/budgets` | GET, POST | Manage budgets |
| `/api/goals` | GET, POST | Manage savings goals |
| `/api/debts` | GET, POST | Manage debts |
| `/api/investments` | GET, POST | Manage investments |
| `/api/categories` | GET, POST | Manage categories |
| `/api/dashboard` | GET | Dashboard summary |

## Screenshots

![Dashboard](./docs/dashboard.png)

## License

MIT
