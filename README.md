# KyoSHOP

**KyoSHOP – Smart Pending Orders, Trusted Fulfillment**

> *KyoSHOP is a modern e-commerce platform designed for pending-order workflows. Orders are captured, verified, and fulfilled manually to ensure accuracy and customer trust.*

This is a starter e-commerce application built with Next.js and Prisma. It is designed to be a solid foundation for a custom online store, with a focus on a stable and maintainable codebase.

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database ORM**: [Prisma](https://prisma.io)
- **Database**: [SQLite](https://www.sqlite.org/index.html) for local development
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

---

## Getting Started

Follow these steps to get the development environment up and running.

### 1. Clone the Repository

```bash
git clone https://github.com/Azoguee/WEBSITE.git
cd WEBSITE
```

### 2. Install Dependencies

This project uses `npm` for package management. Make sure you have Node.js (v18.x or v20.x) installed.

```bash
npm install
```

### 3. Set Up the Database

The project is configured to use a local SQLite database for simplicity. To initialize the database and apply the schema, run:

```bash
npx prisma db push
```
*Note: This command will create a `dev.db` file in the `prisma/` directory based on the schema.*

### 4. Run the Development Server

Once the dependencies are installed and the database is set up, you can start the development server:

```bash
npm run dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## Deployment & Build Strategy Notes

### React 18 Versioning for Stability

To ensure maximum stability and prevent unexpected build failures from dependency updates, this project uses **pinned (exact) versions** for React and its related type definitions in `package.json`. For example:

```json
"react": "18.3.1",
"react-dom": "18.3.1",
"@types/react": "18.3.26",
"@types/react-dom": "18.3.7"
```

This strategy prevents `npm install` from fetching newer, potentially incompatible patch or minor versions, leading to more reliable and reproducible builds across different environments.

### Continuous Integration (CI) on Vercel

For deploying to Vercel or any other CI/CD environment, it is highly recommended to use `npm ci` instead of `npm install`.

**`npm ci`** provides faster, more reliable builds by installing dependencies directly from the `package-lock.json` file. This ensures that the exact same dependency versions are used in both your local and CI environments.

**Recommended Vercel Build Command:**

```
npm ci && npm run build
```

This can be set in your Vercel project's "Build & Development Settings".

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server after a build.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run db:push`: Applies schema changes directly to the database (ideal for development).
- `npm run postinstall`: Generates the Prisma Client automatically after an install.