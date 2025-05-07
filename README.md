# Task Management Frontend (Next.js)

This is the frontend application for the Task Management project, built with Next.js.

## Prerequisites

*   Node.js installed (version 18 or higher recommended)
*   Access to the Task Management Backend (must be running)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ZeuxMD/task-manager-frontend.git
    cd 
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
