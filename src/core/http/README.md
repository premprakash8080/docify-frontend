# HTTP Service - Angular HttpClient-like API

## Overview

Centralized HTTP service implementation similar to Angular's HttpClient, with environment-based API URL configuration and automatic interceptor handling.

## Architecture

```
src/core/http/
├── apiConfig.ts        # Environment-based API URL resolver
├── httpClient.ts       # Axios instance + interceptors
├── httpService.ts      # Wrapper methods (get/post/put/delete/patch)
├── httpTypes.ts        # TypeScript interfaces
└── index.ts            # Barrel exports
```

## Environment Configuration

### Development (Local)
- Default URL: `http://127.0.0.1:2018/api`
- Configure via `.env.local`:
  ```env
  VITE_API_BASE_URL=http://127.0.0.1:2018/api
  VITE_API_TIMEOUT=30000
  ```

### Production
- Set via `.env.production`:
  ```env
  VITE_API_BASE_URL=https://api.yourdomain.com/api
  VITE_API_TIMEOUT=30000
  ```

## Usage

### Basic Example

```typescript
import httpService from '@/core/http';
import type { User } from '@/types';

// GET request
const users = await httpService.get<User[]>('/users');

// POST request
const newUser = await httpService.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await httpService.put<User>('/users/1', {
  name: 'Jane Doe'
});

// DELETE request
await httpService.delete('/users/1');
```

### With Custom Options

```typescript
// Disable loader for background requests
const data = await httpService.get('/users', { showLoader: false });

// With query parameters (via URL)
const filtered = await httpService.get('/users?status=active');

// With custom headers
const response = await httpService.post('/users', data, {
  headers: { 'X-Custom-Header': 'value' }
});
```

### Feature Service Example

```typescript
import httpService from '@/core/http';
import type { User, ApiResponse } from '@/types';

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await httpService.get<User[]>('/users');
    // Handle both response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<User[]>).data;
  }

  async createUser(user: Partial<User>): Promise<User> {
    const response = await httpService.post<{ user: User }>('/users', user);
    return (response.data as ApiResponse<{ user: User }>).data.user;
  }
}

export default new UserService();
```

## Features

### Automatic Features
- ✅ Auth token attachment (from localStorage)
- ✅ Global loader management
- ✅ Error handling (401/403 auto-logout)
- ✅ Environment-based URL resolution
- ✅ Type-safe requests/responses

### Interceptors

**Request Interceptor:**
- Attaches `Authorization: Bearer <token>` header
- Shows global loader (if `showLoader !== false`)

**Response Interceptor:**
- Hides loader on success/error
- Handles 401 → auto-logout and redirect
- Transforms errors to consistent format

## Angular → React Mapping

| Angular | React |
|---------|-------|
| `HttpClient.get<T>()` | `httpService.get<T>()` |
| `HttpClient.post<T>()` | `httpService.post<T>()` |
| `HttpClient.put<T>()` | `httpService.put<T>()` |
| `HttpClient.delete<T>()` | `httpService.delete<T>()` |
| `HttpInterceptor` | Axios interceptors |
| `environment.apiUrl` | `apiConfig.baseURL` |

## Error Handling

```typescript
try {
  const user = await httpService.get<User>('/users/1');
} catch (error) {
  // error is HttpErrorResponse
  console.error(error.msg); // Error message
  console.error(error.status); // HTTP status code
  console.error(error.errors); // Validation errors (if any)
}
```

## Best Practices

1. **Always use HttpService** - Never use Axios directly in components/slices
2. **Type your responses** - Use TypeScript generics: `httpService.get<User[]>('/users')`
3. **Handle both response formats** - API may return `{ success, data }` or direct array/object
4. **Disable loader for background requests** - Use `{ showLoader: false }` for silent updates

