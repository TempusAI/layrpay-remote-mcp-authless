# Google OAuth Authentication Implementation Plan for LayrPay Remote MCP Server

## Overview

This document outlines the implementation plan for adding Google OAuth authentication to the LayrPay remote MCP server. This approach allows users to authenticate the MCP server using their Google account while maintaining the existing email/password authentication in the main LayrPay application.

## Current State Analysis

### Existing LayrPay Remote MCP Server
- **Current Authentication**: Hardcoded `LAYRPAY_USER_ID` in `wrangler.jsonc`
- **API Integration**: Uses `x-layrpay-user-id` header for LayrPay API calls
- **Architecture**: Cloudflare Worker acting as proxy to LayrPay APIs
- **Transport**: Server-Sent Events (SSE) over `/sse` endpoint

### Main LayrPay Application
- **Current Authentication**: Supabase Auth with email/password
- **Database**: User profiles stored in Supabase with LayrPay user IDs
- **No Changes Required**: This implementation doesn't require modifying the main app

## Implementation Strategy

### Core Approach
1. **LayrPay Main App**: Keep existing email/password authentication (unchanged)
2. **Remote MCP Server**: Implement Google OAuth authentication
3. **User Bridge**: Users must authenticate MCP with the same email used for LayrPay signup
4. **User ID Resolution**: Query Supabase by email to resolve Google user to LayrPay user ID

### Authentication Flow

```
1. User has existing LayrPay account (user@example.com)
2. User connects MCP client → MCP server OAuth flow
3. User authenticates with Google (same email: user@example.com)
4. MCP server receives Google access token + user profile
5. MCP server queries Supabase user_profiles by email
6. MCP server retrieves LayrPay user ID
7. MCP tools use LayrPay user ID for API calls
```

## Technical Implementation Details

### 1. Project Setup

#### Create New Google OAuth MCP Server
```bash
npm create cloudflare@latest layrpay-mcp-google-oauth -- --template=cloudflare/ai/demos/remote-mcp-google-oauth
cd layrpay-mcp-google-oauth
npm install
```

#### Additional Dependencies
Add to `package.json`:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

### 2. Environment Configuration

#### Required Secrets (via `wrangler secret put`)
```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET  
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put COOKIE_ENCRYPTION_KEY
wrangler secret put LAYRPAY_API_BASE_URL
```

#### Update `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "layrpay-mcp-google-oauth",
  "main": "src/index.ts",
  "compatibility_date": "2025-03-10",
  "compatibility_flags": ["nodejs_compat"],
  "migrations": [
    {
      "new_sqlite_classes": ["LayrPayMCP"],
      "tag": "v1"
    }
  ],
  "durable_objects": {
    "bindings": [
      {
        "class_name": "LayrPayMCP",
        "name": "MCP_OBJECT"
      }
    ]
  },
  "kv_namespaces": [
    {
      "binding": "OAUTH_KV",
      "id": "<KV-NAMESPACE-ID>"
    }
  ],
  "observability": {
    "enabled": true
  }
}
```

#### Update `worker-configuration.d.ts`
```typescript
interface Env {
  OAUTH_KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  COOKIE_ENCRYPTION_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  LAYRPAY_API_BASE_URL: string;
  MCP_OBJECT: DurableObjectNamespace<import("./src/index").LayrPayMCP>;
}
```

### 3. Core Implementation Files

#### 3.1 Props Type Definition (`src/types.ts`)
```typescript
export type Props = {
  name: string;
  email: string;
  googleAccessToken: string;
  layrpayUserId: string;  // Key addition for LayrPay integration
};
```

#### 3.2 Supabase Integration (`src/supabase-client.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

export function createSupabaseServiceClient(env: Env) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function resolveGoogleUserToLayrPayId(
  email: string, 
  env: Env
): Promise<string | null> {
  const supabase = createSupabaseServiceClient(env);
  
  const { data: userProfile, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error querying user_profiles:', error);
    return null;
  }
  
  return userProfile?.id || null;
}
```

#### 3.3 Google Handler (`src/google-handler.ts`)
```typescript
import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { type Context, Hono } from "hono";
import { fetchUpstreamAuthToken, getUpstreamAuthorizeUrl } from "./utils";
import { resolveGoogleUserToLayrPayId } from "./supabase-client";
import type { Props } from "./types";
import {
  clientIdAlreadyApproved,
  parseRedirectApproval,
  renderApprovalDialog,
} from "./workers-oauth-utils";

const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>();

