# E-commerce Website Base

This is a Next.js e-commerce application designed for a specific business model where orders are not fulfilled automatically. Instead, each order is placed in a pending state, and the site owner is notified to source and process it manually.

The project is built with:
- [Next.js](https://nextjs.org) (App Router)
- [Prisma](https://prisma.io) for database access
- [SQLite](https://www.sqlite.org/index.html) as the database for local development
- [Tailwind CSS](https://tailwindcss.com) for styling

## Getting Started

Follow these steps to get the development environment running.

### 1. Clone the repository

```bash
git clone https://github.com/Azoguee/WEBSITE.git
cd WEBSITE
```

### 2. Install dependencies

This project uses `npm`. Make sure you have Node.js (v20.x or later) installed.

```bash
npm install
```

### 3. Set up the Database

This project uses Prisma to manage the database schema. The initial setup uses a local SQLite database, which requires no external services.

Run the following command to initialize the database and apply the schema:
```bash
npx prisma db push
```
*Note: This command will create a `dev.db` file in the `prisma` directory.*

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts a production server.
- `npm run lint`: Runs the ESLint linter to check for code quality issues.
- `npm run db:push`: Pushes the current Prisma schema to the database without creating a migration. Good for rapid prototyping.
- `npm run db:generate`: Generates the Prisma Client based on your schema. This is run automatically after `npm install`.