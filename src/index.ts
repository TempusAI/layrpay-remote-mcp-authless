import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Environment interface is defined in worker-configuration.d.ts
interface Env {
	LAYRPAY_API_BASE_URL: string;
	LAYRPAY_USER_ID: string;
}

// LayrPay API response interface
interface LayrPayApiResponse {
	success: boolean;
	data?: unknown;
	error?: {
		code: string;
		message: string;
	};
}

// HTTP request helper with proper error handling
async function makeApiRequest(
	url: string,
	method: 'GET' | 'POST' = 'GET',
	body?: unknown,
	userId?: string
): Promise<LayrPayApiResponse> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (userId) {
		headers['x-layrpay-user-id'] = userId;
	}

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

		// Handle both JSON and SSE responses
		if (contentType.includes('application/json')) {
			const data = await response.json() as any;
			return {
				success: response.ok,
				data: data.success ? data.data : data,
				error: !response.ok ? (data.error || { code: 'HTTP_ERROR', message: `HTTP ${response.status}` }) : undefined
			};
		}

		if (contentType.includes('text/event-stream')) {
			// For SSE, we'll read the stream and collect events
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
				success: response.ok,
				data: events.join(''),
				error: !response.ok ? { code: 'HTTP_ERROR', message: `HTTP ${response.status}` } : undefined
			};
		}

		// Fallback for other content types
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

// Streaming validate transaction helper
async function makeStreamingValidateTransactionRequest(
	url: string,
	body: unknown,
	userId: string
): Promise<LayrPayApiResponse> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		'x-layrpay-user-id': userId,
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		});

		const contentType = response.headers.get('content-type') || '';

		// Handle JSON response (auto-approved transactions)
		if (contentType.includes('application/json')) {
			const data = await response.json() as any;
			return {
				success: response.ok,
				data: data.success ? data.data : data,
				error: !response.ok ? (data.error || { code: 'HTTP_ERROR', message: `HTTP ${response.status}` }) : undefined
			};
		}

		// Handle SSE response (requires approval)
		if (contentType.includes('text/event-stream')) {
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

		// Fallback
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

// Tool response helper
function createToolResponse(data: unknown, isError: boolean = false) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2)
			}
		],
		isError
	};
}

// Define our LayrPay MCP agent with tools
export class MyMCP extends McpAgent<Env> {
	server = new McpServer({
		name: "LayrPay MCP Server",
		version: "1.0.0",
		logo: "https://your-domain.com/path-to-layrpay-logo.png"
	});

