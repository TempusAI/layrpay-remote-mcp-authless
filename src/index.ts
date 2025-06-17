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
			"Get LayrPay server information and status",
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
			"Get user spending limits and usage",
			{
				currency: z.string().optional().describe("Optional currency code (e.g., USD, EUR) to convert limits to")
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
			"Validate a transaction against spending limits with optional streaming approval",
			{
				currency: z.string().describe("Transaction currency (e.g., USD, EUR)"),
				merchant: z.object({
					name: z.string().describe("Merchant name"),
					category: z.string().optional().describe("Merchant category")
				}).describe("Merchant details"),
				amount: z.number().positive().describe("Transaction amount"),
				product: z.object({
					title: z.string().describe("Product title"),
					currency: z.string().describe("Product currency"),
					price: z.number().positive().describe("Product price"),
					category: z.string().optional().describe("Product category"),
					description: z.string().optional().describe("Product description"),
					image_url: z.string().optional().describe("Product image URL"),
					brand: z.string().optional().describe("Product brand"),
					model: z.string().optional().describe("Product model"),
					sku: z.string().optional().describe("Product SKU"),
					gtin: z.string().optional().describe("Product GTIN"),
					user_intent: z.string().optional().describe("User's intent with the product")
				}).optional().describe("Optional product details"),
				timeout: z.number().positive().optional().describe("Timeout in seconds (default: 30)"),
				agent_name: z.string().optional().describe("Name of the AI agent making the request")
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
			"Create a virtual card for a validated transaction",
			{
				validation_token: z.string().describe("Token from validated transaction"),
				merchant_name: z.string().describe("Merchant name for the card"),
				transaction_amount: z.number().positive().describe("Original transaction amount"),
				transaction_currency: z.string().describe("Original transaction currency"),
				card_amount: z.number().positive().describe("Card amount (may differ due to currency conversion)"),
				card_currency: z.string().describe("Card currency"),
				exchange_rate: z.number().positive().optional().describe("Exchange rate if currency conversion applied"),
				agent_name: z.string().optional().describe("Name of the AI agent making the request")
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
			"Simulate a checkout process with virtual card details",
			{
				card_details: z.object({
					card_number: z.string().describe("Virtual card number"),
					cvc: z.string().describe("Card CVC"),
					exp_month: z.number().min(1).max(12).describe("Expiration month"),
					exp_year: z.number().describe("Expiration year")
				}).describe("Virtual card details"),
				customer_details: z.object({
					email: z.string().email().describe("Customer email"),
					firstName: z.string().describe("Customer first name"),
					lastName: z.string().describe("Customer last name"),
					billingAddress: z.object({
						line1: z.string().describe("Address line 1"),
						line2: z.string().optional().describe("Address line 2"),
						city: z.string().describe("City"),
						postal_code: z.string().describe("Postal code"),
						country: z.string().describe("Country code (e.g., US)"),
						state: z.string().optional().describe("State/province")
					}).describe("Billing address"),
					shippingAddress: z.object({
						line1: z.string().describe("Address line 1"),
						line2: z.string().optional().describe("Address line 2"),
						city: z.string().describe("City"),
						postal_code: z.string().describe("Postal code"),
						country: z.string().describe("Country code (e.g., US)"),
						state: z.string().optional().describe("State/province")
					}).describe("Shipping address"),
					phone: z.string().optional().describe("Customer phone number")
				}).describe("Customer details")
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
