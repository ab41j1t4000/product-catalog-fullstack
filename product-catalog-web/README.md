# Product Catalog Web

React frontend for the product catalog MVP. It consumes the Fastify API for catalog search, account sign-in, and mock payment checkout, while keeping the cart lean in local state for fast iteration.

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- CSS with a custom responsive layout

## Features

- Product listing with text search and category filters
- Product detail page
- Local cart with quantity updates and persistence
- Email-based sign-in connected to the API
- Checkout view wired to the backend payment endpoint

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Point the app at the API:

```bash
echo 'VITE_API_URL=http://localhost:4000' > .env.local
```

3. Start the frontend:

```bash
npm run dev
```

The web app will run on `http://localhost:5173`.

## Build

```bash
npm run build
```

## Notes

- Authentication is token-based and stored in local storage for this MVP.
- Cart state is client-side to keep the interaction fast and the backend surface small.