	protected env: Env;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.env = env;
	}

	async init() {
		// Get server info tool
		this.server.tool(
			"layrpay_get_info",
			"Get LayrPay MCP server information and available endpoints",
			{},
			async () => {
				const response = await makeApiRequest(
					`${this.env.LAYRPAY_API_BASE_URL}/info`,
					'GET',
					undefined,
					this.env.LAYRPAY_USER_ID
				);

				if (!response.success) {
					return createToolResponse(response.error, true);
				}

				return createToolResponse(response.data);
			}
		);

		// Get spending limits tool
		this.server.tool(
			"layrpay_get_limits",
			"Get user's current spending limits and available balances to check if a planned transaction will require user approval. Use this tool BEFORE calling layrpay_validate_transaction to determine if the transaction amount would exceed any spending limits (per-transaction, daily, weekly, or monthly). If the planned transaction would exceed limits, inform the user that they will need to approve the request in the LayrPay app before proceeding with validation. This allows you to set proper expectations and avoid surprising users with approval requests.",
			{
				currency: z.string().optional().describe("Optional currency code (e.g., USD, EUR) to convert limits to. Use the same currency as your planned transaction for accurate comparison.")
			},
			async ({ currency }) => {
				const url = new URL(`${this.env.LAYRPAY_API_BASE_URL}/limits`);
				if (currency) {
					url.searchParams.set('currency', currency);
				}

				const response = await makeApiRequest(
					url.toString(),
					'GET',
					undefined,
					this.env.LAYRPAY_USER_ID
				);

				if (!response.success) {
					return createToolResponse(response.error, true);
				}

				return createToolResponse(response.data);
			}
		);

		// Validate transaction tool with streaming support
		this.server.tool(
			"layrpay_validate_transaction",
			"Validate a transaction request against user spending limits and obtain authorization when needed. This tool implements LayrPay's smart authorization system with automatic currency conversion: transactions within all spending limits are auto-approved instantly with a validation token, while transactions exceeding any limit (per-transaction, daily, weekly, or monthly) require explicit user authorization through the LayrPay app. The system automatically converts foreign currency transactions to the user's base currency using real-time exchange rates for accurate limit validation. Enhanced with product context for realistic checkout simulation and transaction tracking. The tool returns immediately with the transaction status - either auto-approved with a token for immediate use, or pending with an authorization ID that the user must approve. Use this before any payment to ensure compliance with user spending controls and to acquire the validation token required to generate the virtual payment card that completes the transaction.",
			{
				merchant: z.object({
					name: z.string().describe("Name of the merchant (e.g., 'Amazon', 'Starbucks', 'Local Coffee Shop'). This appears in user authorization requests, so be descriptive."),
					category: z.string().optional().describe("Merchant category for user context (e.g., 'retail', 'food', 'entertainment', 'subscription', 'travel'). Helps users understand the purchase type.")
				}).describe("Merchant details"),
				amount: z.number().positive().describe("Transaction amount in the specified currency (must be positive). This is checked against user's per-transaction, daily, weekly, and monthly spending limits."),
				currency: z.string().describe("ISO currency code (e.g., 'USD', 'EUR', 'GBP'). Must match user's account currency for limit validation."),
				product: z.object({
					title: z.string().describe("The product name/title (required, max 200 characters)"),
					price: z.number().positive().describe("Product price (must exactly match transaction amount)"),
					currency: z.string().describe("Product currency (must exactly match transaction currency)"),
					description: z.string().optional().describe("Product description (recommended for better context)"),
					brand: z.string().optional().describe("Product brand name (recommended)"),
					category: z.string().optional().describe("Product category (recommended, e.g. 'Electronics', 'Clothing')"),
					sku: z.string().optional().describe("Product SKU/model number (optional)"),
					image_url: z.string().optional().describe("Product image URL (optional, must be valid URL)"),
					product_url: z.string().optional().describe("Product page URL (optional, must be valid URL)"),
					agent_reasoning: z.string().optional().describe("Explanation of why the agent selected this product (optional, for context)"),
					user_intent: z.string().optional().describe("What the user originally requested (optional, for context)")
				}).optional().describe("Detailed product information for enhanced checkout simulation and transaction tracking (recommended for testing)"),
				timeout: z.number().positive().optional().describe("Timeout in seconds for user authorization if required (default: 90, max: 300). Only applies to transactions requiring user approval."),
				agent_name: z.enum(["Claude", "ChatGPT", "Gemini", "Perplexity", "Other"]).describe("The actual LLM agent name making this request")
			},
			async (args) => {
				const response = await makeStreamingValidateTransactionRequest(
					`${this.env.LAYRPAY_API_BASE_URL}/validate-transaction`,
					args,
					this.env.LAYRPAY_USER_ID
				);

				if (!response.success) {
					return createToolResponse(response.error, true);
				}

				return createToolResponse(response.data);
			}
		);

		// Create virtual card tool
		this.server.tool(
			"layrpay_create_virtual_card",
			"Create a single-use virtual card for an approved transaction. REQUIRES A VALID VALIDATION TOKEN from layrpay_validate_transaction. The virtual card is automatically issued in the user's local currency (determined by their country/region) and the transaction amount is converted if needed. IMPORTANT: You must use the exact card_amount, card_currency, and exchange_rate values from the 'card_details' field in the validation response to ensure the card is created for the pre-approved amount. The virtual card is locked to the converted transaction amount plus 1% for payment processing fees and expires in 5 minutes. The card will be automatically cancelled after first successful use. Returns full card details including number, CVC, and expiry.",
			{
				validation_token: z.string().describe("Validation token from layrpay_validate_transaction - REQUIRED"),
				merchant_name: z.string().describe("Name of the merchant (must match validation request)"),
				transaction_amount: z.number().positive().describe("Original transaction amount (must match validation request)"),
				transaction_currency: z.string().describe("Original transaction currency (must match validation request)"),
				card_amount: z.number().positive().describe("Card issuance amount from validation response card_details.amount (converted to user's local currency) - REQUIRED"),
				card_currency: z.string().describe("Card issuance currency from validation response card_details.currency (user's local currency) - REQUIRED"),
				exchange_rate: z.number().positive().optional().describe("Exchange rate from validation response card_details.exchange_rate (if currency conversion was applied)"),
				agent_name: z.string().optional().describe("Name of the AI agent creating the card")
			},
			async (args) => {
				const response = await makeApiRequest(
					`${this.env.LAYRPAY_API_BASE_URL}/create-virtual-card`,
					'POST',
					args,
					this.env.LAYRPAY_USER_ID
				);

				if (!response.success) {
					return createToolResponse(response.error, true);
				}

				return createToolResponse(response.data);
			}
		);

		// Mock checkout tool
		this.server.tool(
			"layrpay_mock_checkout",
			"Simulates e-commerce checkout experience using virtual card details for end-to-end testing. Use this AFTER receiving virtual card details from layrpay_create_virtual_card. Pass the exact card details and customer information from the virtual card response. The checkout amount is automatically determined from the linked transaction. Simulates realistic payment processing delays and includes complete order confirmation with tracking and receipt details. Updates transaction and virtual card status in the system.",
			{
				card_details: z.object({
					card_number: z.string().describe("Full virtual card number"),
					cvc: z.string().describe("Card CVC/CVV code"),
					exp_month: z.number().min(1).max(12).describe("Card expiration month (1-12)"),
					exp_year: z.number().describe("Card expiration year")
				}).describe("Virtual card details received from layrpay_create_virtual_card"),
				customer_details: z.object({
					email: z.string().email().describe("Customer email address"),
					firstName: z.string().describe("Customer first name"),
					lastName: z.string().describe("Customer last name"),
					phone: z.string().optional().describe("Customer phone number (optional)"),
					billingAddress: z.object({
						line1: z.string().describe("Address line 1"),
						line2: z.string().optional().describe("Address line 2 (optional)"),
						city: z.string().describe("City"),
						state: z.string().optional().describe("State/Province (optional)"),
						postalCode: z.string().describe("Postal/ZIP code"),
						country: z.string().describe("Country code (e.g., 'US', 'CA')")
					}).describe("Customer billing address"),
					shippingAddress: z.object({
						line1: z.string().describe("Address line 1"),
						line2: z.string().optional().describe("Address line 2 (optional)"),
						city: z.string().describe("City"),
						state: z.string().optional().describe("State/Province (optional)"),
						postalCode: z.string().describe("Postal/ZIP code"),
						country: z.string().describe("Country code (e.g., 'US', 'CA')")
					}).describe("Customer shipping address")
				}).describe("Customer details received from layrpay_create_virtual_card response")
			},
			async (args) => {
				const response = await makeApiRequest(
					`${this.env.LAYRPAY_API_BASE_URL}/mock-checkout`,
					'POST',
					args,
					this.env.LAYRPAY_USER_ID
				);

				if (!response.success) {
					return createToolResponse(response.error, true);
				}

				return createToolResponse(response.data);
			}
		);
	}
}

// Export the handlers for Cloudflare Workers
export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse", {
				corsOptions: {
					origin: "*",
					methods: "GET, POST, OPTIONS",
					headers: "Content-Type, Authorization, X-Requested-With",
					maxAge: 86400
				}
			}).fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp", {
				corsOptions: {
					origin: "*",
					methods: "GET, POST, OPTIONS", 
					headers: "Content-Type, Authorization, X-Requested-With",
					maxAge: 86400
				}
			}).fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