app.get("/authorize", async (c) => {
  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
  const { clientId } = oauthReqInfo;
  if (!clientId) {
    return c.text("Invalid request", 400);
  }

  if (
    await clientIdAlreadyApproved(c.req.raw, oauthReqInfo.clientId, c.env.COOKIE_ENCRYPTION_KEY)
  ) {
    return redirectToGoogle(c, oauthReqInfo);
  }

  return renderApprovalDialog(c.req.raw, {
    client: await c.env.OAUTH_PROVIDER.lookupClient(clientId),
    server: {
      description: "LayrPay MCP Server with Google Authentication. Please use the same email address you used to sign up for LayrPay.",
      name: "LayrPay MCP Server",
    },
    state: { oauthReqInfo },
  });
});

app.post("/authorize", async (c) => {
  const { state, headers } = await parseRedirectApproval(c.req.raw, c.env.COOKIE_ENCRYPTION_KEY);
  if (!state.oauthReqInfo) {
    return c.text("Invalid request", 400);
  }

  return redirectToGoogle(c, state.oauthReqInfo, headers);
});

async function redirectToGoogle(
  c: Context,
  oauthReqInfo: AuthRequest,
  headers: Record<string, string> = {},
) {
  return new Response(null, {
    headers: {
      ...headers,
      location: getUpstreamAuthorizeUrl({
        clientId: c.env.GOOGLE_CLIENT_ID,
        redirectUri: new URL("/callback", c.req.raw.url).href,
        scope: "email profile",
        state: btoa(JSON.stringify(oauthReqInfo)),
        upstreamUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      }),
    },
    status: 302,
  });
}

/**
 * OAuth Callback Endpoint - KEY MODIFICATION FOR LAYRPAY
 */
app.get("/callback", async (c) => {
  // Get the oauthReqInfo out of state
  const oauthReqInfo = JSON.parse(atob(c.req.query("state") as string)) as AuthRequest;
  if (!oauthReqInfo.clientId) {
    return c.text("Invalid state", 400);
  }

  // Exchange the code for an access token
  const code = c.req.query("code");
  if (!code) {
    return c.text("Missing code", 400);
  }

  const [accessToken, googleErrResponse] = await fetchUpstreamAuthToken({
    clientId: c.env.GOOGLE_CLIENT_ID,
    clientSecret: c.env.GOOGLE_CLIENT_SECRET,
    code,
    grantType: "authorization_code",
    redirectUri: new URL("/callback", c.req.url).href,
    upstreamUrl: "https://accounts.google.com/o/oauth2/token",
  });
  
  if (googleErrResponse) {
    return googleErrResponse;
  }

  // Fetch the user info from Google
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!userResponse.ok) {
    return c.text(`Failed to fetch user info: ${await userResponse.text()}`, 500);
  }

  const { id, name, email } = (await userResponse.json()) as {
    id: string;
    name: string;
    email: string;
  };

  // CRITICAL: Resolve Google user to LayrPay user ID
  const layrpayUserId = await resolveGoogleUserToLayrPayId(email, c.env);
  
  if (!layrpayUserId) {
    return c.text(
      `User not found in LayrPay system. Please ensure you're using the same email address (${email}) that you used to sign up for LayrPay.`, 
      400
    );
  }

  // Return back to the MCP client with LayrPay user context
  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    metadata: {
      label: `${name} (${email})`,
    },
    props: {
      googleAccessToken: accessToken,
      email,
      name,
      layrpayUserId,  // This is the key addition!
    } as Props,
    request: oauthReqInfo,
    scope: oauthReqInfo.scope,
    userId: id,
  });

  return Response.redirect(redirectTo);
});

export { app as GoogleHandler };
```

#### 3.4 Main MCP Server (`src/index.ts`)
```typescript
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { GoogleHandler } from "./google-handler";
import type { Props } from "./types";

export class LayrPayMCP extends McpAgent<Env, Record<string, never>, Props> {
  server = new McpServer({
    name: "LayrPay MCP Server",
    version: "1.0.0",
  });

