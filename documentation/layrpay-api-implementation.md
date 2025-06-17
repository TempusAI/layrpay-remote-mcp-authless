# LayrPay API Implementation Guide

## Overview

This document provides a comprehensive overview of the LayrPay MCP (Model Context Protocol) API endpoints that enable AI agents to perform secure financial transactions through virtual card creation and management. The API is designed to be proxied by a remote MCP server, providing a secure layer between AI agents and the core LayrPay infrastructure.

## Architecture Overview

### MCP Integration Pattern

LayrPay's API follows a **proxy-based MCP architecture** where:

1. **AI Agents** make tool calls to the **Remote MCP Server**
2. **Remote MCP Server** proxies requests to **LayrPay MCP Endpoints** (`/api/mcp/*`)
3. **LayrPay MCP Endpoints** handle business logic and return structured responses
4. **Responses** flow back through the proxy to the AI agent

```
AI Agent → Remote MCP Server → LayrPay MCP Endpoints → Supabase/Stripe → Response
```

### Core Design Principles

- **Stateless Operations**: Each endpoint is self-contained with no session dependencies
- **Secure by Default**: All endpoints require authentication via Supabase JWT
- **Transactional Integrity**: Database operations use transactions for consistency
- **Real-time Authorization**: SSE streaming for user approval workflows
- **Audit Trail**: Complete logging of all financial operations

### Authentication & Security

All MCP endpoints use consistent authentication patterns:
- **JWT Validation**: Supabase JWT tokens in request headers
- **User ID Extraction**: Automatic user identification from token
- **RLS Enforcement**: Row-level security policies ensure data isolation
- **Request Validation**: Comprehensive input validation on all endpoints

## MCP Endpoints Reference

### 1. Server Information (`/api/mcp/info`)

**Purpose**: Provides metadata about the MCP server and available endpoints
**Method**: `GET`
**Authentication**: Not required

Returns server configuration, version information, and endpoint discovery data for the remote MCP server to understand available capabilities.

```typescript
interface InfoResponse {
  name: string;
  version: string;
  description: string;
  basePath: string;
  endpoints: EndpointMetadata[];
}
```

**Integration Notes**: This endpoint is typically called once during MCP server initialization to discover capabilities.

---

### 2. Spending Limits (`/api/mcp/limits`)

**Purpose**: Retrieves user's current spending limits and available balances
**Method**: `GET`
**Authentication**: Required

Core endpoint for spending control verification. Provides real-time spending limits across multiple time windows (daily, weekly, monthly, per-transaction) with remaining balances calculated.

```typescript
interface SpendingLimits {
  daily: { amount: number; remaining: number; currency: string };
  weekly: { amount: number; remaining: number; currency: string };
  monthly: { amount: number; remaining: number; currency: string };
  transaction: { amount: number; currency: string };
  enabled: { daily: boolean; weekly: boolean; monthly: boolean; transaction: boolean };
}
```

**Integration Pattern**: Called before transaction validation to understand user's spending capacity and inform AI agent decision-making.

---

### 3. Transaction Validation (`/api/mcp/validate-transaction`)

**Purpose**: Validates transactions and handles user authorization workflow
**Method**: `POST`
**Authentication**: Required

**Critical Architecture Feature**: This endpoint implements **dual response patterns**:

#### Auto-Approval Flow (JSON Response)
When transaction is within all spending limits:
- Returns immediate JSON response with validation token
- AI agent can proceed directly to virtual card creation

#### User Authorization Flow (SSE Streaming)
When transaction exceeds any spending limit:
- Returns Server-Sent Events (SSE) stream
- **Forces AI agent to wait** for user approval
- Streams real-time status updates until resolved

```typescript
interface ValidationRequest {
  merchant: { name: string };
  amount: number;
  currency: string;
  product?: ProductContext;
  timeout?: number; // 10-300 seconds
}

interface ValidationResponse {
  status: 'auto_approved' | 'pending' | 'approved' | 'denied' | 'timeout';
  validation_token?: string;
  authorization_id?: string;
  message: string;
}
```

