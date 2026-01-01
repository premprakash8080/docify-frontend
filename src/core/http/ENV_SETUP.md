# Environment Setup Guide

## Overview

The HTTP service uses environment variables to determine the API base URL for different environments (development, staging, production).

## Environment Files

### Development (Local)
Create `.env.local` in the project root:

```env
# Local Development API
VITE_API_BASE_URL=http://127.0.0.1:2018/api
VITE_API_TIMEOUT=30000
```

### Production
Create `.env.production` in the project root:

```env
# Production API
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT=30000
```

### Staging (Optional)
Create `.env.staging`:

```env
# Staging API
VITE_API_BASE_URL=https://staging-api.yourdomain.com/api
VITE_API_TIMEOUT=30000
```

## How It Works

1. **Development Mode** (`npm run dev`):
   - Uses `.env.local` if exists
   - Falls back to default: `http://127.0.0.1:2018/api`

2. **Production Build** (`npm run build`):
   - Uses `.env.production`
   - **Required**: Must set `VITE_API_BASE_URL` for production

3. **Priority Order**:
   - Environment variable (`VITE_API_BASE_URL`)
   - Development default (`http://127.0.0.1:2018/api`)
   - Fallback (same as dev default)

## Vite Environment Variables

- Must be prefixed with `VITE_` to be exposed to client code
- Available via `import.meta.env.VITE_API_BASE_URL`
- `.env.local` is gitignored (for local secrets)
- `.env.production` should be set in CI/CD

## Example Usage

```typescript
// The HttpService automatically uses the correct base URL
import httpService from '@/core/http';

// This will call: http://127.0.0.1:2018/api/users (dev)
// or: https://api.yourdomain.com/api/users (production)
const users = await httpService.get('/users');
```

## Verification

Check which API URL is being used:

```typescript
import { apiConfig } from '@/core/http';

console.log('API Base URL:', apiConfig.baseURL);
console.log('Environment:', apiConfig.environment);
```

