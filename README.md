# Role-Based Employee Wizard

A Next.js application for managing employee information with a role-based multi-step wizard form. This is a test/demo project that uses json-server as a mock backend.

## Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

## Getting Started

This project requires both the frontend (Next.js) and backend (json-server) to run locally.

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy the `env.example` file to `.env.local`:

```bash
cp env.example .env.local
```

Or manually create a `.env.local` file in the root directory with the following content:

```bash
NEXT_PUBLIC_BASIC_INFO_API=http://localhost:4001
NEXT_PUBLIC_DETAILS_INFO_API=http://localhost:4002
```

### 3. Run the Backend Servers (Required!)

The application uses json-server to mock the backend API. You need to run **both** mock servers in separate terminal windows:

**Terminal 1 - Step 1 API (departments & basic info):**
```bash
npm run mock:step1
```
This will start json-server on port 4001 serving `db-step1.json`

**Terminal 2 - Step 2 API (locations & details):**
```bash
npm run mock:step2
```
This will start json-server on port 4002 serving `db-step2.json`

### 4. Run the Development Server

In a third terminal window:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Important Notes

⚠️ **The application will not work without running the backend servers!**

If you see fetch errors or network failures, make sure both json-server instances are running:
- `npm run mock:step1` (port 4001)
- `npm run mock:step2` (port 4002)

## Project Structure

- `/app` - Next.js app router pages
- `/components` - React components
- `/services/api` - API service layer
- `/types` - TypeScript type definitions
- `/utils` - Utility functions
- `db-step1.json` - Mock database for Step 1 (departments, basic info)
- `db-step2.json` - Mock database for Step 2 (locations, details)

## Available Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run mock:step1` - Start json-server for Step 1 API (port 4001)
- `npm run mock:step2` - Start json-server for Step 2 API (port 4002)
- `npm test` - Run tests

## Features

- Multi-step wizard form with role-based fields
- Autocomplete components for departments and locations
- Employee data table with pagination
- Form validation
- Mock API integration with json-server

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [json-server](https://github.com/typicode/json-server) - mock REST API
- [React Documentation](https://react.dev) - learn about React
