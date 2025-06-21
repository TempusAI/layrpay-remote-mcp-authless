# LayrPay Supabase Authentication Integration Guide

> **For Remote MCP Server Implementation**
> 
> This document provides comprehensive details about LayrPay's Supabase authentication setup to enable proper integration with the remote MCP server hosted on Cloudflare.

## Overview

LayrPay uses Supabase Auth with a sophisticated server-side rendering (SSR) implementation that manages user sessions via secure HTTP-only cookies. The authentication system supports multiple providers and includes a comprehensive onboarding flow.

## Current Authentication Architecture

### Core Components

1. **Supabase SSR Package**: Uses `@supabase/ssr` for server-side authentication
2. **Cookie-Based Sessions**: Secure HTTP-only cookies with automatic refresh
3. **Multiple Auth Providers**: Email/password, Google OAuth, Apple OAuth
4. **Comprehensive Middleware**: Route protection and session validation
5. **Integrated Onboarding**: Multi-step user registration process

### Environment Variables

```bash
# Required for MCP server integration
NEXT_PUBLIC_SUPABASE_URL=https://iauxyyycqcuoswxjyhff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (for bypassing RLS)
```

**Note**: The MCP server will need the service role key to perform OAuth operations and bypass Row Level Security (RLS).

## Authentication Flow Patterns

### 1. Standard Authentication Actions

LayrPay uses Server Actions for authentication with consistent patterns:

**Sign In Pattern**:
```typescript
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect_to") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // OAuth redirect support
  if (redirectTo) {
    return redirect(redirectTo);
  }

  return redirect("/protected");
};
```

**OAuth Pattern**:
```typescript
export const signInWithGoogleAction = async (formData: FormData) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const redirectTo = formData.get("redirect_to") as string;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo ? 
        `${origin}/auth/callback?redirect_to=${encodeURIComponent(redirectTo)}` : 
        `${origin}/auth/callback`,
    },
  });
};
```

### 2. OAuth Callback Handling

**Callback Route** (`/auth/callback`):
```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  return NextResponse.redirect(`${origin}/protected`);
}
```

### 3. Session Management

**Server-Side Client Creation**:
```typescript
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Handle Server Component cookie setting
          }
        },
      },
    },
  );
};
```

**Service Role Client** (for MCP OAuth operations):
```typescript
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
```

## User Management & Onboarding

### Onboarding Flow

LayrPay has a sophisticated 3-step onboarding process:

1. **User Details** (`/onboarding/user-details`) - Profile completion
2. **Funding Source** (`/onboarding/funding-source`) - Payment method setup
3. **Success** (`/onboarding/success`) - Completion confirmation

### Onboarding Status Tracking

```typescript
// Middleware checks onboarding completion
const { data: onboardingStatus } = await supabase
  .from("onboarding_status")
  .select("*")
  .eq("user_id", user.id)
  .single();

// Redirect logic based on completion status
if (!onboardingStatus?.onboarding_completed) {
  if (!onboardingStatus?.profile_completed) {
    return NextResponse.redirect(new URL("/onboarding/user-details", request.url));
  } else if (!onboardingStatus.funding_source_added) {
    return NextResponse.redirect(new URL("/onboarding/funding-source", request.url));
  }
}
```

### Database Schema (Key Tables)

