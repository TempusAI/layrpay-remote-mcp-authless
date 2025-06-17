# LayrPay Remote MCP Server Implementation

## Overview

This document describes the implementation of a Cloudflare Workers-based MCP (Model Context Protocol) server that acts as a proxy to LayrPay API endpoints. The server enables AI agents to interact with LayrPay's payment validation and virtual card creation services through standardized MCP tools.

## Architecture

### High-Level Architecture

```
AI Agent (Claude Desktop/Playground) 
    ↓ MCP Protocol over SSE
Cloudflare Worker (layrpay-remote-mcp.layrpayai.workers.dev)
    ↓ HTTP/SSE Requests with Auth Headers
LayrPay API (layrpay.vercel.app/api/mcp/*)
    ↓ Database Operations
Supabase (User data & transaction records)
```

### Core Components

1. **McpAgent Class**: Extends the agents framework's `McpAgent<Env>` class
2. **McpServer Instance**: Handles MCP protocol communication and tool registration
3. **Request Proxy Layer**: Manages HTTP/SSE communication with LayrPay APIs
4. **Authentication Handler**: Injects user authentication headers
5. **CORS Configuration**: Enables cross-origin requests for web-based MCP clients

### File Structure

- `src/index.ts` - Main implementation with MyMCP class and tool definitions
- `wrangler.jsonc` - Cloudflare Workers configuration with environment variables
- `worker-configuration.d.ts` - TypeScript environment interface definitions

## Environment Configuration

### Required Environment Variables

```typescript
interface Env {
    LAYRPAY_API_BASE_URL: string;  // "https://layrpay.vercel.app/api/mcp"
    LAYRPAY_USER_ID: string;       // "56cc994e-e7b1-455d-9188-0d89da1cfcf8"
}
```

These are configured in `wrangler.jsonc` under the `vars` section and deployed as Cloudflare Worker environment variables.

## Authentication Mechanism

### Current Implementation

The server uses a **hardcoded user ID** authentication approach:

- **Header**: `x-layrpay-user-id`
- **Value**: Static UUID (`56cc994e-e7b1-455d-9188-0d89da1cfcf8`)
- **Scope**: All requests to LayrPay API endpoints include this header

### Authentication Flow

1. MCP client connects to Cloudflare Worker
2. Worker receives tool invocation requests
3. Worker adds `x-layrpay-user-id` header to all LayrPay API calls
4. LayrPay API validates user ID and processes request
5. Response is proxied back through Worker to MCP client

### Future Authentication Considerations

For production implementation, the authentication mechanism should be enhanced to:

- Support dynamic user identification
- Implement proper OAuth2/JWT token validation
- Handle user session management
- Support multi-tenant scenarios

## LayrPay API Endpoints

The server proxies requests to the following LayrPay API endpoints:

### 1. Server Information (`/info`)
- **Method**: GET
- **Purpose**: Retrieve server status and configuration
- **Authentication**: User ID header required
- **Response**: Server metadata and status information

### 2. Spending Limits (`/limits`)
- **Method**: GET
- **Purpose**: Get user spending limits and current usage
- **Parameters**: Optional `currency` query parameter for conversion
- **Authentication**: User ID header required
- **Response**: Limit configurations and usage statistics

### 3. Transaction Validation (`/validate-transaction`)
- **Method**: POST
- **Purpose**: Validate transactions against spending limits
- **Content-Type**: `application/json`
- **Response Types**:
  - **JSON**: Auto-approved transactions
  - **SSE Stream**: Transactions requiring user approval
- **Authentication**: User ID header required

### 4. Virtual Card Creation (`/create-virtual-card`)
- **Method**: POST
- **Purpose**: Create virtual payment cards for validated transactions
- **Content-Type**: `application/json`
- **Authentication**: User ID header required
- **Response**: Virtual card details and metadata

### 5. Mock Checkout (`/mock-checkout`)
- **Method**: POST
- **Purpose**: Simulate checkout process with virtual card
- **Content-Type**: `application/json`
- **Authentication**: User ID header required
- **Response**: Checkout simulation results

## MCP Tools Implementation

The server exposes 5 MCP tools that correspond to the LayrPay API endpoints:

1. **`layrpay_get_info`** - Server information retrieval
2. **`layrpay_get_limits`** - Spending limits with optional currency conversion
3. **`layrpay_validate_transaction`** - Transaction validation with streaming support
4. **`layrpay_create_virtual_card`** - Virtual card creation
5. **`layrpay_mock_checkout`** - Checkout simulation