**SSE Implementation**: The streaming approach ensures AI agents cannot bypass user authorization, maintaining security and compliance requirements.

---

### 4. Authorization Status (`/api/mcp/authorization-status`)

**Purpose**: Polls authorization request status (alternative to SSE)
**Method**: `GET`
**Authentication**: Required
**Parameters**: `?id={authorization_id}`

Provides polling-based alternative to SSE streaming for authorization status checks. Used when SSE connections are not feasible.

```typescript
interface StatusResponse {
  status: 'pending' | 'approved' | 'denied' | 'timeout' | 'expired';
  authorization_id: string;
  validation_token?: string;
  expires_at?: string;
  message: string;
}
```

**Integration Pattern**: Called repeatedly until non-pending status received. Less efficient than SSE but provides broader compatibility.

---

### 5. Virtual Card Creation (`/api/mcp/create-virtual-card`)

**Purpose**: Creates single-use virtual cards for approved transactions
**Method**: `POST`
**Authentication**: Required

**Core Business Logic**: Converts validation tokens into actual virtual cards with spending controls. Handles currency conversion, customer data retrieval, and Stripe Issuing integration.

```typescript
interface CardCreationRequest {
  validation_token: string;
  merchant_name: string;
  transaction_amount: number;
  transaction_currency: string;
  card_amount: number;
  card_currency: string;
  exchange_rate?: number;
  agent_name?: string;
}

interface CardCreationResponse {
  cardId: string;
  cardNumber: string;
  cvc: string;
  expMonth: number;
  expYear: number;
  expiresAt: string;
  spendingLimit: number;
  customer: CustomerDetails;
  // ... additional metadata
}
```

**Security Features**:
- **Single-use tokens**: Validation tokens consumed upon card creation
- **Time-limited cards**: 5-minute expiry for security
- **Spending controls**: Stripe-level spending limits enforced
- **Customer data**: Complete billing/shipping information included

---

### 6. Mock Checkout Simulation (`/api/mcp/mock-checkout`)

**Purpose**: Simulates e-commerce checkout using virtual card details
**Method**: `POST`
**Authentication**: Optional (for testing)

**Testing & Development**: Provides end-to-end checkout simulation for AI agent testing. Simulates realistic merchant checkout experience with order confirmation, shipping details, and receipt generation.

```typescript
interface CheckoutRequest {
  card_details: {
    card_number: string;
    cvc: string;
    exp_month: number;
    exp_year: number;
  };
  customer_details: CustomerDetails;
}

interface CheckoutResponse {
  order_id: string;
  status: 'confirmed' | 'processing' | 'failed';
  product: ProductDetails;
  payment: PaymentConfirmation;
  shipping: ShippingDetails;
  merchant: MerchantDetails;
  receipt: ReceiptDetails;
}
```

**Integration Benefits**: Allows complete testing of AI agent flows without requiring actual merchant integrations.

## Architectural Relationships

### Transaction Flow Sequence

1. **Discovery**: AI agent calls `/info` to understand capabilities
2. **Limits Check**: Agent calls `/limits` to understand spending capacity  
3. **Validation**: Agent calls `/validate-transaction` with transaction details
   - **Auto-approval**: Receives immediate validation token
   - **User authorization**: Receives SSE stream, waits for approval
4. **Card Creation**: Agent calls `/create-virtual-card` with validation token
5. **Usage**: Agent uses card details for merchant checkout
6. **Testing**: Agent can use `/mock-checkout` for end-to-end testing

### Data Flow Dependencies

```
User Profile → Spending Limits → Transaction Validation → Authorization → Card Creation → Usage
```

### Error Handling Patterns