**User Profiles**:
```sql
-- user_profiles table structure
{
  id: UUID (references auth.users.id),
  email: TEXT,
  first_name: TEXT,
  last_name: TEXT,
  phone_number: TEXT,
  date_of_birth: DATE,
  address_line1: TEXT,
  address_line2: TEXT,
  city: TEXT,
  state_province: TEXT,
  country: TEXT,
  postal_code: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Onboarding Status**:
```sql
-- onboarding_status table structure
{
  id: UUID,
  user_id: UUID (references auth.users.id),
  profile_completed: BOOLEAN,
  funding_source_added: BOOLEAN,
  onboarding_completed: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

## Middleware & Route Protection

### Session Validation Pattern

```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Handle cookie setting
        },
      },
    },
  );

  // Session refresh
  const { data: { session } } = await supabase.auth.getSession();

  // Route protection logic
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}
```

### Protected Routes

- `/dashboard/*` - Main application
- `/onboarding/*` - User setup flow
- `/protected/*` - Legacy protected routes

## MCP Integration Requirements

### For Remote MCP Server Implementation

1. **OAuth Provider Setup**: Create custom OAuth provider that validates against LayrPay Supabase
2. **Token Validation**: Implement JWT validation using Supabase service role
3. **User Context**: Extract user information from validated sessions
4. **Scope Management**: Define MCP-specific permissions
5. **Onboarding Integration**: Handle redirect to LayrPay onboarding for new users

### Recommended OAuth Flow

```typescript
// MCP OAuth flow integration
const mcpOAuthFlow = {
  // 1. Client registration endpoint
  registerClient: "/api/oauth/register",
  
  // 2. Authorization endpoint with LayrPay redirect
  authorize: "/api/oauth/authorize?redirect_to=https://layrpay.vercel.app/onboarding/user-details",
  
  // 3. Token exchange endpoint
  token: "/api/oauth/token",
  
  // 4. Token validation for MCP requests
  validate: "/api/oauth/validate"
};
```

### Required Database Extensions

For the remote MCP server, you'll need these additional tables in the LayrPay Supabase instance:

```sql
-- OAuth client registrations
CREATE TABLE mcp_oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE NOT NULL,
  client_secret_hash TEXT,
  name TEXT NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  grant_types TEXT[] DEFAULT ARRAY['authorization_code'],
  scopes TEXT[] NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth authorization sessions
CREATE TABLE mcp_oauth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authorization_code TEXT UNIQUE,
  code_challenge TEXT,
  code_challenge_method TEXT,
  client_id TEXT REFERENCES mcp_oauth_clients(client_id),
  user_id UUID REFERENCES auth.users(id),
  scopes TEXT[] NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth access tokens
CREATE TABLE mcp_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT UNIQUE NOT NULL,
  client_id TEXT REFERENCES mcp_oauth_clients(client_id),
  user_id UUID REFERENCES auth.users(id),
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

### Current Security Measures

1. **Row Level Security (RLS)**: Enabled on all user tables
2. **Service Role Usage**: For system operations that bypass RLS
3. **Cookie Security**: HTTP-only, SameSite, Secure flags
4. **Session Refresh**: Automatic token refresh in middleware
5. **CSRF Protection**: Built into Supabase Auth

### For MCP Implementation

1. **PKCE Flow**: Implement OAuth 2.1 with PKCE for security
2. **Token Expiry**: Short-lived access tokens (15-60 minutes)
3. **Scope Validation**: Granular permission checking
4. **Rate Limiting**: Protect OAuth endpoints
5. **Audit Logging**: Track all MCP authentication events

## Integration Endpoints

The remote MCP server should implement these endpoints to integrate with LayrPay:

### OAuth Endpoints

1. **`POST /oauth/register`** - Dynamic client registration
2. **`GET /oauth/authorize`** - Authorization endpoint with LayrPay redirect
3. **`POST /oauth/token`** - Token exchange endpoint
4. **`POST /oauth/validate`** - Token validation for internal use

### MCP Endpoints

1. **`POST /mcp/server`** - Main MCP endpoint with OAuth validation
2. **`GET /mcp/info`** - Server capabilities (public)
3. **`GET /.well-known/oauth-authorization-server`** - OAuth discovery

## Error Handling Patterns

### Authentication Errors

```typescript
// Follow LayrPay's error handling pattern
if (error) {
  return encodedRedirect("error", "/sign-in", error.message);
}

// For API responses
return Response.json({ 
  error: 'authentication_required',
  message: 'Valid access token required',
  redirect_to: 'https://layrpay.vercel.app/sign-in'
}, { status: 401 });
```

### Onboarding Redirects

```typescript
// Handle incomplete onboarding
if (!onboardingStatus?.onboarding_completed) {
  return Response.json({
    error: 'onboarding_required',
    message: 'Please complete LayrPay onboarding',
    redirect_to: 'https://layrpay.vercel.app/onboarding/user-details'
  }, { status: 403 });
}
```

## Testing & Validation

### OAuth Flow Testing

The LayrPay codebase includes OAuth testing utilities:

```javascript
// Test OAuth client registration
node scripts/test-oauth-client.js https://your-mcp-server.com

// Expected flow:
// 1. Register OAuth client
// 2. Generate authorization URL with PKCE
// 3. Redirect to LayrPay for authentication
// 4. Exchange code for tokens
// 5. Validate token for MCP requests
```

### User Context Validation

```typescript
// Validate user has completed onboarding
async function validateMCPUser(userId: string): Promise<UserValidation> {
  const supabase = getSupabaseClient();
  
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();
    
  const { data: onboarding } = await supabase
    .from("onboarding_status")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  return {
    hasProfile: !!profile,
    onboardingComplete: onboarding?.onboarding_completed || false,
    canAccessMCP: !!(profile && onboarding?.onboarding_completed)
  };
}
```

## Next Steps for Implementation

1. **Set up Supabase connection** in the MCP server using service role
2. **Implement OAuth provider** following LayrPay patterns
3. **Create OAuth database tables** in LayrPay Supabase instance
4. **Build authorization flow** with LayrPay onboarding integration
5. **Implement token validation** for MCP requests
6. **Add scope-based permissions** for different MCP tools
7. **Test end-to-end flow** with Claude Desktop

## Support & Resources

- **LayrPay Application**: https://layrpay.vercel.app
- **Supabase Project**: iauxyyycqcuoswxjyhff
- **OAuth Test Script**: Available in LayrPay repository
- **Database Schema**: Full schema available in documentation/database/

---

*This document provides the comprehensive authentication context needed to implement OAuth integration between the remote MCP server and LayrPay's Supabase authentication system.* 