Each tool includes comprehensive Zod schema validation for input parameters and returns structured JSON responses.

## Request/Response Handling

### HTTP Response Processing

The implementation handles multiple content types:

- **`application/json`**: Standard API responses
- **`text/event-stream`**: Server-Sent Events for real-time updates
- **Fallback**: Plain text responses

### Error Handling

Standardized error response format:
```typescript
{
    success: boolean;
    data?: unknown;
    error?: {
        code: string;
        message: string;
    };
}
```

Common error codes:
- `HTTP_ERROR`: HTTP status-based errors
- `NETWORK_ERROR`: Network connectivity issues
- `STREAMING_ERROR`: SSE stream processing errors

## Routing Architecture

### Critical Implementation Detail

The server uses **explicit routing** rather than spread operators for endpoint handling:

```typescript
export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url);
        
        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            return MyMCP.serveSSE("/sse", { corsOptions }).fetch(request, env, ctx);
        }
        
        if (url.pathname === "/mcp") {
            return MyMCP.serve("/mcp", { corsOptions }).fetch(request, env, ctx);
        }
        
        return new Response("Not found", { status: 404 });
    }
};
```

**Important**: Using spread operators (`...MyMCP.serveSSE()`) breaks the routing mechanism and causes connection failures. The explicit routing pattern is required for proper endpoint handling.

## CORS Configuration

Cross-Origin Resource Sharing is configured for both endpoints:

```typescript
corsOptions: {
    origin: "*",
    methods: "GET, POST, OPTIONS",
    headers: "Content-Type, Authorization, X-Requested-With",
    maxAge: 86400
}
```

This enables the server to be accessed from web-based MCP clients and development environments.

## Deployment

### Cloudflare Workers Deployment

- **URL**: `https://layrpay-remote-mcp.layrpayai.workers.dev`
- **SSE Endpoint**: `https://layrpay-remote-mcp.layrpayai.workers.dev/sse`
- **MCP Endpoint**: `https://layrpay-remote-mcp.layrpayai.workers.dev/mcp`

### Environment Variables

Configured in `wrangler.jsonc` and automatically deployed with the Worker:
- `LAYRPAY_API_BASE_URL`
- `LAYRPAY_USER_ID`

## Connection Endpoints

### MCP Client Configuration

For Claude Desktop or other MCP clients:
```json
{
    "mcpServers": {
        "layrpay": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-everything"],
            "env": {
                "MCP_SERVER_URL": "https://layrpay-remote-mcp.layrpayai.workers.dev/sse"
            }
        }
    }
}
```

### Direct SSE Connection

For development and testing:
```
https://layrpay-remote-mcp.layrpayai.workers.dev/sse
```

## Troubleshooting Notes

### Routing vs CORS Issues

During implementation, connection failures were initially attributed to CORS configuration. However, the root cause was incorrect export structure using spread operators instead of explicit routing. The key lesson is that `MyMCP.serveSSE()` and `MyMCP.serve()` methods must be called explicitly with proper routing logic rather than being spread into the default export.

### Common Issues

1. **NetworkError**: Usually indicates routing problems, not CORS issues
2. **405 Method Not Allowed**: Normal for direct GET requests to SSE endpoints
3. **Connection Timeouts**: Check environment variable configuration

## Security Considerations

### Current Limitations

- Hardcoded user authentication
- No request rate limiting
- Open CORS policy (`origin: "*"`)

### Recommended Enhancements

- Implement proper user authentication and authorization
- Add request rate limiting and abuse prevention
- Restrict CORS origins to known domains
- Add request logging and monitoring
- Implement API key rotation mechanisms

## Integration Guidelines

### For AI Agents

When implementing similar MCP servers:

1. Use explicit routing patterns for endpoint handling
2. Implement proper error handling for multiple content types
3. Include comprehensive input validation with Zod schemas
4. Configure CORS appropriately for target clients
5. Handle both synchronous and asynchronous response patterns (JSON vs SSE)

### For LayrPay API Extensions

When adding new endpoints:

1. Add corresponding environment variables for new API endpoints
2. Implement new tool definitions with proper Zod schemas
3. Update the routing logic if new paths are required
4. Maintain consistent error handling patterns
5. Document authentication requirements for new endpoints 