  async init() {
    // LayrPay API Tools - now using authenticated user context
    this.server.tool(
      "layrpay_get_info",
      "Get LayrPay server information and user context",
      {},
      async () => {
        const response = await this.makeLayrPayApiRequest('/info', 'GET');
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );

    this.server.tool(
      "layrpay_get_limits",
      "Get user spending limits with optional currency conversion",
      {
        currency: z.string().optional().describe("Currency code for conversion (e.g., 'EUR', 'GBP')")
      },
      async ({ currency }) => {
        const url = currency ? `/limits?currency=${currency}` : '/limits';
        const response = await this.makeLayrPayApiRequest(url, 'GET');
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );

    this.server.tool(
      "layrpay_validate_transaction",
      "Validate a transaction against spending limits",
      {
        amount: z.number().describe("Transaction amount"),
        currency: z.string().describe("Currency code (e.g., 'USD', 'EUR')"),
        merchant: z.string().describe("Merchant name"),
        category: z.string().optional().describe("Transaction category")
      },
      async ({ amount, currency, merchant, category }) => {
        const response = await this.makeLayrPayApiRequest('/validate-transaction', 'POST', {
          amount,
          currency,
          merchant,
          category
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );

    this.server.tool(
      "layrpay_create_virtual_card",
      "Create a virtual card for a validated transaction",
      {
        transactionId: z.string().describe("ID of the validated transaction"),
        amount: z.number().describe("Card amount limit"),
        currency: z.string().describe("Currency code"),
        merchant: z.string().describe("Merchant name for the card")
      },
      async ({ transactionId, amount, currency, merchant }) => {
        const response = await this.makeLayrPayApiRequest('/create-virtual-card', 'POST', {
          transactionId,
          amount,
          currency,
          merchant
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );

    this.server.tool(
      "layrpay_mock_checkout",
      "Simulate a checkout process with virtual card",
      {
        cardId: z.string().describe("Virtual card ID"),
        amount: z.number().describe("Checkout amount"),
        merchant: z.string().describe("Merchant name")
      },
      async ({ cardId, amount, merchant }) => {
        const response = await this.makeLayrPayApiRequest('/mock-checkout', 'POST', {
          cardId,
          amount,
          merchant
        });
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
        };
      }
    );
  }

  /**
   * Helper method to make authenticated requests to LayrPay API
   * Uses the LayrPay user ID from the authenticated user's props
   */
  private async makeLayrPayApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown
  ) {
    const url = `${this.env.LAYRPAY_API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-layrpay-user-id': this.props.layrpayUserId,  // Using authenticated user's LayrPay ID
    };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        return {
          success: response.ok,
          data: data.success ? data.data : data,
          error: !response.ok ? (data.error || { code: 'HTTP_ERROR', message: `HTTP ${response.status}` }) : undefined
        };
      }

      if (contentType.includes('text/event-stream')) {
        // Handle SSE responses for streaming validation
        const reader = response.body?.getReader();
        const events: string[] = [];
        
        if (reader) {
          const decoder = new TextDecoder();
          let done = false;
          
          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            
            if (value) {
              const chunk = decoder.decode(value);
              events.push(chunk);
            }
          }
        }

        return {
          success: true,
          data: { 
            type: 'streaming_events',
            events: events.join(''),
            message: 'Transaction validation completed with streaming events'
          }
        };
      }

      const text = await response.text();
      return {
        success: response.ok,
        data: text,
        error: !response.ok ? { code: 'HTTP_ERROR', message: `HTTP ${response.status}` } : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown network error'
        }
      };
    }
  }
}

export default new OAuthProvider({
  apiHandler: LayrPayMCP.mount("/sse") as any,
  apiRoute: "/sse",
  authorizeEndpoint: "/authorize",
  clientRegistrationEndpoint: "/register",
  defaultHandler: GoogleHandler as any,
  tokenEndpoint: "/token",
});
```

### 4. Google Cloud OAuth App Setup

#### Development Environment
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: LayrPay MCP Server (Development)
   - **Authorized JavaScript origins**: `http://localhost:8788`
   - **Authorized redirect URIs**: `http://localhost:8788/callback`

#### Production Environment
1. Create another OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: LayrPay MCP Server (Production)
   - **Authorized JavaScript origins**: `https://layrpay-mcp-google-oauth.your-subdomain.workers.dev`
   - **Authorized redirect URIs**: `https://layrpay-mcp-google-oauth.your-subdomain.workers.dev/callback`

### 5. Deployment Process

#### Local Development
```bash
# Create .dev.vars file
echo 'GOOGLE_CLIENT_ID="your-dev-client-id"' > .dev.vars
echo 'GOOGLE_CLIENT_SECRET="your-dev-client-secret"' >> .dev.vars
echo 'SUPABASE_URL="your-supabase-url"' >> .dev.vars
echo 'SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"' >> .dev.vars
echo 'LAYRPAY_API_BASE_URL="https://layrpay.vercel.app/api/mcp"' >> .dev.vars
echo 'COOKIE_ENCRYPTION_KEY="your-random-32-char-string"' >> .dev.vars

# Start development server
wrangler dev
```

#### Production Deployment
```bash
# Set production secrets
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put LAYRPAY_API_BASE_URL
wrangler secret put COOKIE_ENCRYPTION_KEY

# Create KV namespace
wrangler kv:namespace create "OAUTH_KV"
# Update wrangler.jsonc with the returned ID

# Deploy
wrangler deploy
```

## Testing Strategy

### 1. MCP Inspector Testing
```bash
# Install and run MCP Inspector
npx @modelcontextprotocol/inspector@latest

# Test local: http://localhost:8788/sse
# Test production: https://your-worker.workers.dev/sse
```

### 2. Claude Desktop Integration
Update Claude Desktop configuration:
```json
{
  "mcpServers": {
    "layrpay": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://layrpay-mcp-google-oauth.your-subdomain.workers.dev/sse"
      ]
    }
  }
}
```

### 3. Test Scenarios

#### Happy Path Testing
1. **User with matching email**:
   - LayrPay account: `user@example.com`
   - Google OAuth: `user@example.com`
   - Expected: Successful authentication and tool access

#### Error Handling Testing
1. **User with non-matching email**:
   - LayrPay account: `user@example.com`
   - Google OAuth: `different@example.com`
   - Expected: Clear error message directing user to use correct email

2. **User not in LayrPay system**:
   - Google OAuth: `newuser@example.com`
   - Expected: Error message suggesting user sign up for LayrPay first

## Security Considerations

### 1. Access Control
- **Supabase Service Role Key**: Used only for read-only user lookup by email
- **Google Access Token**: Stored in encrypted props, not exposed to client
- **Cookie Encryption**: Strong encryption key for approval state management

### 2. Data Privacy
- **Minimal Data Storage**: Only store necessary user identifiers
- **Token Scope Limitation**: Request only `email profile` from Google
- **No Persistent Storage**: User data flows through props, not stored long-term

### 3. Error Handling
- **Graceful Failures**: Clear error messages without exposing system internals
- **Logging**: Structured logging for debugging without sensitive data
- **Rate Limiting**: Consider implementing rate limiting for OAuth endpoints

## User Experience Considerations

### 1. User Onboarding
- **Clear Instructions**: Documentation explaining email requirement
- **Error Messages**: Helpful guidance when email mismatch occurs
- **Support Flow**: Process for users who need help with email matching

### 2. Authentication Flow
- **Consent Screen**: Clear explanation of what access is being granted
- **Approval Dialog**: Custom dialog explaining LayrPay connection
- **Success Feedback**: Confirmation when authentication succeeds

## Monitoring and Maintenance

### 1. Logging Strategy
```typescript
// Add structured logging throughout the application
console.log('OAuth callback received', { 
  email: email, 
  googleUserId: id,
  layrpayUserFound: !!layrpayUserId 
});
```

### 2. Error Tracking
- Monitor authentication failures
- Track email mismatch occurrences
- Alert on Supabase connection issues

### 3. Performance Monitoring
- OAuth flow completion rates
- Supabase query performance
- MCP tool execution times

## Migration Path for Future Unification

### Phase 1: Current Implementation
- MCP server uses Google OAuth
- Main LayrPay app uses email/password
- Email-based user matching

### Phase 2: Optional Google OAuth in Main App
- Add Google OAuth as sign-in option in LayrPay
- Allow account linking for existing users
- Maintain backward compatibility

### Phase 3: Full Unification
- Unified authentication across both systems
- Single sign-on experience
- Deprecate email/password (optional)

## Success Criteria

### Technical Success
- [ ] Users can authenticate MCP server with Google OAuth
- [ ] Email-based user resolution works reliably
- [ ] All LayrPay MCP tools function with authenticated user context
- [ ] Error handling provides clear user guidance
- [ ] Performance meets acceptable thresholds

### User Experience Success
- [ ] Authentication flow is intuitive and fast
- [ ] Error messages are helpful and actionable
- [ ] MCP tools work seamlessly in Claude/other clients
- [ ] Users understand email requirement

### Security Success
- [ ] No sensitive data exposed in logs or errors
- [ ] OAuth flow follows security best practices
- [ ] Supabase access is properly scoped and secured
- [ ] Token handling is secure and compliant

## Conclusion

This implementation plan provides a pragmatic approach to adding Google OAuth authentication to the LayrPay remote MCP server without requiring changes to the main LayrPay application. The email-based user matching strategy allows for immediate implementation while maintaining a clear path for future authentication unification.

The key success factor is ensuring users understand they must use the same email address for both LayrPay signup and MCP authentication. With proper error handling and user guidance, this approach provides a secure and scalable solution for authenticated MCP server access. 