All endpoints follow consistent error response structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // UPPER_SNAKE_CASE
    message: string;
  };
}
```

**Common Error Codes**:
- `UNAUTHORIZED`: Authentication required/failed
- `VALIDATION_ERROR`: Invalid request parameters
- `INSUFFICIENT_BALANCE`: Not enough funds/limits
- `TOKEN_EXPIRED`: Validation token no longer valid
- `TOKEN_ALREADY_USED`: Validation token consumed
- `INTERNAL_ERROR`: Server-side processing error

## Integration Considerations for MCP Proxy

### Request Routing

The remote MCP server should route tool calls to appropriate endpoints:

```javascript
// Simplified routing example
const routeToolCall = (toolName, params) => {
  const routes = {
    'layrpay_get_limits': '/api/mcp/limits',
    'layrpay_validate_transaction': '/api/mcp/validate-transaction',
    'layrpay_create_virtual_card': '/api/mcp/create-virtual-card',
    'layrpay_check_authorization': '/api/mcp/authorization-status',
    'layrpay_mock_checkout': '/api/mcp/mock-checkout'
  };
  return routes[toolName];
};
```

### SSE Handling

The proxy must handle SSE responses specially:

```javascript
// SSE detection and processing
if (response.headers['content-type']?.includes('text/event-stream')) {
  // Process SSE events until final status
  return handleSSEStream(response);
} else {
  // Handle regular JSON response
  return response.json();
}
```

### Authentication Propagation

User authentication must be forwarded from MCP proxy to LayrPay endpoints:

```javascript
const headers = {
  'Authorization': `Bearer ${userJWT}`,
  'Content-Type': 'application/json',
  'X-User-Id': userId // Optional additional identification
};
```

### Error Response Handling

The proxy should normalize error responses for AI agents:

```javascript
// Convert LayrPay errors to MCP tool responses
const handleLayrPayError = (error) => ({
  success: false,
  error: error.error || { code: 'UNKNOWN_ERROR', message: 'Unknown error occurred' }
});
```

## Performance & Reliability

### Database Optimization

- **Indexed Queries**: All user-based queries use indexed columns
- **Connection Pooling**: Supabase handles connection management
- **Query Optimization**: Single-query patterns for complex operations

### Caching Strategy

- **Exchange Rates**: 24-hour database cache for currency conversion
- **User Profiles**: Real-time queries (no cache due to frequent updates)
- **Spending Limits**: Real-time calculations for accuracy

### Monitoring Points

Key metrics for MCP proxy monitoring:

1. **Request Volume**: Calls per endpoint per timeframe
2. **Authorization Success Rate**: Percentage of approvals vs denials
3. **Card Creation Success**: Successful vs failed card creations
4. **SSE Connection Duration**: Time spent waiting for authorization
5. **Error Rate Distribution**: Breakdown by error code

## Security Considerations

### Token Security

- **Single-use validation tokens**: Prevent replay attacks
- **Time-limited expiry**: Reduce exposure window
- **User-scoped tokens**: RLS ensures user isolation

### Financial Controls

- **Spending limits**: Multiple enforcement layers (LayrPay + Stripe)
- **Real-time validation**: Live balance calculations
- **Audit logging**: Complete transaction history

### API Security

- **Rate limiting**: Prevent abuse via request throttling
- **Input validation**: Comprehensive parameter checking
- **Error message sanitization**: Prevent information leakage

## Future Enhancements

### Planned Improvements

1. **Webhook Integration**: Real-time card usage notifications
2. **Advanced Analytics**: Spending pattern analysis
3. **Multi-currency Support**: Enhanced currency handling
4. **Batch Operations**: Multiple card creation support
5. **Enhanced Monitoring**: Detailed performance metrics

### Scalability Considerations

- **Database sharding**: For high-volume scenarios
- **Redis caching**: For frequently accessed data
- **Load balancing**: For multiple MCP proxy instances
- **Queue processing**: For webhook and async operations

This API implementation provides a robust, secure foundation for AI agent financial transactions while maintaining strict security and compliance requirements through the MCP proxy architecture. 