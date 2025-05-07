# Task Management Frontend (Next.js)

This is the frontend application for the Task Management project, built with Next.js.

## Prerequisites

*   Node.js installed (version 18 or higher recommended)
*   Access to the Task Management Backend (must be running)

## Technologies Used

This frontend application is built using the following core technologies:

*   **Next.js**: v15.3.1
*   **React**: v19.0.0
*   **Redux Toolkit**: v2.7.0
*   **React Redux**: v9.2.0
*   **TypeScript**: v5
*   **Tailwind CSS**: v4.1.4
*   **Shadcn/ui**:
*   **Lucide Icons**: v0.503.0
*   **Date-fns**: v4.1.0

*(Note: This list focuses on the main technologies. The `package.json` includes other dependencies for specific UI components, styling utilities, etc.)*

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ZeuxMD/task-manager-frontend.git
    cd task-manager-frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**

    Create a file named `.env.local` in the root of the project.

    ```bash
    touch .env.local
    ```

    Open `.env.local` and add the following line, replacing `http://localhost:3333` with the actual URL of your running backend server:

    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
    ```

4.  **Run the Development Server:**

    Before running the frontend, **ensure your Task Management Backend is running and accessible** at the URL specified in your `.env.local` file.

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) (or the port your Next.js app runs on) in your browser to see the result.

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Deployment

Follow the [Next.js deployment guide](https://nextjs.org/docs/pages/getting-started/deploying) for your preferred hosting provider. Ensure your NEXT_PUBLIC_BACKEND_URL environment variable is correctly configured in your production environment settings.

## TODO
- [ ] move jwt from localStorage to HTTP-only
- [ ] create a route for managing task operations
- [x] separate client components from pages
