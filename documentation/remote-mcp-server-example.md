Directory structure:
└── remote-mcp-server/
    ├── README.md
    ├── biome.json
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.json
    ├── worker-configuration.d.ts
    ├── wrangler.jsonc
    ├── .gitignore
    ├── src/
    │   ├── app.ts
    │   ├── index.ts
    │   └── utils.ts
    └── static/
        ├── README.md
        └── img -> img


Files Content:

(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: demos/remote-mcp-server/README.md
================================================
# Remote MCP Server on Cloudflare

Let's get a remote MCP server up-and-running on Cloudflare Workers complete with OAuth login!

## Develop locally

```bash
# clone the repository
git clone https://github.com/cloudflare/ai.git
# Or if using ssh:
# git clone git@github.com:cloudflare/ai.git

# install dependencies
cd ai
# Note: using pnpm instead of just "npm"
pnpm install

# run locally
npx nx dev remote-mcp-server
```

You should be able to open [`http://localhost:8787/`](http://localhost:8787/) in your browser

## Connect the MCP inspector to your server

To explore your new MCP api, you can use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector).

- Start it with `npx @modelcontextprotocol/inspector`
- [Within the inspector](http://localhost:5173), switch the Transport Type to `SSE` and enter `http://localhost:8787/sse` as the URL of the MCP server to connect to, and click "Connect"
- You will navigate to a (mock) user/password login screen. Input any email and pass to login.
- You should be redirected back to the MCP Inspector and you can now list and call any defined tools!

<div align="center">
  <img src="img/mcp-inspector-sse-config.png" alt="MCP Inspector with the above config" width="600"/>
</div>

<div align="center">
  <img src="img/mcp-inspector-successful-tool-call.png" alt="MCP Inspector with after a tool call" width="600"/>
</div>

## Connect Claude Desktop to your local MCP server

The MCP inspector is great, but we really want to connect this to Claude! Follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config to find your configuration file.

Open the file in your text editor and replace it with this configuration:

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

This will run a local proxy and let Claude talk to your MCP server over HTTP

When you open Claude a browser window should open and allow you to login. You should see the tools available in the bottom right. Given the right prompt Claude should ask to call the tool.

<div align="center">
  <img src="img/available-tools.png" alt="Clicking on the hammer icon shows a list of available tools" width="600"/>
</div>

<div align="center">
  <img src="img/claude-does-math-the-fancy-way.png" alt="Claude answers the prompt 'I seem to have lost my calculator and have run out of fingers. Could you use the math tool to add 23 and 19?' by invoking the MCP add tool" width="600"/>
</div>

## Deploy to Cloudflare

1. `npx wrangler kv namespace create OAUTH_KV`
2. Follow the guidance to add the kv namespace ID to `wrangler.jsonc`
3. `npm run deploy`

## Call your newly deployed remote MCP server from a remote MCP client

Just like you did above in "Develop locally", run the MCP inspector:

`npx @modelcontextprotocol/inspector@latest`

Then enter the `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) of your Worker in the inspector as the URL of the MCP server to connect to, and click "Connect".

You've now connected to your MCP server from a remote MCP client.

## Connect Claude Desktop to your remote MCP server

Update the Claude configuration file to point to your `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) and restart Claude 

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://worker-name.account-name.workers.dev/sse"
      ]
    }
  }
}
```

## Debugging

Should anything go wrong it can be helpful to restart Claude, or to try connecting directly to your
MCP server on the command line with the following command.

```bash
npx mcp-remote http://localhost:8787/sse
```

In some rare cases it may help to clear the files added to `~/.mcp-auth`

```bash
rm -rf ~/.mcp-auth
```



================================================
FILE: demos/remote-mcp-server/biome.json
================================================
{
	"$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
	"assist": {
		"actions": {
			"source": {
				"useSortedKeys": "on"
			}
		},
		"enabled": true
	},
	"files": {
		"includes": ["!worker-configuration.d.ts"]
	},
	"formatter": {
		"enabled": true,
		"indentWidth": 4,
		"lineWidth": 100
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"style": {
				"noInferrableTypes": "error",
				"noNonNullAssertion": "off",
				"noParameterAssign": "error",
				"noUnusedTemplateLiteral": "error",
				"noUselessElse": "error",
				"useAsConstAssertion": "error",
				"useDefaultParameterLast": "error",
				"useEnumInitializers": "error",
				"useNumberNamespace": "error",
				"useSelfClosingElements": "error",
				"useSingleVarDeclarator": "error"
			},
			"suspicious": {
				"noConfusingVoidType": "off",
				"noDebugger": "off",
				"noExplicitAny": "off"
			}
		}
	},
	"root": false,
	"vcs": {
		"clientKind": "git",
		"enabled": true,
		"useIgnoreFile": true
	}
}



================================================
FILE: demos/remote-mcp-server/package-lock.json
================================================
{
	"name": "remote-mcp-server",
	"version": "0.0.0",
	"lockfileVersion": 3,
	"requires": true,
	"packages": {
		"": {
			"name": "remote-mcp-server",
			"version": "0.0.0",
			"dependencies": {
				"@cloudflare/workers-oauth-provider": "^0.0.5",
				"@modelcontextprotocol/sdk": "^1.12.3",
				"agents": "^0.0.95",
				"hono": "^4.8.0",
				"zod": "^3.25.67"
			},
			"devDependencies": {
				"marked": "^15.0.12",
				"typescript": "^5.8.3",
				"workers-mcp": "^0.0.13",
				"wrangler": "^4.20.1"
			}
		},
		"node_modules/@ai-sdk/provider": {
			"version": "1.1.3",
			"resolved": "https://registry.npmjs.org/@ai-sdk/provider/-/provider-1.1.3.tgz",
			"integrity": "sha512-qZMxYJ0qqX/RfnuIaab+zp8UAeJn/ygXXAffR5I4N0n1IrvA6qBsjc8hXLmBiMV2zoXlifkacF7sEFnYnjBcqg==",
			"license": "Apache-2.0",
			"dependencies": {
				"json-schema": "^0.4.0"
			},
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@ai-sdk/provider-utils": {
			"version": "2.2.8",
			"resolved": "https://registry.npmjs.org/@ai-sdk/provider-utils/-/provider-utils-2.2.8.tgz",
			"integrity": "sha512-fqhG+4sCVv8x7nFzYnFo19ryhAa3w096Kmc3hWxMQfW/TubPOmt3A6tYZhl4mUfQWWQMsuSkLrtjlWuXBVSGQA==",
			"license": "Apache-2.0",
			"dependencies": {
				"@ai-sdk/provider": "1.1.3",
				"nanoid": "^3.3.8",
				"secure-json-parse": "^2.7.0"
			},
			"engines": {
				"node": ">=18"
			},
			"peerDependencies": {
				"zod": "^3.23.8"
			}
		},
		"node_modules/@ai-sdk/provider-utils/node_modules/nanoid": {
			"version": "3.3.11",
			"resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
			"integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/ai"
				}
			],
			"license": "MIT",
			"bin": {
				"nanoid": "bin/nanoid.cjs"
			},
			"engines": {
				"node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
			}
		},
		"node_modules/@ai-sdk/react": {
			"version": "1.2.12",
			"resolved": "https://registry.npmjs.org/@ai-sdk/react/-/react-1.2.12.tgz",
			"integrity": "sha512-jK1IZZ22evPZoQW3vlkZ7wvjYGYF+tRBKXtrcolduIkQ/m/sOAVcVeVDUDvh1T91xCnWCdUGCPZg2avZ90mv3g==",
			"license": "Apache-2.0",
			"dependencies": {
				"@ai-sdk/provider-utils": "2.2.8",
				"@ai-sdk/ui-utils": "1.2.11",
				"swr": "^2.2.5",
				"throttleit": "2.1.0"
			},
			"engines": {
				"node": ">=18"
			},
			"peerDependencies": {
				"react": "^18 || ^19 || ^19.0.0-rc",
				"zod": "^3.23.8"
			},
			"peerDependenciesMeta": {
				"zod": {
					"optional": true
				}
			}
		},
		"node_modules/@ai-sdk/ui-utils": {
			"version": "1.2.11",
			"resolved": "https://registry.npmjs.org/@ai-sdk/ui-utils/-/ui-utils-1.2.11.tgz",
			"integrity": "sha512-3zcwCc8ezzFlwp3ZD15wAPjf2Au4s3vAbKsXQVyhxODHcmu0iyPO2Eua6D/vicq/AUm/BAo60r97O6HU+EI0+w==",
			"license": "Apache-2.0",
			"dependencies": {
				"@ai-sdk/provider": "1.1.3",
				"@ai-sdk/provider-utils": "2.2.8",
				"zod-to-json-schema": "^3.24.1"
			},
			"engines": {
				"node": ">=18"
			},
			"peerDependencies": {
				"zod": "^3.23.8"
			}
		},
		"node_modules/@babel/helper-string-parser": {
			"version": "7.27.1",
			"resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.27.1.tgz",
			"integrity": "sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=6.9.0"
			}
		},
		"node_modules/@babel/helper-validator-identifier": {
			"version": "7.27.1",
			"resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.27.1.tgz",
			"integrity": "sha512-D2hP9eA+Sqx1kBZgzxZh0y1trbuU+JoDkiEwqhQ36nodYqJwyEIhPSdMNd7lOm/4io72luTPWH20Yda0xOuUow==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=6.9.0"
			}
		},
		"node_modules/@babel/parser": {
			"version": "7.27.5",
			"resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.27.5.tgz",
			"integrity": "sha512-OsQd175SxWkGlzbny8J3K8TnnDD0N3lrIUtB92xwyRpzaenGZhxDvxN/JgU00U3CDZNj9tPuDJ5H0WS4Nt3vKg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@babel/types": "^7.27.3"
			},
			"bin": {
				"parser": "bin/babel-parser.js"
			},
			"engines": {
				"node": ">=6.0.0"
			}
		},
		"node_modules/@babel/types": {
			"version": "7.27.6",
			"resolved": "https://registry.npmjs.org/@babel/types/-/types-7.27.6.tgz",
			"integrity": "sha512-ETyHEk2VHHvl9b9jZP5IHPavHYk57EhanlRRuae9XCpb/j5bDCbPPMOBfCWhnl/7EDJz0jEMCi/RhccCE8r1+Q==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@babel/helper-string-parser": "^7.27.1",
				"@babel/helper-validator-identifier": "^7.27.1"
			},
			"engines": {
				"node": ">=6.9.0"
			}
		},
		"node_modules/@clack/core": {
			"version": "0.3.5",
			"resolved": "https://registry.npmjs.org/@clack/core/-/core-0.3.5.tgz",
			"integrity": "sha512-5cfhQNH+1VQ2xLQlmzXMqUoiaH0lRBq9/CLW9lTyMbuKLC3+xEK01tHVvyut++mLOn5urSHmkm6I0Lg9MaJSTQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"picocolors": "^1.0.0",
				"sisteransi": "^1.0.5"
			}
		},
		"node_modules/@clack/prompts": {
			"version": "0.8.2",
			"resolved": "https://registry.npmjs.org/@clack/prompts/-/prompts-0.8.2.tgz",
			"integrity": "sha512-6b9Ab2UiZwJYA9iMyboYyW9yJvAO9V753ZhS+DHKEjZRKAxPPOb7MXXu84lsPFG+vZt6FRFniZ8rXi+zCIw4yQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@clack/core": "0.3.5",
				"picocolors": "^1.0.0",
				"sisteransi": "^1.0.5"
			}
		},
		"node_modules/@cloudflare/kv-asset-handler": {
			"version": "0.4.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/kv-asset-handler/-/kv-asset-handler-0.4.0.tgz",
			"integrity": "sha512-+tv3z+SPp+gqTIcImN9o0hqE9xyfQjI1XD9pL6NuKjua9B1y7mNYv0S9cP+QEbA4ppVgGZEmKOvHX5G5Ei1CVA==",
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"dependencies": {
				"mime": "^3.0.0"
			},
			"engines": {
				"node": ">=18.0.0"
			}
		},
		"node_modules/@cloudflare/unenv-preset": {
			"version": "2.3.3",
			"resolved": "https://registry.npmjs.org/@cloudflare/unenv-preset/-/unenv-preset-2.3.3.tgz",
			"integrity": "sha512-/M3MEcj3V2WHIRSW1eAQBPRJ6JnGQHc6JKMAPLkDb7pLs3m6X9ES/+K3ceGqxI6TKeF32AWAi7ls0AYzVxCP0A==",
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"peerDependencies": {
				"unenv": "2.0.0-rc.17",
				"workerd": "^1.20250508.0"
			},
			"peerDependenciesMeta": {
				"workerd": {
					"optional": true
				}
			}
		},
		"node_modules/@cloudflare/workerd-darwin-64": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workerd-darwin-64/-/workerd-darwin-64-1.20250612.0.tgz",
			"integrity": "sha512-IpL/tOvNY04n2hvp/XGdOGjeMDycEjbwJL8gJ0kenBFBa13EE82I61ceA56kuCiEdb1vBv3O+xiD9zN6AuQlmQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/@cloudflare/workerd-darwin-arm64": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workerd-darwin-arm64/-/workerd-darwin-arm64-1.20250612.0.tgz",
			"integrity": "sha512-Hb9GWzLT4ydBYfGE29jxZFkx58NEA+oRMuGP358A6PUZ9UEDYWTDhskVQovhjELZMgOppUYXN2v/Je3sO1anpg==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/@cloudflare/workerd-linux-64": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workerd-linux-64/-/workerd-linux-64-1.20250612.0.tgz",
			"integrity": "sha512-7kOA1sCfl9m2osolplDM9XqyBPf5KupvDs4UbD2kQq0zfd+u6acLz/YB9Q5tsVQIyhQoP32Oe+kr6IZJBImq9A==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/@cloudflare/workerd-linux-arm64": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workerd-linux-arm64/-/workerd-linux-arm64-1.20250612.0.tgz",
			"integrity": "sha512-x2UsZhfacZftD/kpDE2mtAlrLZPmkwRInFHJc7uIl8mvovQqVKMBkexH7dkfrgvBV98S2hOjxqFKP9mETuQQAQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/@cloudflare/workerd-windows-64": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workerd-windows-64/-/workerd-windows-64-1.20250612.0.tgz",
			"integrity": "sha512-CeYe4OM5doIVGsOtrmDTrIBV2/wa/SPREEXH/N7ZCEs7mRhsTNFOwmctC0CYe3ZiutJ02dJmmyh/CIij2mkOLQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/@cloudflare/workers-oauth-provider": {
			"version": "0.0.5",
			"resolved": "https://registry.npmjs.org/@cloudflare/workers-oauth-provider/-/workers-oauth-provider-0.0.5.tgz",
			"integrity": "sha512-t1x5KAzsubCvb4APnJ93z407X1x7SGj/ga5ziRnwIb/iLy4PMkT/hgd1y5z7Bbsdy5Fy6mywhCP4lym24bX66w==",
			"license": "MIT",
			"dependencies": {
				"@cloudflare/workers-types": "^4.20250311.0"
			}
		},
		"node_modules/@cloudflare/workers-types": {
			"version": "4.20250618.0",
			"resolved": "https://registry.npmjs.org/@cloudflare/workers-types/-/workers-types-4.20250618.0.tgz",
			"integrity": "sha512-5c26+nZEXDRrlzsIaVt3npuElwLi6bhLZHyDfMX5JmcM9sogeBMyyXrU3gJG0DII3QenE7DuyMC8uFzJHTcnDA==",
			"license": "MIT OR Apache-2.0"
		},
		"node_modules/@cspotcode/source-map-support": {
			"version": "0.8.1",
			"resolved": "https://registry.npmjs.org/@cspotcode/source-map-support/-/source-map-support-0.8.1.tgz",
			"integrity": "sha512-IchNf6dN4tHoMFIn/7OE8LWZ19Y6q/67Bmf6vnGREv8RSbBVb9LPJxEcnwrcwX6ixSvaiGoomAUvu4YSxXrVgw==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@jridgewell/trace-mapping": "0.3.9"
			},
			"engines": {
				"node": ">=12"
			}
		},
		"node_modules/@emnapi/runtime": {
			"version": "1.4.3",
			"resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.4.3.tgz",
			"integrity": "sha512-pBPWdu6MLKROBX05wSNKcNb++m5Er+KQ9QkB+WVM+pW2Kx9hoSrVTnu3BdkI5eBLZoKu/J6mW/B6i6bJB2ytXQ==",
			"dev": true,
			"license": "MIT",
			"optional": true,
			"dependencies": {
				"tslib": "^2.4.0"
			}
		},
		"node_modules/@esbuild/aix-ppc64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.5.tgz",
			"integrity": "sha512-9o3TMmpmftaCMepOdA5k/yDw8SfInyzWWTjYTFCX3kPSDJMROQTb8jg+h9Cnwnmm1vOzvxN7gIfB5V2ewpjtGA==",
			"cpu": [
				"ppc64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"aix"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-arm": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.5.tgz",
			"integrity": "sha512-AdJKSPeEHgi7/ZhuIPtcQKr5RQdo6OO2IL87JkianiMYMPbCtot9fxPbrMiBADOWWm3T2si9stAiVsGbTQFkbA==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.5.tgz",
			"integrity": "sha512-VGzGhj4lJO+TVGV1v8ntCZWJktV7SGCs3Pn1GRWI1SBFtRALoomm8k5E9Pmwg3HOAal2VDc2F9+PM/rEY6oIDg==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/android-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.5.tgz",
			"integrity": "sha512-D2GyJT1kjvO//drbRT3Hib9XPwQeWd9vZoBJn+bu/lVsOZ13cqNdDeqIF/xQ5/VmWvMduP6AmXvylO/PIc2isw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/darwin-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.5.tgz",
			"integrity": "sha512-GtaBgammVvdF7aPIgH2jxMDdivezgFu6iKpmT+48+F8Hhg5J/sfnDieg0aeG/jfSvkYQU2/pceFPDKlqZzwnfQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/darwin-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.5.tgz",
			"integrity": "sha512-1iT4FVL0dJ76/q1wd7XDsXrSW+oLoquptvh4CLR4kITDtqi2e/xwXwdCVH8hVHU43wgJdsq7Gxuzcs6Iq/7bxQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/freebsd-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.5.tgz",
			"integrity": "sha512-nk4tGP3JThz4La38Uy/gzyXtpkPW8zSAmoUhK9xKKXdBCzKODMc2adkB2+8om9BDYugz+uGV7sLmpTYzvmz6Sw==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/freebsd-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.5.tgz",
			"integrity": "sha512-PrikaNjiXdR2laW6OIjlbeuCPrPaAl0IwPIaRv+SMV8CiM8i2LqVUHFC1+8eORgWyY7yhQY+2U2fA55mBzReaw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-arm": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.5.tgz",
			"integrity": "sha512-cPzojwW2okgh7ZlRpcBEtsX7WBuqbLrNXqLU89GxWbNt6uIg78ET82qifUy3W6OVww6ZWobWub5oqZOVtwolfw==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.5.tgz",
			"integrity": "sha512-Z9kfb1v6ZlGbWj8EJk9T6czVEjjq2ntSYLY2cw6pAZl4oKtfgQuS4HOq41M/BcoLPzrUbNd+R4BXFyH//nHxVg==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-ia32": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.5.tgz",
			"integrity": "sha512-sQ7l00M8bSv36GLV95BVAdhJ2QsIbCuCjh/uYrWiMQSUuV+LpXwIqhgJDcvMTj+VsQmqAHL2yYaasENvJ7CDKA==",
			"cpu": [
				"ia32"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-loong64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.5.tgz",
			"integrity": "sha512-0ur7ae16hDUC4OL5iEnDb0tZHDxYmuQyhKhsPBV8f99f6Z9KQM02g33f93rNH5A30agMS46u2HP6qTdEt6Q1kg==",
			"cpu": [
				"loong64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-mips64el": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.5.tgz",
			"integrity": "sha512-kB/66P1OsHO5zLz0i6X0RxlQ+3cu0mkxS3TKFvkb5lin6uwZ/ttOkP3Z8lfR9mJOBk14ZwZ9182SIIWFGNmqmg==",
			"cpu": [
				"mips64el"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-ppc64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.5.tgz",
			"integrity": "sha512-UZCmJ7r9X2fe2D6jBmkLBMQetXPXIsZjQJCjgwpVDz+YMcS6oFR27alkgGv3Oqkv07bxdvw7fyB71/olceJhkQ==",
			"cpu": [
				"ppc64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-riscv64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.5.tgz",
			"integrity": "sha512-kTxwu4mLyeOlsVIFPfQo+fQJAV9mh24xL+y+Bm6ej067sYANjyEw1dNHmvoqxJUCMnkBdKpvOn0Ahql6+4VyeA==",
			"cpu": [
				"riscv64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-s390x": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.5.tgz",
			"integrity": "sha512-K2dSKTKfmdh78uJ3NcWFiqyRrimfdinS5ErLSn3vluHNeHVnBAFWC8a4X5N+7FgVE1EjXS1QDZbpqZBjfrqMTQ==",
			"cpu": [
				"s390x"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/linux-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.5.tgz",
			"integrity": "sha512-uhj8N2obKTE6pSZ+aMUbqq+1nXxNjZIIjCjGLfsWvVpy7gKCOL6rsY1MhRh9zLtUtAI7vpgLMK6DxjO8Qm9lJw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/netbsd-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.5.tgz",
			"integrity": "sha512-pwHtMP9viAy1oHPvgxtOv+OkduK5ugofNTVDilIzBLpoWAM16r7b/mxBvfpuQDpRQFMfuVr5aLcn4yveGvBZvw==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/netbsd-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.5.tgz",
			"integrity": "sha512-WOb5fKrvVTRMfWFNCroYWWklbnXH0Q5rZppjq0vQIdlsQKuw6mdSihwSo4RV/YdQ5UCKKvBy7/0ZZYLBZKIbwQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/openbsd-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.5.tgz",
			"integrity": "sha512-7A208+uQKgTxHd0G0uqZO8UjK2R0DDb4fDmERtARjSHWxqMTye4Erz4zZafx7Di9Cv+lNHYuncAkiGFySoD+Mw==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/openbsd-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.5.tgz",
			"integrity": "sha512-G4hE405ErTWraiZ8UiSoesH8DaCsMm0Cay4fsFWOOUcz8b8rC6uCvnagr+gnioEjWn0wC+o1/TAHt+It+MpIMg==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/sunos-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.5.tgz",
			"integrity": "sha512-l+azKShMy7FxzY0Rj4RCt5VD/q8mG/e+mDivgspo+yL8zW7qEwctQ6YqKX34DTEleFAvCIUviCFX1SDZRSyMQA==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"sunos"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-arm64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.5.tgz",
			"integrity": "sha512-O2S7SNZzdcFG7eFKgvwUEZ2VG9D/sn/eIiz8XRZ1Q/DO5a3s76Xv0mdBzVM5j5R639lXQmPmSo0iRpHqUUrsxw==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-ia32": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.5.tgz",
			"integrity": "sha512-onOJ02pqs9h1iMJ1PQphR+VZv8qBMQ77Klcsqv9CNW2w6yLqoURLcgERAIurY6QE63bbLuqgP9ATqajFLK5AMQ==",
			"cpu": [
				"ia32"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@esbuild/win32-x64": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.5.tgz",
			"integrity": "sha512-TXv6YnJ8ZMVdX+SXWVBo/0p8LTcrUYngpWjvm91TMjjBQii7Oz11Lw5lbDV5Y0TzuhSJHwiH4hEtC1I42mMS0g==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@fastify/busboy": {
			"version": "2.1.1",
			"resolved": "https://registry.npmjs.org/@fastify/busboy/-/busboy-2.1.1.tgz",
			"integrity": "sha512-vBZP4NlzfOlerQTnba4aqZoMhE/a9HY7HRqoOPaETQcSQuWEIyZMHGfVu6w9wGtGK5fED5qRs2DteVCjOH60sA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=14"
			}
		},
		"node_modules/@img/sharp-darwin-arm64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.33.5.tgz",
			"integrity": "sha512-UT4p+iz/2H4twwAoLCqfA9UH5pI6DggwKEGuaPy7nCVQ8ZsiY5PIcrRvD1DzuY3qYL07NtIQcWnBSY/heikIFQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-darwin-arm64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-darwin-x64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.33.5.tgz",
			"integrity": "sha512-fyHac4jIc1ANYGRDxtiqelIbdWkIuQaI84Mv45KvGRRxSAa7o7d1ZKAOBaYbnepLC1WqxfpimdeWfvqqSGwR2Q==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-darwin-x64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-libvips-darwin-arm64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.0.4.tgz",
			"integrity": "sha512-XblONe153h0O2zuFfTAbQYAX2JhYmDHeWikp1LM9Hul9gVPjFY427k6dFEcOL72O01QxQsWi761svJ/ev9xEDg==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"darwin"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-darwin-x64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.0.4.tgz",
			"integrity": "sha512-xnGR8YuZYfJGmWPvmlunFaWJsb9T/AO2ykoP3Fz/0X5XV2aoYBPkX6xqCQvUTKKiLddarLaxpzNe+b1hjeWHAQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"darwin"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linux-arm": {
			"version": "1.0.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.0.5.tgz",
			"integrity": "sha512-gvcC4ACAOPRNATg/ov8/MnbxFDJqf/pDePbBnuBDcjsI8PssmjoKMAz4LtLaVi+OnSb5FK/yIOamqDwGmXW32g==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linux-arm64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.0.4.tgz",
			"integrity": "sha512-9B+taZ8DlyyqzZQnoeIvDVR/2F4EbMepXMc/NdVbkzsJbzkUjhXv/70GQJ7tdLA4YJgNP25zukcxpX2/SueNrA==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linux-s390x": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.0.4.tgz",
			"integrity": "sha512-u7Wz6ntiSSgGSGcjZ55im6uvTrOxSIS8/dgoVMoiGE9I6JAfU50yH5BoDlYA1tcuGS7g/QNtetJnxA6QEsCVTA==",
			"cpu": [
				"s390x"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linux-x64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.0.4.tgz",
			"integrity": "sha512-MmWmQ3iPFZr0Iev+BAgVMb3ZyC4KeFc3jFxnNbEPas60e1cIfevbtuyf9nDGIzOaW9PdnDciJm+wFFaTlj5xYw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linuxmusl-arm64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.0.4.tgz",
			"integrity": "sha512-9Ti+BbTYDcsbp4wfYib8Ctm1ilkugkA/uscUn6UXK1ldpC1JjiXbLfFZtRlBhjPZ5o1NCLiDbg8fhUPKStHoTA==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-libvips-linuxmusl-x64": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.0.4.tgz",
			"integrity": "sha512-viYN1KX9m+/hGkJtvYYp+CCLgnJXwiQB39damAO7WMdKWlIhmYTfHjwSbQeUK/20vY154mwezd9HflVFM1wVSw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"linux"
			],
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-linux-arm": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.33.5.tgz",
			"integrity": "sha512-JTS1eldqZbJxjvKaAkxhZmBqPRGmxgu+qFKSInv8moZ2AmT5Yib3EQ1c6gp493HvrvV8QgdOXdyaIBrhvFhBMQ==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linux-arm": "1.0.5"
			}
		},
		"node_modules/@img/sharp-linux-arm64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.33.5.tgz",
			"integrity": "sha512-JMVv+AMRyGOHtO1RFBiJy/MBsgz0x4AWrT6QoEVVTyh1E39TrCUpTRI7mx9VksGX4awWASxqCYLCV4wBZHAYxA==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linux-arm64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-linux-s390x": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.33.5.tgz",
			"integrity": "sha512-y/5PCd+mP4CA/sPDKl2961b+C9d+vPAveS33s6Z3zfASk2j5upL6fXVPZi7ztePZ5CuH+1kW8JtvxgbuXHRa4Q==",
			"cpu": [
				"s390x"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linux-s390x": "1.0.4"
			}
		},
		"node_modules/@img/sharp-linux-x64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.33.5.tgz",
			"integrity": "sha512-opC+Ok5pRNAzuvq1AG0ar+1owsu842/Ab+4qvU879ippJBHvyY5n2mxF1izXqkPYlGuP/M556uh53jRLJmzTWA==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linux-x64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-linuxmusl-arm64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.33.5.tgz",
			"integrity": "sha512-XrHMZwGQGvJg2V/oRSUfSAfjfPxO+4DkiRh6p2AFjLQztWUuY/o8Mq0eMQVIY7HJ1CDQUJlxGGZRw1a5bqmd1g==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linuxmusl-arm64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-linuxmusl-x64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.33.5.tgz",
			"integrity": "sha512-WT+d/cgqKkkKySYmqoZ8y3pxx7lx9vVejxW/W4DOFMYVSkErR+w7mf2u8m/y4+xHe7yY9DAXQMWQhpnMuFfScw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-libvips-linuxmusl-x64": "1.0.4"
			}
		},
		"node_modules/@img/sharp-wasm32": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.33.5.tgz",
			"integrity": "sha512-ykUW4LVGaMcU9lu9thv85CbRMAwfeadCJHRsg2GmeRa/cJxsVY9Rbd57JcMxBkKHag5U/x7TSBpScF4U8ElVzg==",
			"cpu": [
				"wasm32"
			],
			"dev": true,
			"license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
			"optional": true,
			"dependencies": {
				"@emnapi/runtime": "^1.2.0"
			},
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-win32-ia32": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.33.5.tgz",
			"integrity": "sha512-T36PblLaTwuVJ/zw/LaH0PdZkRz5rd3SmMHX8GSmR7vtNSP5Z6bQkExdSK7xGWyxLw4sUknBuugTelgw2faBbQ==",
			"cpu": [
				"ia32"
			],
			"dev": true,
			"license": "Apache-2.0 AND LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@img/sharp-win32-x64": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.33.5.tgz",
			"integrity": "sha512-MpY/o8/8kj+EcnxwvrP4aTJSWw/aZ7JIGR4aBeZkZw5B7/Jn+tY9/VNwtcoGmdT7GfggGIU4kygOMSbYnOrAbg==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "Apache-2.0 AND LGPL-3.0-or-later",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			}
		},
		"node_modules/@jridgewell/resolve-uri": {
			"version": "3.1.2",
			"resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
			"integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=6.0.0"
			}
		},
		"node_modules/@jridgewell/sourcemap-codec": {
			"version": "1.5.0",
			"resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.0.tgz",
			"integrity": "sha512-gv3ZRaISU3fjPAgNsriBRqGWQL6quFx04YMPW/zD8XMLsU32mhCCbfbO6KZFLjvYpCZ8zyDEgqsgf+PwPaM7GQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/@jridgewell/trace-mapping": {
			"version": "0.3.9",
			"resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.9.tgz",
			"integrity": "sha512-3Belt6tdc8bPgAtbcmdtNJlirVoTmEb5e2gC94PnkwEW9jI6CAHUeoG85tjWP5WquqfavoMtMwiG4P926ZKKuQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@jridgewell/resolve-uri": "^3.0.3",
				"@jridgewell/sourcemap-codec": "^1.4.10"
			}
		},
		"node_modules/@jsdoc/salty": {
			"version": "0.2.9",
			"resolved": "https://registry.npmjs.org/@jsdoc/salty/-/salty-0.2.9.tgz",
			"integrity": "sha512-yYxMVH7Dqw6nO0d5NIV8OQWnitU8k6vXH8NtgqAfIa/IUqRMxRv/NUJJ08VEKbAakwxlgBl5PJdrU0dMPStsnw==",
			"dev": true,
			"license": "Apache-2.0",
			"dependencies": {
				"lodash": "^4.17.21"
			},
			"engines": {
				"node": ">=v12.0.0"
			}
		},
		"node_modules/@modelcontextprotocol/sdk": {
			"version": "1.12.3",
			"resolved": "https://registry.npmjs.org/@modelcontextprotocol/sdk/-/sdk-1.12.3.tgz",
			"integrity": "sha512-DyVYSOafBvk3/j1Oka4z5BWT8o4AFmoNyZY9pALOm7Lh3GZglR71Co4r4dEUoqDWdDazIZQHBe7J2Nwkg6gHgQ==",
			"license": "MIT",
			"dependencies": {
				"ajv": "^6.12.6",
				"content-type": "^1.0.5",
				"cors": "^2.8.5",
				"cross-spawn": "^7.0.5",
				"eventsource": "^3.0.2",
				"express": "^5.0.1",
				"express-rate-limit": "^7.5.0",
				"pkce-challenge": "^5.0.0",
				"raw-body": "^3.0.0",
				"zod": "^3.23.8",
				"zod-to-json-schema": "^3.24.1"
			},
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/@nodelib/fs.scandir": {
			"version": "2.1.5",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
			"integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.stat": "2.0.5",
				"run-parallel": "^1.1.9"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@nodelib/fs.stat": {
			"version": "2.0.5",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
			"integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@nodelib/fs.walk": {
			"version": "1.2.8",
			"resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
			"integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.scandir": "2.1.5",
				"fastq": "^1.6.0"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/@opentelemetry/api": {
			"version": "1.9.0",
			"resolved": "https://registry.npmjs.org/@opentelemetry/api/-/api-1.9.0.tgz",
			"integrity": "sha512-3giAOQvZiH5F9bMlMiv8+GSPMeqg0dbaeo58/0SlA9sxSqZhnUtxzX9/2FzyhS9sWQf5S0GJE0AKBrFqjpeYcg==",
			"license": "Apache-2.0",
			"engines": {
				"node": ">=8.0.0"
			}
		},
		"node_modules/@silvia-odwyer/photon-node": {
			"version": "0.3.4",
			"resolved": "https://registry.npmjs.org/@silvia-odwyer/photon-node/-/photon-node-0.3.4.tgz",
			"integrity": "sha512-bnly4BKB3KDTFxrUIcgCLbaeVVS8lrAkri1pEzskpmxu9MdfGQTy8b8EgcD83ywD3RPMsIulY8xJH5Awa+t9fA==",
			"dev": true,
			"license": "Apache-2.0"
		},
		"node_modules/@types/diff-match-patch": {
			"version": "1.0.36",
			"resolved": "https://registry.npmjs.org/@types/diff-match-patch/-/diff-match-patch-1.0.36.tgz",
			"integrity": "sha512-xFdR6tkm0MWvBfO8xXCSsinYxHcqkQUlcHeSpMC2ukzOb6lwQAfDmW+Qt0AvlGd8HpsS28qKsB+oPeJn9I39jg==",
			"license": "MIT"
		},
		"node_modules/@types/linkify-it": {
			"version": "5.0.0",
			"resolved": "https://registry.npmjs.org/@types/linkify-it/-/linkify-it-5.0.0.tgz",
			"integrity": "sha512-sVDA58zAw4eWAffKOaQH5/5j3XeayukzDk+ewSsnv3p4yJEZHCCzMDiZM8e0OUrRvmpGZ85jf4yDHkHsgBNr9Q==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/@types/markdown-it": {
			"version": "14.1.2",
			"resolved": "https://registry.npmjs.org/@types/markdown-it/-/markdown-it-14.1.2.tgz",
			"integrity": "sha512-promo4eFwuiW+TfGxhi+0x3czqTYJkG8qB17ZUJiVF10Xm7NLVRSLUsfRTU/6h1e24VvRnXCx+hG7li58lkzog==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@types/linkify-it": "^5",
				"@types/mdurl": "^2"
			}
		},
		"node_modules/@types/mdurl": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/@types/mdurl/-/mdurl-2.0.0.tgz",
			"integrity": "sha512-RGdgjQUZba5p6QEFAVx2OGb8rQDL/cPRG7GiedRzMcJ1tYnUANBncjbSB1NRGwbvjcPeikRABz2nshyPk1bhWg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/accepts": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
			"integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
			"license": "MIT",
			"dependencies": {
				"mime-types": "^3.0.0",
				"negotiator": "^1.0.0"
			},
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/acorn": {
			"version": "8.14.0",
			"resolved": "https://registry.npmjs.org/acorn/-/acorn-8.14.0.tgz",
			"integrity": "sha512-cl669nCJTZBsL97OF4kUQm5g5hC2uihk0NxY3WENAC0TYdILVkAyHymAntgxGkl7K+t0cXIrH5siy5S4XkFycA==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"acorn": "bin/acorn"
			},
			"engines": {
				"node": ">=0.4.0"
			}
		},
		"node_modules/acorn-walk": {
			"version": "8.3.2",
			"resolved": "https://registry.npmjs.org/acorn-walk/-/acorn-walk-8.3.2.tgz",
			"integrity": "sha512-cjkyv4OtNCIeqhHrfS81QWXoCBPExR/J62oyEqepVw8WaQeSqpW2uhuLPh1m9eWhDuOo/jUXVTlifvesOWp/4A==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.4.0"
			}
		},
		"node_modules/agents": {
			"version": "0.0.95",
			"resolved": "https://registry.npmjs.org/agents/-/agents-0.0.95.tgz",
			"integrity": "sha512-qj0GVnoyjhj9gGgulShlMYvF6xDI2PpmeE7rpFCWkLxbeJPecUwmDU9Vm7F8ub9Yt58zieA3F0zASx/Z50aYhA==",
			"license": "MIT",
			"dependencies": {
				"@modelcontextprotocol/sdk": "^1.12.0",
				"ai": "^4.3.16",
				"cron-schedule": "^5.0.4",
				"nanoid": "^5.1.5",
				"partyserver": "^0.0.71",
				"partysocket": "1.1.4",
				"zod": "^3.25.28"
			},
			"peerDependencies": {
				"react": "*"
			}
		},
		"node_modules/ai": {
			"version": "4.3.16",
			"resolved": "https://registry.npmjs.org/ai/-/ai-4.3.16.tgz",
			"integrity": "sha512-KUDwlThJ5tr2Vw0A1ZkbDKNME3wzWhuVfAOwIvFUzl1TPVDFAXDFTXio3p+jaKneB+dKNCvFFlolYmmgHttG1g==",
			"license": "Apache-2.0",
			"dependencies": {
				"@ai-sdk/provider": "1.1.3",
				"@ai-sdk/provider-utils": "2.2.8",
				"@ai-sdk/react": "1.2.12",
				"@ai-sdk/ui-utils": "1.2.11",
				"@opentelemetry/api": "1.9.0",
				"jsondiffpatch": "0.6.0"
			},
			"engines": {
				"node": ">=18"
			},
			"peerDependencies": {
				"react": "^18 || ^19 || ^19.0.0-rc",
				"zod": "^3.23.8"
			},
			"peerDependenciesMeta": {
				"react": {
					"optional": true
				}
			}
		},
		"node_modules/ajv": {
			"version": "6.12.6",
			"resolved": "https://registry.npmjs.org/ajv/-/ajv-6.12.6.tgz",
			"integrity": "sha512-j3fVLgvTo527anyYyJOGTYJbG+vnnQYvE0m5mmkc1TK+nxAppkCLMIL0aZ4dblVCNoGShhm+kzE4ZUykBoMg4g==",
			"license": "MIT",
			"dependencies": {
				"fast-deep-equal": "^3.1.1",
				"fast-json-stable-stringify": "^2.0.0",
				"json-schema-traverse": "^0.4.1",
				"uri-js": "^4.2.2"
			},
			"funding": {
				"type": "github",
				"url": "https://github.com/sponsors/epoberezkin"
			}
		},
		"node_modules/argparse": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/argparse/-/argparse-2.0.1.tgz",
			"integrity": "sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==",
			"dev": true,
			"license": "Python-2.0"
		},
		"node_modules/array-back": {
			"version": "6.2.2",
			"resolved": "https://registry.npmjs.org/array-back/-/array-back-6.2.2.tgz",
			"integrity": "sha512-gUAZ7HPyb4SJczXAMUXMGAvI976JoK3qEx9v1FTmeYuJj0IBiaKttG1ydtGKdkfqWkIkouke7nG8ufGy77+Cvw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=12.17"
			}
		},
		"node_modules/as-table": {
			"version": "1.0.55",
			"resolved": "https://registry.npmjs.org/as-table/-/as-table-1.0.55.tgz",
			"integrity": "sha512-xvsWESUJn0JN421Xb9MQw6AsMHRCUknCe0Wjlxvjud80mU4E6hQf1A6NzQKcYNmYw62MfzEtXc+badstZP3JpQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"printable-characters": "^1.0.42"
			}
		},
		"node_modules/blake3-wasm": {
			"version": "2.1.5",
			"resolved": "https://registry.npmjs.org/blake3-wasm/-/blake3-wasm-2.1.5.tgz",
			"integrity": "sha512-F1+K8EbfOZE49dtoPtmxUQrpXaBIl3ICvasLh+nJta0xkz+9kF/7uet9fLnwKqhDrmj6g+6K3Tw9yQPUg2ka5g==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/bluebird": {
			"version": "3.7.2",
			"resolved": "https://registry.npmjs.org/bluebird/-/bluebird-3.7.2.tgz",
			"integrity": "sha512-XpNj6GDQzdfW+r2Wnn7xiSAd7TM3jzkxGXBGTtWKuSXv1xUV+azxAm8jdWZN06QTQk+2N2XB9jRDkvbmQmcRtg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/body-parser": {
			"version": "2.2.0",
			"resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.2.0.tgz",
			"integrity": "sha512-02qvAaxv8tp7fBa/mw1ga98OGm+eCbqzJOKoRt70sLmfEEi+jyBYVTDGfCL/k06/4EMk/z01gCe7HoCH/f2LTg==",
			"license": "MIT",
			"dependencies": {
				"bytes": "^3.1.2",
				"content-type": "^1.0.5",
				"debug": "^4.4.0",
				"http-errors": "^2.0.0",
				"iconv-lite": "^0.6.3",
				"on-finished": "^2.4.1",
				"qs": "^6.14.0",
				"raw-body": "^3.0.0",
				"type-is": "^2.0.0"
			},
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/braces": {
			"version": "3.0.3",
			"resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
			"integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"fill-range": "^7.1.1"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/bytes": {
			"version": "3.1.2",
			"resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
			"integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/cache-point": {
			"version": "3.0.1",
			"resolved": "https://registry.npmjs.org/cache-point/-/cache-point-3.0.1.tgz",
			"integrity": "sha512-itTIMLEKbh6Dw5DruXbxAgcyLnh/oPGVLBfTPqBOftASxHe8bAeXy7JkO4F0LvHqht7XqP5O/09h5UcHS2w0FA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"array-back": "^6.2.2"
			},
			"engines": {
				"node": ">=12.17"
			},
			"peerDependencies": {
				"@75lb/nature": "latest"
			},
			"peerDependenciesMeta": {
				"@75lb/nature": {
					"optional": true
				}
			}
		},
		"node_modules/call-bind-apply-helpers": {
			"version": "1.0.2",
			"resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
			"integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
			"license": "MIT",
			"dependencies": {
				"es-errors": "^1.3.0",
				"function-bind": "^1.1.2"
			},
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/call-bound": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
			"integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
			"license": "MIT",
			"dependencies": {
				"call-bind-apply-helpers": "^1.0.2",
				"get-intrinsic": "^1.3.0"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/catharsis": {
			"version": "0.9.0",
			"resolved": "https://registry.npmjs.org/catharsis/-/catharsis-0.9.0.tgz",
			"integrity": "sha512-prMTQVpcns/tzFgFVkVp6ak6RykZyWb3gu8ckUpd6YkTlacOd3DXGJjIpD4Q6zJirizvaiAjSSHlOsA+6sNh2A==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"lodash": "^4.17.15"
			},
			"engines": {
				"node": ">= 10"
			}
		},
		"node_modules/chalk": {
			"version": "5.4.1",
			"resolved": "https://registry.npmjs.org/chalk/-/chalk-5.4.1.tgz",
			"integrity": "sha512-zgVZuo2WcZgfUEmsn6eO3kINexW8RAE4maiQ8QNs8CtpPCSyMiYsULR3HQYkm3w8FIA3SberyMJMSldGsW+U3w==",
			"license": "MIT",
			"engines": {
				"node": "^12.17.0 || ^14.13 || >=16.0.0"
			},
			"funding": {
				"url": "https://github.com/chalk/chalk?sponsor=1"
			}
		},
		"node_modules/color": {
			"version": "4.2.3",
			"resolved": "https://registry.npmjs.org/color/-/color-4.2.3.tgz",
			"integrity": "sha512-1rXeuUUiGGrykh+CeBdu5Ie7OJwinCgQY0bc7GCRxy5xVHy+moaqkpL/jqQq0MtQOeYcrqEz4abc5f0KtU7W4A==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"color-convert": "^2.0.1",
				"color-string": "^1.9.0"
			},
			"engines": {
				"node": ">=12.5.0"
			}
		},
		"node_modules/color-convert": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
			"integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"color-name": "~1.1.4"
			},
			"engines": {
				"node": ">=7.0.0"
			}
		},
		"node_modules/color-name": {
			"version": "1.1.4",
			"resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
			"integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/color-string": {
			"version": "1.9.1",
			"resolved": "https://registry.npmjs.org/color-string/-/color-string-1.9.1.tgz",
			"integrity": "sha512-shrVawQFojnZv6xM40anx4CkoDP+fZsw/ZerEMsW/pyzsRbElpsL/DBVW7q3ExxwusdNXI3lXpuhEZkzs8p5Eg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"color-name": "^1.0.0",
				"simple-swizzle": "^0.2.2"
			}
		},
		"node_modules/commander": {
			"version": "2.20.3",
			"resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz",
			"integrity": "sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/content-disposition": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-1.0.0.tgz",
			"integrity": "sha512-Au9nRL8VNUut/XSzbQA38+M78dzP4D+eqg3gfJHMIHHYa3bg067xj1KxMUWj+VULbiZMowKngFFbKczUrNJ1mg==",
			"license": "MIT",
			"dependencies": {
				"safe-buffer": "5.2.1"
			},
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/content-type": {
			"version": "1.0.5",
			"resolved": "https://registry.npmjs.org/content-type/-/content-type-1.0.5.tgz",
			"integrity": "sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/cookie": {
			"version": "0.7.2",
			"resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
			"integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/cookie-signature": {
			"version": "1.2.2",
			"resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
			"integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
			"license": "MIT",
			"engines": {
				"node": ">=6.6.0"
			}
		},
		"node_modules/cors": {
			"version": "2.8.5",
			"resolved": "https://registry.npmjs.org/cors/-/cors-2.8.5.tgz",
			"integrity": "sha512-KIHbLJqu73RGr/hnbrO9uBeixNGuvSQjul/jdFvS/KFSIH1hWVd1ng7zOHx+YrEfInLG7q4n6GHQ9cDtxv/P6g==",
			"license": "MIT",
			"dependencies": {
				"object-assign": "^4",
				"vary": "^1"
			},
			"engines": {
				"node": ">= 0.10"
			}
		},
		"node_modules/cron-schedule": {
			"version": "5.0.4",
			"resolved": "https://registry.npmjs.org/cron-schedule/-/cron-schedule-5.0.4.tgz",
			"integrity": "sha512-nH0a49E/kSVk6BeFgKZy4uUsy6D2A16p120h5bYD9ILBhQu7o2sJFH+WI4R731TSBQ0dB1Ik7inB/dRAB4C8QQ==",
			"license": "MIT",
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/cross-spawn": {
			"version": "7.0.6",
			"resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
			"integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
			"license": "MIT",
			"dependencies": {
				"path-key": "^3.1.0",
				"shebang-command": "^2.0.0",
				"which": "^2.0.1"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/current-module-paths": {
			"version": "1.1.2",
			"resolved": "https://registry.npmjs.org/current-module-paths/-/current-module-paths-1.1.2.tgz",
			"integrity": "sha512-H4s4arcLx/ugbu1XkkgSvcUZax0L6tXUqnppGniQb8l5VjUKGHoayXE5RiriiPhYDd+kjZnaok1Uig13PKtKYQ==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=12.17"
			}
		},
		"node_modules/data-uri-to-buffer": {
			"version": "2.0.2",
			"resolved": "https://registry.npmjs.org/data-uri-to-buffer/-/data-uri-to-buffer-2.0.2.tgz",
			"integrity": "sha512-ND9qDTLc6diwj+Xe5cdAgVTbLVdXbtxTJRXRhli8Mowuaan+0EJOtdqJ0QCHNSSPyoXGx9HX2/VMnKeC34AChA==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/debug": {
			"version": "4.4.1",
			"resolved": "https://registry.npmjs.org/debug/-/debug-4.4.1.tgz",
			"integrity": "sha512-KcKCqiftBJcZr++7ykoDIEwSa3XWowTfNPo92BYxjXiyYEVrUQh2aLyhxBCwww+heortUFxEJYcRzosstTEBYQ==",
			"license": "MIT",
			"dependencies": {
				"ms": "^2.1.3"
			},
			"engines": {
				"node": ">=6.0"
			},
			"peerDependenciesMeta": {
				"supports-color": {
					"optional": true
				}
			}
		},
		"node_modules/defu": {
			"version": "6.1.4",
			"resolved": "https://registry.npmjs.org/defu/-/defu-6.1.4.tgz",
			"integrity": "sha512-mEQCMmwJu317oSz8CwdIOdwf3xMif1ttiM8LTufzc3g6kR+9Pe236twL8j3IYT1F7GfRgGcW6MWxzZjLIkuHIg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/depd": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
			"integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/dequal": {
			"version": "2.0.3",
			"resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
			"integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
			"license": "MIT",
			"engines": {
				"node": ">=6"
			}
		},
		"node_modules/detect-libc": {
			"version": "2.0.4",
			"resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.0.4.tgz",
			"integrity": "sha512-3UDv+G9CsCKO1WKMGw9fwq/SWJYbI0c5Y7LU1AXYoDdbhE2AHQ6N6Nb34sG8Fj7T5APy8qXDCKuuIHd1BR0tVA==",
			"dev": true,
			"license": "Apache-2.0",
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/diff-match-patch": {
			"version": "1.0.5",
			"resolved": "https://registry.npmjs.org/diff-match-patch/-/diff-match-patch-1.0.5.tgz",
			"integrity": "sha512-IayShXAgj/QMXgB0IWmKx+rOPuGMhqm5w6jvFxmVenXKIzRqTAAsbBPT3kWQeGANj3jGgvcvv4yK6SxqYmikgw==",
			"license": "Apache-2.0"
		},
		"node_modules/dunder-proto": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
			"integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
			"license": "MIT",
			"dependencies": {
				"call-bind-apply-helpers": "^1.0.1",
				"es-errors": "^1.3.0",
				"gopd": "^1.2.0"
			},
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/ee-first": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
			"integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
			"license": "MIT"
		},
		"node_modules/encodeurl": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
			"integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/entities": {
			"version": "4.5.0",
			"resolved": "https://registry.npmjs.org/entities/-/entities-4.5.0.tgz",
			"integrity": "sha512-V0hjH4dGPh9Ao5p0MoRY6BVqtwCjhz6vI5LT8AJ55H+4g9/4vbHx1I54fS0XuclLhDHArPQCiMjDxjaL8fPxhw==",
			"dev": true,
			"license": "BSD-2-Clause",
			"engines": {
				"node": ">=0.12"
			},
			"funding": {
				"url": "https://github.com/fb55/entities?sponsor=1"
			}
		},
		"node_modules/es-define-property": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
			"integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/es-errors": {
			"version": "1.3.0",
			"resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
			"integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/es-object-atoms": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
			"integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
			"license": "MIT",
			"dependencies": {
				"es-errors": "^1.3.0"
			},
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/esbuild": {
			"version": "0.25.5",
			"resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.5.tgz",
			"integrity": "sha512-P8OtKZRv/5J5hhz0cUAdu/cLuPIKXpQl1R9pZtvmHWQvrAUVd0UNIPT4IB4W3rNOqVO0rlqHmCIbSwxh/c9yUQ==",
			"dev": true,
			"hasInstallScript": true,
			"license": "MIT",
			"bin": {
				"esbuild": "bin/esbuild"
			},
			"engines": {
				"node": ">=18"
			},
			"optionalDependencies": {
				"@esbuild/aix-ppc64": "0.25.5",
				"@esbuild/android-arm": "0.25.5",
				"@esbuild/android-arm64": "0.25.5",
				"@esbuild/android-x64": "0.25.5",
				"@esbuild/darwin-arm64": "0.25.5",
				"@esbuild/darwin-x64": "0.25.5",
				"@esbuild/freebsd-arm64": "0.25.5",
				"@esbuild/freebsd-x64": "0.25.5",
				"@esbuild/linux-arm": "0.25.5",
				"@esbuild/linux-arm64": "0.25.5",
				"@esbuild/linux-ia32": "0.25.5",
				"@esbuild/linux-loong64": "0.25.5",
				"@esbuild/linux-mips64el": "0.25.5",
				"@esbuild/linux-ppc64": "0.25.5",
				"@esbuild/linux-riscv64": "0.25.5",
				"@esbuild/linux-s390x": "0.25.5",
				"@esbuild/linux-x64": "0.25.5",
				"@esbuild/netbsd-arm64": "0.25.5",
				"@esbuild/netbsd-x64": "0.25.5",
				"@esbuild/openbsd-arm64": "0.25.5",
				"@esbuild/openbsd-x64": "0.25.5",
				"@esbuild/sunos-x64": "0.25.5",
				"@esbuild/win32-arm64": "0.25.5",
				"@esbuild/win32-ia32": "0.25.5",
				"@esbuild/win32-x64": "0.25.5"
			}
		},
		"node_modules/escape-html": {
			"version": "1.0.3",
			"resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
			"integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
			"license": "MIT"
		},
		"node_modules/escape-string-regexp": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-2.0.0.tgz",
			"integrity": "sha512-UpzcLCXolUWcNu5HtVMHYdXJjArjsF9C0aNnquZYY4uW/Vu0miy5YoWvbV345HauVvcAUnpRuhMMcqTcGOY2+w==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/etag": {
			"version": "1.8.1",
			"resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
			"integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/event-target-polyfill": {
			"version": "0.0.4",
			"resolved": "https://registry.npmjs.org/event-target-polyfill/-/event-target-polyfill-0.0.4.tgz",
			"integrity": "sha512-Gs6RLjzlLRdT8X9ZipJdIZI/Y6/HhRLyq9RdDlCsnpxr/+Nn6bU2EFGuC94GjxqhM+Nmij2Vcq98yoHrU8uNFQ==",
			"license": "MIT"
		},
		"node_modules/eventsource": {
			"version": "3.0.7",
			"resolved": "https://registry.npmjs.org/eventsource/-/eventsource-3.0.7.tgz",
			"integrity": "sha512-CRT1WTyuQoD771GW56XEZFQ/ZoSfWid1alKGDYMmkt2yl8UXrVR4pspqWNEcqKvVIzg6PAltWjxcSSPrboA4iA==",
			"license": "MIT",
			"dependencies": {
				"eventsource-parser": "^3.0.1"
			},
			"engines": {
				"node": ">=18.0.0"
			}
		},
		"node_modules/eventsource-parser": {
			"version": "3.0.2",
			"resolved": "https://registry.npmjs.org/eventsource-parser/-/eventsource-parser-3.0.2.tgz",
			"integrity": "sha512-6RxOBZ/cYgd8usLwsEl+EC09Au/9BcmCKYF2/xbml6DNczf7nv0MQb+7BA2F+li6//I+28VNlQR37XfQtcAJuA==",
			"license": "MIT",
			"engines": {
				"node": ">=18.0.0"
			}
		},
		"node_modules/exit-hook": {
			"version": "2.2.1",
			"resolved": "https://registry.npmjs.org/exit-hook/-/exit-hook-2.2.1.tgz",
			"integrity": "sha512-eNTPlAD67BmP31LDINZ3U7HSF8l57TxOY2PmBJ1shpCvpnxBF93mWCE8YHBnXs8qiUZJc9WDcWIeC3a2HIAMfw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=6"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/express": {
			"version": "5.1.0",
			"resolved": "https://registry.npmjs.org/express/-/express-5.1.0.tgz",
			"integrity": "sha512-DT9ck5YIRU+8GYzzU5kT3eHGA5iL+1Zd0EutOmTE9Dtk+Tvuzd23VBU+ec7HPNSTxXYO55gPV/hq4pSBJDjFpA==",
			"license": "MIT",
			"dependencies": {
				"accepts": "^2.0.0",
				"body-parser": "^2.2.0",
				"content-disposition": "^1.0.0",
				"content-type": "^1.0.5",
				"cookie": "^0.7.1",
				"cookie-signature": "^1.2.1",
				"debug": "^4.4.0",
				"encodeurl": "^2.0.0",
				"escape-html": "^1.0.3",
				"etag": "^1.8.1",
				"finalhandler": "^2.1.0",
				"fresh": "^2.0.0",
				"http-errors": "^2.0.0",
				"merge-descriptors": "^2.0.0",
				"mime-types": "^3.0.0",
				"on-finished": "^2.4.1",
				"once": "^1.4.0",
				"parseurl": "^1.3.3",
				"proxy-addr": "^2.0.7",
				"qs": "^6.14.0",
				"range-parser": "^1.2.1",
				"router": "^2.2.0",
				"send": "^1.1.0",
				"serve-static": "^2.2.0",
				"statuses": "^2.0.1",
				"type-is": "^2.0.1",
				"vary": "^1.1.2"
			},
			"engines": {
				"node": ">= 18"
			},
			"funding": {
				"type": "opencollective",
				"url": "https://opencollective.com/express"
			}
		},
		"node_modules/express-rate-limit": {
			"version": "7.5.0",
			"resolved": "https://registry.npmjs.org/express-rate-limit/-/express-rate-limit-7.5.0.tgz",
			"integrity": "sha512-eB5zbQh5h+VenMPM3fh+nw1YExi5nMr6HUCR62ELSP11huvxm/Uir1H1QEyTkk5QX6A58pX6NmaTMceKZ0Eodg==",
			"license": "MIT",
			"engines": {
				"node": ">= 16"
			},
			"funding": {
				"url": "https://github.com/sponsors/express-rate-limit"
			},
			"peerDependencies": {
				"express": "^4.11 || 5 || ^5.0.0-beta.1"
			}
		},
		"node_modules/exsolve": {
			"version": "1.0.5",
			"resolved": "https://registry.npmjs.org/exsolve/-/exsolve-1.0.5.tgz",
			"integrity": "sha512-pz5dvkYYKQ1AHVrgOzBKWeP4u4FRb3a6DNK2ucr0OoNwYIU4QWsJ+NM36LLzORT+z845MzKHHhpXiUF5nvQoJg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/fast-deep-equal": {
			"version": "3.1.3",
			"resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
			"integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
			"license": "MIT"
		},
		"node_modules/fast-glob": {
			"version": "3.3.3",
			"resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
			"integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@nodelib/fs.stat": "^2.0.2",
				"@nodelib/fs.walk": "^1.2.3",
				"glob-parent": "^5.1.2",
				"merge2": "^1.3.0",
				"micromatch": "^4.0.8"
			},
			"engines": {
				"node": ">=8.6.0"
			}
		},
		"node_modules/fast-json-stable-stringify": {
			"version": "2.1.0",
			"resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
			"integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
			"license": "MIT"
		},
		"node_modules/fastq": {
			"version": "1.19.1",
			"resolved": "https://registry.npmjs.org/fastq/-/fastq-1.19.1.tgz",
			"integrity": "sha512-GwLTyxkCXjXbxqIhTsMI2Nui8huMPtnxg7krajPJAjnEG/iiOS7i+zCtWGZR9G0NBKbXKh6X9m9UIsYX/N6vvQ==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"reusify": "^1.0.4"
			}
		},
		"node_modules/file-set": {
			"version": "5.2.2",
			"resolved": "https://registry.npmjs.org/file-set/-/file-set-5.2.2.tgz",
			"integrity": "sha512-/KgJI1V/QaDK4enOk/E2xMFk1cTWJghEr7UmWiRZfZ6upt6gQCfMn4jJ7aOm64OKurj4TaVnSSgSDqv5ZKYA3A==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"array-back": "^6.2.2",
				"fast-glob": "^3.3.2"
			},
			"engines": {
				"node": ">=12.17"
			},
			"peerDependencies": {
				"@75lb/nature": "latest"
			},
			"peerDependenciesMeta": {
				"@75lb/nature": {
					"optional": true
				}
			}
		},
		"node_modules/fill-range": {
			"version": "7.1.1",
			"resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
			"integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"to-regex-range": "^5.0.1"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/finalhandler": {
			"version": "2.1.0",
			"resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.0.tgz",
			"integrity": "sha512-/t88Ty3d5JWQbWYgaOGCCYfXRwV1+be02WqYYlL6h0lEiUAMPM8o8qKGO01YIkOHzka2up08wvgYD0mDiI+q3Q==",
			"license": "MIT",
			"dependencies": {
				"debug": "^4.4.0",
				"encodeurl": "^2.0.0",
				"escape-html": "^1.0.3",
				"on-finished": "^2.4.1",
				"parseurl": "^1.3.3",
				"statuses": "^2.0.1"
			},
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/forwarded": {
			"version": "0.2.0",
			"resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
			"integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/fresh": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
			"integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/fs-extra": {
			"version": "11.3.0",
			"resolved": "https://registry.npmjs.org/fs-extra/-/fs-extra-11.3.0.tgz",
			"integrity": "sha512-Z4XaCL6dUDHfP/jT25jJKMmtxvuwbkrD1vNSMFlo9lNLY2c5FHYSQgHPRZUjAB26TpDEoW9HCOgplrdbaPV/ew==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"graceful-fs": "^4.2.0",
				"jsonfile": "^6.0.1",
				"universalify": "^2.0.0"
			},
			"engines": {
				"node": ">=14.14"
			}
		},
		"node_modules/fsevents": {
			"version": "2.3.3",
			"resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
			"integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
			"dev": true,
			"hasInstallScript": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": "^8.16.0 || ^10.6.0 || >=11.0.0"
			}
		},
		"node_modules/function-bind": {
			"version": "1.1.2",
			"resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
			"integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
			"license": "MIT",
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/get-intrinsic": {
			"version": "1.3.0",
			"resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
			"integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
			"license": "MIT",
			"dependencies": {
				"call-bind-apply-helpers": "^1.0.2",
				"es-define-property": "^1.0.1",
				"es-errors": "^1.3.0",
				"es-object-atoms": "^1.1.1",
				"function-bind": "^1.1.2",
				"get-proto": "^1.0.1",
				"gopd": "^1.2.0",
				"has-symbols": "^1.1.0",
				"hasown": "^2.0.2",
				"math-intrinsics": "^1.1.0"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/get-proto": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
			"integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
			"license": "MIT",
			"dependencies": {
				"dunder-proto": "^1.0.1",
				"es-object-atoms": "^1.0.0"
			},
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/get-source": {
			"version": "2.0.12",
			"resolved": "https://registry.npmjs.org/get-source/-/get-source-2.0.12.tgz",
			"integrity": "sha512-X5+4+iD+HoSeEED+uwrQ07BOQr0kEDFMVqqpBuI+RaZBpBpHCuXxo70bjar6f0b0u/DQJsJ7ssurpP0V60Az+w==",
			"dev": true,
			"license": "Unlicense",
			"dependencies": {
				"data-uri-to-buffer": "^2.0.0",
				"source-map": "^0.6.1"
			}
		},
		"node_modules/get-tsconfig": {
			"version": "4.10.1",
			"resolved": "https://registry.npmjs.org/get-tsconfig/-/get-tsconfig-4.10.1.tgz",
			"integrity": "sha512-auHyJ4AgMz7vgS8Hp3N6HXSmlMdUyhSUrfBF16w153rxtLIEOE+HGqaBppczZvnHLqQJfiHotCYpNhl0lUROFQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"resolve-pkg-maps": "^1.0.0"
			},
			"funding": {
				"url": "https://github.com/privatenumber/get-tsconfig?sponsor=1"
			}
		},
		"node_modules/glob-parent": {
			"version": "5.1.2",
			"resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
			"integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"is-glob": "^4.0.1"
			},
			"engines": {
				"node": ">= 6"
			}
		},
		"node_modules/glob-to-regexp": {
			"version": "0.4.1",
			"resolved": "https://registry.npmjs.org/glob-to-regexp/-/glob-to-regexp-0.4.1.tgz",
			"integrity": "sha512-lkX1HJXwyMcprw/5YUZc2s7DrpAiHB21/V+E1rHUrVNokkvB6bqMzT0VfV6/86ZNabt1k14YOIaT7nDvOX3Iiw==",
			"dev": true,
			"license": "BSD-2-Clause"
		},
		"node_modules/gopd": {
			"version": "1.2.0",
			"resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
			"integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/graceful-fs": {
			"version": "4.2.11",
			"resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
			"integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
			"dev": true,
			"license": "ISC"
		},
		"node_modules/has-symbols": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
			"integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/hasown": {
			"version": "2.0.2",
			"resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
			"integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
			"license": "MIT",
			"dependencies": {
				"function-bind": "^1.1.2"
			},
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/hono": {
			"version": "4.8.0",
			"resolved": "https://registry.npmjs.org/hono/-/hono-4.8.0.tgz",
			"integrity": "sha512-NoiHrqJxoe1MYXqW+/0/Q4NCizKj2Ivm4KmX8mOSBtw9UJ7KYaOGKkO7csIwO5UlZpfvVRdcgiMb0GGyjEjtcw==",
			"license": "MIT",
			"engines": {
				"node": ">=16.9.0"
			}
		},
		"node_modules/http-errors": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.0.tgz",
			"integrity": "sha512-FtwrG/euBzaEjYeRqOgly7G0qviiXoJWnvEH2Z1plBdXgbyjv34pHTSb9zoeHMyDy33+DWy5Wt9Wo+TURtOYSQ==",
			"license": "MIT",
			"dependencies": {
				"depd": "2.0.0",
				"inherits": "2.0.4",
				"setprototypeof": "1.2.0",
				"statuses": "2.0.1",
				"toidentifier": "1.0.1"
			},
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/http-errors/node_modules/statuses": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.1.tgz",
			"integrity": "sha512-RwNA9Z/7PrK06rYLIzFMlaF+l73iwpzsqRIFgbMLbTcLD6cOao82TaWefPXQvB2fOC4AjuYSEndS7N/mTCbkdQ==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/iconv-lite": {
			"version": "0.6.3",
			"resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.6.3.tgz",
			"integrity": "sha512-4fCk79wshMdzMp2rH06qWrJE4iolqLhCUH+OiuIgU++RB0+94NlDL81atO7GX55uUKueo0txHNtvEyI6D7WdMw==",
			"license": "MIT",
			"dependencies": {
				"safer-buffer": ">= 2.1.2 < 3.0.0"
			},
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/inherits": {
			"version": "2.0.4",
			"resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
			"integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
			"license": "ISC"
		},
		"node_modules/ipaddr.js": {
			"version": "1.9.1",
			"resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
			"integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.10"
			}
		},
		"node_modules/is-arrayish": {
			"version": "0.3.2",
			"resolved": "https://registry.npmjs.org/is-arrayish/-/is-arrayish-0.3.2.tgz",
			"integrity": "sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/is-extglob": {
			"version": "2.1.1",
			"resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
			"integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/is-glob": {
			"version": "4.0.3",
			"resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
			"integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"is-extglob": "^2.1.1"
			},
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/is-number": {
			"version": "7.0.0",
			"resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
			"integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=0.12.0"
			}
		},
		"node_modules/is-promise": {
			"version": "4.0.0",
			"resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
			"integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
			"license": "MIT"
		},
		"node_modules/isexe": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
			"integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
			"license": "ISC"
		},
		"node_modules/js2xmlparser": {
			"version": "4.0.2",
			"resolved": "https://registry.npmjs.org/js2xmlparser/-/js2xmlparser-4.0.2.tgz",
			"integrity": "sha512-6n4D8gLlLf1n5mNLQPRfViYzu9RATblzPEtm1SthMX1Pjao0r9YI9nw7ZIfRxQMERS87mcswrg+r/OYrPRX6jA==",
			"dev": true,
			"license": "Apache-2.0",
			"dependencies": {
				"xmlcreate": "^2.0.4"
			}
		},
		"node_modules/jsdoc": {
			"version": "4.0.4",
			"resolved": "https://registry.npmjs.org/jsdoc/-/jsdoc-4.0.4.tgz",
			"integrity": "sha512-zeFezwyXeG4syyYHbvh1A967IAqq/67yXtXvuL5wnqCkFZe8I0vKfm+EO+YEvLguo6w9CDUbrAXVtJSHh2E8rw==",
			"dev": true,
			"license": "Apache-2.0",
			"dependencies": {
				"@babel/parser": "^7.20.15",
				"@jsdoc/salty": "^0.2.1",
				"@types/markdown-it": "^14.1.1",
				"bluebird": "^3.7.2",
				"catharsis": "^0.9.0",
				"escape-string-regexp": "^2.0.0",
				"js2xmlparser": "^4.0.2",
				"klaw": "^3.0.0",
				"markdown-it": "^14.1.0",
				"markdown-it-anchor": "^8.6.7",
				"marked": "^4.0.10",
				"mkdirp": "^1.0.4",
				"requizzle": "^0.2.3",
				"strip-json-comments": "^3.1.0",
				"underscore": "~1.13.2"
			},
			"bin": {
				"jsdoc": "jsdoc.js"
			},
			"engines": {
				"node": ">=12.0.0"
			}
		},
		"node_modules/jsdoc-api": {
			"version": "9.3.4",
			"resolved": "https://registry.npmjs.org/jsdoc-api/-/jsdoc-api-9.3.4.tgz",
			"integrity": "sha512-di8lggLACEttpyAZ6WjKKafUP4wC4prAGjt40nMl7quDpp2nD7GmLt6/WxhRu9Q6IYoAAySsNeidBXYVAMwlqg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"array-back": "^6.2.2",
				"cache-point": "^3.0.0",
				"current-module-paths": "^1.1.2",
				"file-set": "^5.2.2",
				"jsdoc": "^4.0.4",
				"object-to-spawn-args": "^2.0.1",
				"walk-back": "^5.1.1"
			},
			"engines": {
				"node": ">=12.17"
			},
			"peerDependencies": {
				"@75lb/nature": "latest"
			},
			"peerDependenciesMeta": {
				"@75lb/nature": {
					"optional": true
				}
			}
		},
		"node_modules/jsdoc/node_modules/marked": {
			"version": "4.3.0",
			"resolved": "https://registry.npmjs.org/marked/-/marked-4.3.0.tgz",
			"integrity": "sha512-PRsaiG84bK+AMvxziE/lCFss8juXjNaWzVbN5tXAm4XjeaS9NAHhop+PjQxz2A9h8Q4M/xGmzP8vqNwy6JeK0A==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"marked": "bin/marked.js"
			},
			"engines": {
				"node": ">= 12"
			}
		},
		"node_modules/json-schema": {
			"version": "0.4.0",
			"resolved": "https://registry.npmjs.org/json-schema/-/json-schema-0.4.0.tgz",
			"integrity": "sha512-es94M3nTIfsEPisRafak+HDLfHXnKBhV3vU5eqPcS3flIWqcxJWgXHXiey3YrpaNsanY5ei1VoYEbOzijuq9BA==",
			"license": "(AFL-2.1 OR BSD-3-Clause)"
		},
		"node_modules/json-schema-traverse": {
			"version": "0.4.1",
			"resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
			"integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
			"license": "MIT"
		},
		"node_modules/jsondiffpatch": {
			"version": "0.6.0",
			"resolved": "https://registry.npmjs.org/jsondiffpatch/-/jsondiffpatch-0.6.0.tgz",
			"integrity": "sha512-3QItJOXp2AP1uv7waBkao5nCvhEv+QmJAd38Ybq7wNI74Q+BBmnLn4EDKz6yI9xGAIQoUF87qHt+kc1IVxB4zQ==",
			"license": "MIT",
			"dependencies": {
				"@types/diff-match-patch": "^1.0.36",
				"chalk": "^5.3.0",
				"diff-match-patch": "^1.0.5"
			},
			"bin": {
				"jsondiffpatch": "bin/jsondiffpatch.js"
			},
			"engines": {
				"node": "^18.0.0 || >=20.0.0"
			}
		},
		"node_modules/jsonfile": {
			"version": "6.1.0",
			"resolved": "https://registry.npmjs.org/jsonfile/-/jsonfile-6.1.0.tgz",
			"integrity": "sha512-5dgndWOriYSm5cnYaJNhalLNDKOqFwyDB/rr1E9ZsGciGvKPs8R2xYGCacuf3z6K1YKDz182fd+fY3cn3pMqXQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"universalify": "^2.0.0"
			},
			"optionalDependencies": {
				"graceful-fs": "^4.1.6"
			}
		},
		"node_modules/just-filter-object": {
			"version": "3.2.0",
			"resolved": "https://registry.npmjs.org/just-filter-object/-/just-filter-object-3.2.0.tgz",
			"integrity": "sha512-OeorYJxmp2zhy/0LxjS1UjbJ7XMY8M4gVa1RRKxnIVheCYmng2E2hE0lEbDGv4aRh/HI7FgNUXtOMnmNxpoXRQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/just-map-values": {
			"version": "3.2.0",
			"resolved": "https://registry.npmjs.org/just-map-values/-/just-map-values-3.2.0.tgz",
			"integrity": "sha512-TyqCKtK3NxiUgOjRYMIKURvBTHesi3XzomDY0QVPZ3rYzLCF+nNq5rSi0B/L5aOd/WMTZo6ukzA4wih4HUbrDg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/klaw": {
			"version": "3.0.0",
			"resolved": "https://registry.npmjs.org/klaw/-/klaw-3.0.0.tgz",
			"integrity": "sha512-0Fo5oir+O9jnXu5EefYbVK+mHMBeEVEy2cmctR1O1NECcCkPRreJKrS6Qt/j3KC2C148Dfo9i3pCmCMsdqGr0g==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"graceful-fs": "^4.1.9"
			}
		},
		"node_modules/linkify-it": {
			"version": "5.0.0",
			"resolved": "https://registry.npmjs.org/linkify-it/-/linkify-it-5.0.0.tgz",
			"integrity": "sha512-5aHCbzQRADcdP+ATqnDuhhJ/MRIqDkZX5pyjFHRRysS8vZ5AbqGEoFIb6pYHPZ+L/OC2Lc+xT8uHVVR5CAK/wQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"uc.micro": "^2.0.0"
			}
		},
		"node_modules/lodash": {
			"version": "4.17.21",
			"resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
			"integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/markdown-it": {
			"version": "14.1.0",
			"resolved": "https://registry.npmjs.org/markdown-it/-/markdown-it-14.1.0.tgz",
			"integrity": "sha512-a54IwgWPaeBCAAsv13YgmALOF1elABB08FxO9i+r4VFk5Vl4pKokRPeX8u5TCgSsPi6ec1otfLjdOpVcgbpshg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"argparse": "^2.0.1",
				"entities": "^4.4.0",
				"linkify-it": "^5.0.0",
				"mdurl": "^2.0.0",
				"punycode.js": "^2.3.1",
				"uc.micro": "^2.1.0"
			},
			"bin": {
				"markdown-it": "bin/markdown-it.mjs"
			}
		},
		"node_modules/markdown-it-anchor": {
			"version": "8.6.7",
			"resolved": "https://registry.npmjs.org/markdown-it-anchor/-/markdown-it-anchor-8.6.7.tgz",
			"integrity": "sha512-FlCHFwNnutLgVTflOYHPW2pPcl2AACqVzExlkGQNsi4CJgqOHN7YTgDd4LuhgN1BFO3TS0vLAruV1Td6dwWPJA==",
			"dev": true,
			"license": "Unlicense",
			"peerDependencies": {
				"@types/markdown-it": "*",
				"markdown-it": "*"
			}
		},
		"node_modules/marked": {
			"version": "15.0.12",
			"resolved": "https://registry.npmjs.org/marked/-/marked-15.0.12.tgz",
			"integrity": "sha512-8dD6FusOQSrpv9Z1rdNMdlSgQOIP880DHqnohobOmYLElGEqAL/JvxvuxZO16r4HtjTlfPRDC1hbvxC9dPN2nA==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"marked": "bin/marked.js"
			},
			"engines": {
				"node": ">= 18"
			}
		},
		"node_modules/math-intrinsics": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
			"integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			}
		},
		"node_modules/mdurl": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/mdurl/-/mdurl-2.0.0.tgz",
			"integrity": "sha512-Lf+9+2r+Tdp5wXDXC4PcIBjTDtq4UKjCPMQhKIuzpJNW0b96kVqSwW0bT7FhRSfmAiFYgP+SCRvdrDozfh0U5w==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/media-typer": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.0.tgz",
			"integrity": "sha512-aisnrDP4GNe06UcKFnV5bfMNPBUw4jsLGaWwWfnH3v02GnBuXX2MCVn5RbrWo0j3pczUilYblq7fQ7Nw2t5XKw==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/merge-descriptors": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
			"integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
			"license": "MIT",
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/merge2": {
			"version": "1.4.1",
			"resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
			"integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/micromatch": {
			"version": "4.0.8",
			"resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
			"integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"braces": "^3.0.3",
				"picomatch": "^2.3.1"
			},
			"engines": {
				"node": ">=8.6"
			}
		},
		"node_modules/mime": {
			"version": "3.0.0",
			"resolved": "https://registry.npmjs.org/mime/-/mime-3.0.0.tgz",
			"integrity": "sha512-jSCU7/VB1loIWBZe14aEYHU/+1UMEHoaO7qxCOVJOw9GgH72VAWppxNcjU+x9a2k3GSIBXNKxXQFqRvvZ7vr3A==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"mime": "cli.js"
			},
			"engines": {
				"node": ">=10.0.0"
			}
		},
		"node_modules/mime-db": {
			"version": "1.54.0",
			"resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
			"integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/mime-types": {
			"version": "3.0.1",
			"resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.1.tgz",
			"integrity": "sha512-xRc4oEhT6eaBpU1XF7AjpOFD+xQmXNB5OVKwp4tqCuBpHLS/ZbBDrc07mYTDqVMg6PfxUjjNp85O6Cd2Z/5HWA==",
			"license": "MIT",
			"dependencies": {
				"mime-db": "^1.54.0"
			},
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/miniflare": {
			"version": "4.20250612.0",
			"resolved": "https://registry.npmjs.org/miniflare/-/miniflare-4.20250612.0.tgz",
			"integrity": "sha512-zMUKXBS8Ru1DcmX8dSCmxm7ZjEd7jHQlZpJMNT1/LqxHo3KEye/CHgoEZ1vdsH7T3fe0I0qRcRQx7IWhlXnN1w==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@cspotcode/source-map-support": "0.8.1",
				"acorn": "8.14.0",
				"acorn-walk": "8.3.2",
				"exit-hook": "2.2.1",
				"glob-to-regexp": "0.4.1",
				"sharp": "^0.33.5",
				"stoppable": "1.1.0",
				"undici": "^5.28.5",
				"workerd": "1.20250612.0",
				"ws": "8.18.0",
				"youch": "3.3.4",
				"zod": "3.22.3"
			},
			"bin": {
				"miniflare": "bootstrap.js"
			},
			"engines": {
				"node": ">=18.0.0"
			}
		},
		"node_modules/miniflare/node_modules/zod": {
			"version": "3.22.3",
			"resolved": "https://registry.npmjs.org/zod/-/zod-3.22.3.tgz",
			"integrity": "sha512-EjIevzuJRiRPbVH4mGc8nApb/lVLKVpmUhAaR5R5doKGfAnGJ6Gr3CViAVjP+4FWSxCsybeWQdcgCtbX+7oZug==",
			"dev": true,
			"license": "MIT",
			"funding": {
				"url": "https://github.com/sponsors/colinhacks"
			}
		},
		"node_modules/mkdirp": {
			"version": "1.0.4",
			"resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-1.0.4.tgz",
			"integrity": "sha512-vVqVZQyf3WLx2Shd0qJ9xuvqgAyKPLAiqITEtqW0oIUjzo3PePDd6fW9iFz30ef7Ysp/oiWqbhszeGWW2T6Gzw==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"mkdirp": "bin/cmd.js"
			},
			"engines": {
				"node": ">=10"
			}
		},
		"node_modules/ms": {
			"version": "2.1.3",
			"resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
			"integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
			"license": "MIT"
		},
		"node_modules/mustache": {
			"version": "4.2.0",
			"resolved": "https://registry.npmjs.org/mustache/-/mustache-4.2.0.tgz",
			"integrity": "sha512-71ippSywq5Yb7/tVYyGbkBggbU8H3u5Rz56fH60jGFgr8uHwxs+aSKeqmluIVzM0m0kB7xQjKS6qPfd0b2ZoqQ==",
			"dev": true,
			"license": "MIT",
			"bin": {
				"mustache": "bin/mustache"
			}
		},
		"node_modules/nanoid": {
			"version": "5.1.5",
			"resolved": "https://registry.npmjs.org/nanoid/-/nanoid-5.1.5.tgz",
			"integrity": "sha512-Ir/+ZpE9fDsNH0hQ3C68uyThDXzYcim2EqcZ8zn8Chtt1iylPT9xXJB0kPCnqzgcEGikO9RxSrh63MsmVCU7Fw==",
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/ai"
				}
			],
			"license": "MIT",
			"bin": {
				"nanoid": "bin/nanoid.js"
			},
			"engines": {
				"node": "^18 || >=20"
			}
		},
		"node_modules/negotiator": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.0.0.tgz",
			"integrity": "sha512-8Ofs/AUQh8MaEcrlq5xOX0CQ9ypTF5dl78mjlMNfOK08fzpgTHQRQPBxcPlEtIw0yRpws+Zo/3r+5WRby7u3Gg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/npm-path": {
			"version": "2.0.4",
			"resolved": "https://registry.npmjs.org/npm-path/-/npm-path-2.0.4.tgz",
			"integrity": "sha512-IFsj0R9C7ZdR5cP+ET342q77uSRdtWOlWpih5eC+lu29tIDbNEgDbzgVJ5UFvYHWhxDZ5TFkJafFioO0pPQjCw==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"which": "^1.2.10"
			},
			"bin": {
				"npm-path": "bin/npm-path"
			},
			"engines": {
				"node": ">=0.8"
			}
		},
		"node_modules/npm-path/node_modules/which": {
			"version": "1.3.1",
			"resolved": "https://registry.npmjs.org/which/-/which-1.3.1.tgz",
			"integrity": "sha512-HxJdYWq1MTIQbJ3nw0cqssHoTNU267KlrDuGZ1WYlxDStUtKUhOaJmh112/TZmHxxUfuJqPXSOm7tDyas0OSIQ==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"isexe": "^2.0.0"
			},
			"bin": {
				"which": "bin/which"
			}
		},
		"node_modules/npm-which": {
			"version": "3.0.1",
			"resolved": "https://registry.npmjs.org/npm-which/-/npm-which-3.0.1.tgz",
			"integrity": "sha512-CM8vMpeFQ7MAPin0U3wzDhSGV0hMHNwHU0wjo402IVizPDrs45jSfSuoC+wThevY88LQti8VvaAnqYAeVy3I1A==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"commander": "^2.9.0",
				"npm-path": "^2.0.2",
				"which": "^1.2.10"
			},
			"bin": {
				"npm-which": "bin/npm-which.js"
			},
			"engines": {
				"node": ">=4.2.0"
			}
		},
		"node_modules/npm-which/node_modules/which": {
			"version": "1.3.1",
			"resolved": "https://registry.npmjs.org/which/-/which-1.3.1.tgz",
			"integrity": "sha512-HxJdYWq1MTIQbJ3nw0cqssHoTNU267KlrDuGZ1WYlxDStUtKUhOaJmh112/TZmHxxUfuJqPXSOm7tDyas0OSIQ==",
			"dev": true,
			"license": "ISC",
			"dependencies": {
				"isexe": "^2.0.0"
			},
			"bin": {
				"which": "bin/which"
			}
		},
		"node_modules/object-assign": {
			"version": "4.1.1",
			"resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
			"integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
			"license": "MIT",
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/object-inspect": {
			"version": "1.13.4",
			"resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
			"integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/object-to-spawn-args": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/object-to-spawn-args/-/object-to-spawn-args-2.0.1.tgz",
			"integrity": "sha512-6FuKFQ39cOID+BMZ3QaphcC8Y4cw6LXBLyIgPU+OhIYwviJamPAn+4mITapnSBQrejB+NNp+FMskhD8Cq+Ys3w==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=8.0.0"
			}
		},
		"node_modules/ohash": {
			"version": "2.0.11",
			"resolved": "https://registry.npmjs.org/ohash/-/ohash-2.0.11.tgz",
			"integrity": "sha512-RdR9FQrFwNBNXAr4GixM8YaRZRJ5PUWbKYbE5eOsrwAjJW0q2REGcf79oYPsLyskQCZG1PLN+S/K1V00joZAoQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/on-finished": {
			"version": "2.4.1",
			"resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
			"integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
			"license": "MIT",
			"dependencies": {
				"ee-first": "1.1.1"
			},
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/once": {
			"version": "1.4.0",
			"resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
			"integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
			"license": "ISC",
			"dependencies": {
				"wrappy": "1"
			}
		},
		"node_modules/parseurl": {
			"version": "1.3.3",
			"resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
			"integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/partyserver": {
			"version": "0.0.71",
			"resolved": "https://registry.npmjs.org/partyserver/-/partyserver-0.0.71.tgz",
			"integrity": "sha512-PJZoX08tyNcNJVXqWJedZ6Jzj8EOFGBA/PJ37KhAnWmTkq6A8SqA4u2ol+zq8zwSfRy9FPvVgABCY0yLpe62Dg==",
			"license": "ISC",
			"dependencies": {
				"nanoid": "^5.1.5"
			},
			"peerDependencies": {
				"@cloudflare/workers-types": "^4.20240729.0"
			}
		},
		"node_modules/partysocket": {
			"version": "1.1.4",
			"resolved": "https://registry.npmjs.org/partysocket/-/partysocket-1.1.4.tgz",
			"integrity": "sha512-jXP7PFj2h5/v4UjDS8P7MZy6NJUQ7sspiFyxL4uc/+oKOL+KdtXzHnTV8INPGxBrLTXgalyG3kd12Qm7WrYc3A==",
			"license": "ISC",
			"dependencies": {
				"event-target-polyfill": "^0.0.4"
			}
		},
		"node_modules/path-key": {
			"version": "3.1.1",
			"resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
			"integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
			"license": "MIT",
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/path-to-regexp": {
			"version": "8.2.0",
			"resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.2.0.tgz",
			"integrity": "sha512-TdrF7fW9Rphjq4RjrW0Kp2AW0Ahwu9sRGTkS6bvDi0SCwZlEZYmcfDbEsTz8RVk0EHIS/Vd1bv3JhG+1xZuAyQ==",
			"license": "MIT",
			"engines": {
				"node": ">=16"
			}
		},
		"node_modules/pathe": {
			"version": "2.0.3",
			"resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
			"integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/picocolors": {
			"version": "1.1.1",
			"resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
			"integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
			"dev": true,
			"license": "ISC"
		},
		"node_modules/picomatch": {
			"version": "2.3.1",
			"resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
			"integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=8.6"
			},
			"funding": {
				"url": "https://github.com/sponsors/jonschlinkert"
			}
		},
		"node_modules/pkce-challenge": {
			"version": "5.0.0",
			"resolved": "https://registry.npmjs.org/pkce-challenge/-/pkce-challenge-5.0.0.tgz",
			"integrity": "sha512-ueGLflrrnvwB3xuo/uGob5pd5FN7l0MsLf0Z87o/UQmRtwjvfylfc9MurIxRAWywCYTgrvpXBcqjV4OfCYGCIQ==",
			"license": "MIT",
			"engines": {
				"node": ">=16.20.0"
			}
		},
		"node_modules/printable-characters": {
			"version": "1.0.42",
			"resolved": "https://registry.npmjs.org/printable-characters/-/printable-characters-1.0.42.tgz",
			"integrity": "sha512-dKp+C4iXWK4vVYZmYSd0KBH5F/h1HoZRsbJ82AVKRO3PEo8L4lBS/vLwhVtpwwuYcoIsVY+1JYKR268yn480uQ==",
			"dev": true,
			"license": "Unlicense"
		},
		"node_modules/proxy-addr": {
			"version": "2.0.7",
			"resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.7.tgz",
			"integrity": "sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==",
			"license": "MIT",
			"dependencies": {
				"forwarded": "0.2.0",
				"ipaddr.js": "1.9.1"
			},
			"engines": {
				"node": ">= 0.10"
			}
		},
		"node_modules/punycode": {
			"version": "2.3.1",
			"resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
			"integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
			"license": "MIT",
			"engines": {
				"node": ">=6"
			}
		},
		"node_modules/punycode.js": {
			"version": "2.3.1",
			"resolved": "https://registry.npmjs.org/punycode.js/-/punycode.js-2.3.1.tgz",
			"integrity": "sha512-uxFIHU0YlHYhDQtV4R9J6a52SLx28BCjT+4ieh7IGbgwVJWO+km431c4yRlREUAsAmt/uMjQUyQHNEPf0M39CA==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=6"
			}
		},
		"node_modules/qs": {
			"version": "6.14.0",
			"resolved": "https://registry.npmjs.org/qs/-/qs-6.14.0.tgz",
			"integrity": "sha512-YWWTjgABSKcvs/nWBi9PycY/JiPJqOD4JA6o9Sej2AtvSGarXxKC3OQSk4pAarbdQlKAh5D4FCQkJNkW+GAn3w==",
			"license": "BSD-3-Clause",
			"dependencies": {
				"side-channel": "^1.1.0"
			},
			"engines": {
				"node": ">=0.6"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/queue-microtask": {
			"version": "1.2.3",
			"resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
			"integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
			"dev": true,
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/feross"
				},
				{
					"type": "patreon",
					"url": "https://www.patreon.com/feross"
				},
				{
					"type": "consulting",
					"url": "https://feross.org/support"
				}
			],
			"license": "MIT"
		},
		"node_modules/range-parser": {
			"version": "1.2.1",
			"resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.2.1.tgz",
			"integrity": "sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/raw-body": {
			"version": "3.0.0",
			"resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.0.tgz",
			"integrity": "sha512-RmkhL8CAyCRPXCE28MMH0z2PNWQBNk2Q09ZdxM9IOOXwxwZbN+qbWaatPkdkWIKL2ZVDImrN/pK5HTRz2PcS4g==",
			"license": "MIT",
			"dependencies": {
				"bytes": "3.1.2",
				"http-errors": "2.0.0",
				"iconv-lite": "0.6.3",
				"unpipe": "1.0.0"
			},
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/react": {
			"version": "19.1.0",
			"resolved": "https://registry.npmjs.org/react/-/react-19.1.0.tgz",
			"integrity": "sha512-FS+XFBNvn3GTAWq26joslQgWNoFu08F4kl0J4CgdNKADkdSGXQyTCnKteIAJy96Br6YbpEU1LSzV5dYtjMkMDg==",
			"license": "MIT",
			"peer": true,
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/requizzle": {
			"version": "0.2.4",
			"resolved": "https://registry.npmjs.org/requizzle/-/requizzle-0.2.4.tgz",
			"integrity": "sha512-JRrFk1D4OQ4SqovXOgdav+K8EAhSB/LJZqCz8tbX0KObcdeM15Ss59ozWMBWmmINMagCwmqn4ZNryUGpBsl6Jw==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"lodash": "^4.17.21"
			}
		},
		"node_modules/resolve-pkg-maps": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/resolve-pkg-maps/-/resolve-pkg-maps-1.0.0.tgz",
			"integrity": "sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==",
			"dev": true,
			"license": "MIT",
			"funding": {
				"url": "https://github.com/privatenumber/resolve-pkg-maps?sponsor=1"
			}
		},
		"node_modules/reusify": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
			"integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"iojs": ">=1.0.0",
				"node": ">=0.10.0"
			}
		},
		"node_modules/router": {
			"version": "2.2.0",
			"resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
			"integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
			"license": "MIT",
			"dependencies": {
				"debug": "^4.4.0",
				"depd": "^2.0.0",
				"is-promise": "^4.0.0",
				"parseurl": "^1.3.3",
				"path-to-regexp": "^8.0.0"
			},
			"engines": {
				"node": ">= 18"
			}
		},
		"node_modules/run-parallel": {
			"version": "1.2.0",
			"resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
			"integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
			"dev": true,
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/feross"
				},
				{
					"type": "patreon",
					"url": "https://www.patreon.com/feross"
				},
				{
					"type": "consulting",
					"url": "https://feross.org/support"
				}
			],
			"license": "MIT",
			"dependencies": {
				"queue-microtask": "^1.2.2"
			}
		},
		"node_modules/safe-buffer": {
			"version": "5.2.1",
			"resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
			"integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
			"funding": [
				{
					"type": "github",
					"url": "https://github.com/sponsors/feross"
				},
				{
					"type": "patreon",
					"url": "https://www.patreon.com/feross"
				},
				{
					"type": "consulting",
					"url": "https://feross.org/support"
				}
			],
			"license": "MIT"
		},
		"node_modules/safer-buffer": {
			"version": "2.1.2",
			"resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
			"integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
			"license": "MIT"
		},
		"node_modules/secure-json-parse": {
			"version": "2.7.0",
			"resolved": "https://registry.npmjs.org/secure-json-parse/-/secure-json-parse-2.7.0.tgz",
			"integrity": "sha512-6aU+Rwsezw7VR8/nyvKTx8QpWH9FrcYiXXlqC4z5d5XQBDRqtbfsRjnwGyqbi3gddNtWHuEk9OANUotL26qKUw==",
			"license": "BSD-3-Clause"
		},
		"node_modules/semver": {
			"version": "7.7.2",
			"resolved": "https://registry.npmjs.org/semver/-/semver-7.7.2.tgz",
			"integrity": "sha512-RF0Fw+rO5AMf9MAyaRXI4AV0Ulj5lMHqVxxdSgiVbixSCXoEmmX/jk0CuJw4+3SqroYO9VoUh+HcuJivvtJemA==",
			"dev": true,
			"license": "ISC",
			"bin": {
				"semver": "bin/semver.js"
			},
			"engines": {
				"node": ">=10"
			}
		},
		"node_modules/send": {
			"version": "1.2.0",
			"resolved": "https://registry.npmjs.org/send/-/send-1.2.0.tgz",
			"integrity": "sha512-uaW0WwXKpL9blXE2o0bRhoL2EGXIrZxQ2ZQ4mgcfoBxdFmQold+qWsD2jLrfZ0trjKL6vOw0j//eAwcALFjKSw==",
			"license": "MIT",
			"dependencies": {
				"debug": "^4.3.5",
				"encodeurl": "^2.0.0",
				"escape-html": "^1.0.3",
				"etag": "^1.8.1",
				"fresh": "^2.0.0",
				"http-errors": "^2.0.0",
				"mime-types": "^3.0.1",
				"ms": "^2.1.3",
				"on-finished": "^2.4.1",
				"range-parser": "^1.2.1",
				"statuses": "^2.0.1"
			},
			"engines": {
				"node": ">= 18"
			}
		},
		"node_modules/serve-static": {
			"version": "2.2.0",
			"resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.0.tgz",
			"integrity": "sha512-61g9pCh0Vnh7IutZjtLGGpTA355+OPn2TyDv/6ivP2h/AdAVX9azsoxmg2/M6nZeQZNYBEwIcsne1mJd9oQItQ==",
			"license": "MIT",
			"dependencies": {
				"encodeurl": "^2.0.0",
				"escape-html": "^1.0.3",
				"parseurl": "^1.3.3",
				"send": "^1.2.0"
			},
			"engines": {
				"node": ">= 18"
			}
		},
		"node_modules/setprototypeof": {
			"version": "1.2.0",
			"resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
			"integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
			"license": "ISC"
		},
		"node_modules/sharp": {
			"version": "0.33.5",
			"resolved": "https://registry.npmjs.org/sharp/-/sharp-0.33.5.tgz",
			"integrity": "sha512-haPVm1EkS9pgvHrQ/F3Xy+hgcuMV0Wm9vfIBSiwZ05k+xgb0PkBQpGsAA/oWdDobNaZTH5ppvHtzCFbnSEwHVw==",
			"dev": true,
			"hasInstallScript": true,
			"license": "Apache-2.0",
			"dependencies": {
				"color": "^4.2.3",
				"detect-libc": "^2.0.3",
				"semver": "^7.6.3"
			},
			"engines": {
				"node": "^18.17.0 || ^20.3.0 || >=21.0.0"
			},
			"funding": {
				"url": "https://opencollective.com/libvips"
			},
			"optionalDependencies": {
				"@img/sharp-darwin-arm64": "0.33.5",
				"@img/sharp-darwin-x64": "0.33.5",
				"@img/sharp-libvips-darwin-arm64": "1.0.4",
				"@img/sharp-libvips-darwin-x64": "1.0.4",
				"@img/sharp-libvips-linux-arm": "1.0.5",
				"@img/sharp-libvips-linux-arm64": "1.0.4",
				"@img/sharp-libvips-linux-s390x": "1.0.4",
				"@img/sharp-libvips-linux-x64": "1.0.4",
				"@img/sharp-libvips-linuxmusl-arm64": "1.0.4",
				"@img/sharp-libvips-linuxmusl-x64": "1.0.4",
				"@img/sharp-linux-arm": "0.33.5",
				"@img/sharp-linux-arm64": "0.33.5",
				"@img/sharp-linux-s390x": "0.33.5",
				"@img/sharp-linux-x64": "0.33.5",
				"@img/sharp-linuxmusl-arm64": "0.33.5",
				"@img/sharp-linuxmusl-x64": "0.33.5",
				"@img/sharp-wasm32": "0.33.5",
				"@img/sharp-win32-ia32": "0.33.5",
				"@img/sharp-win32-x64": "0.33.5"
			}
		},
		"node_modules/shebang-command": {
			"version": "2.0.0",
			"resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
			"integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
			"license": "MIT",
			"dependencies": {
				"shebang-regex": "^3.0.0"
			},
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/shebang-regex": {
			"version": "3.0.0",
			"resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
			"integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
			"license": "MIT",
			"engines": {
				"node": ">=8"
			}
		},
		"node_modules/side-channel": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.0.tgz",
			"integrity": "sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==",
			"license": "MIT",
			"dependencies": {
				"es-errors": "^1.3.0",
				"object-inspect": "^1.13.3",
				"side-channel-list": "^1.0.0",
				"side-channel-map": "^1.0.1",
				"side-channel-weakmap": "^1.0.2"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/side-channel-list": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.0.tgz",
			"integrity": "sha512-FCLHtRD/gnpCiCHEiJLOwdmFP+wzCmDEkc9y7NsYxeF4u7Btsn1ZuwgwJGxImImHicJArLP4R0yX4c2KCrMrTA==",
			"license": "MIT",
			"dependencies": {
				"es-errors": "^1.3.0",
				"object-inspect": "^1.13.3"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/side-channel-map": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
			"integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
			"license": "MIT",
			"dependencies": {
				"call-bound": "^1.0.2",
				"es-errors": "^1.3.0",
				"get-intrinsic": "^1.2.5",
				"object-inspect": "^1.13.3"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/side-channel-weakmap": {
			"version": "1.0.2",
			"resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
			"integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
			"license": "MIT",
			"dependencies": {
				"call-bound": "^1.0.2",
				"es-errors": "^1.3.0",
				"get-intrinsic": "^1.2.5",
				"object-inspect": "^1.13.3",
				"side-channel-map": "^1.0.1"
			},
			"engines": {
				"node": ">= 0.4"
			},
			"funding": {
				"url": "https://github.com/sponsors/ljharb"
			}
		},
		"node_modules/simple-swizzle": {
			"version": "0.2.2",
			"resolved": "https://registry.npmjs.org/simple-swizzle/-/simple-swizzle-0.2.2.tgz",
			"integrity": "sha512-JA//kQgZtbuY83m+xT+tXJkmJncGMTFT+C+g2h2R9uxkYIrE2yy9sgmcLhCnw57/WSD+Eh3J97FPEDFnbXnDUg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"is-arrayish": "^0.3.1"
			}
		},
		"node_modules/sisteransi": {
			"version": "1.0.5",
			"resolved": "https://registry.npmjs.org/sisteransi/-/sisteransi-1.0.5.tgz",
			"integrity": "sha512-bLGGlR1QxBcynn2d5YmDX4MGjlZvy2MRBDRNHLJ8VI6l6+9FUiyTFNJ0IveOSP0bcXgVDPRcfGqA0pjaqUpfVg==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/source-map": {
			"version": "0.6.1",
			"resolved": "https://registry.npmjs.org/source-map/-/source-map-0.6.1.tgz",
			"integrity": "sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==",
			"dev": true,
			"license": "BSD-3-Clause",
			"engines": {
				"node": ">=0.10.0"
			}
		},
		"node_modules/stacktracey": {
			"version": "2.1.8",
			"resolved": "https://registry.npmjs.org/stacktracey/-/stacktracey-2.1.8.tgz",
			"integrity": "sha512-Kpij9riA+UNg7TnphqjH7/CzctQ/owJGNbFkfEeve4Z4uxT5+JapVLFXcsurIfN34gnTWZNJ/f7NMG0E8JDzTw==",
			"dev": true,
			"license": "Unlicense",
			"dependencies": {
				"as-table": "^1.0.36",
				"get-source": "^2.0.12"
			}
		},
		"node_modules/statuses": {
			"version": "2.0.2",
			"resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
			"integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/stoppable": {
			"version": "1.1.0",
			"resolved": "https://registry.npmjs.org/stoppable/-/stoppable-1.1.0.tgz",
			"integrity": "sha512-KXDYZ9dszj6bzvnEMRYvxgeTHU74QBFL54XKtP3nyMuJ81CFYtABZ3bAzL2EdFUaEwJOBOgENyFj3R7oTzDyyw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=4",
				"npm": ">=6"
			}
		},
		"node_modules/strip-json-comments": {
			"version": "3.1.1",
			"resolved": "https://registry.npmjs.org/strip-json-comments/-/strip-json-comments-3.1.1.tgz",
			"integrity": "sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=8"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/swr": {
			"version": "2.3.3",
			"resolved": "https://registry.npmjs.org/swr/-/swr-2.3.3.tgz",
			"integrity": "sha512-dshNvs3ExOqtZ6kJBaAsabhPdHyeY4P2cKwRCniDVifBMoG/SVI7tfLWqPXriVspf2Rg4tPzXJTnwaihIeFw2A==",
			"license": "MIT",
			"dependencies": {
				"dequal": "^2.0.3",
				"use-sync-external-store": "^1.4.0"
			},
			"peerDependencies": {
				"react": "^16.11.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
			}
		},
		"node_modules/throttleit": {
			"version": "2.1.0",
			"resolved": "https://registry.npmjs.org/throttleit/-/throttleit-2.1.0.tgz",
			"integrity": "sha512-nt6AMGKW1p/70DF/hGBdJB57B8Tspmbp5gfJ8ilhLnt7kkr2ye7hzD6NVG8GGErk2HWF34igrL2CXmNIkzKqKw==",
			"license": "MIT",
			"engines": {
				"node": ">=18"
			},
			"funding": {
				"url": "https://github.com/sponsors/sindresorhus"
			}
		},
		"node_modules/tmp": {
			"version": "0.2.3",
			"resolved": "https://registry.npmjs.org/tmp/-/tmp-0.2.3.tgz",
			"integrity": "sha512-nZD7m9iCPC5g0pYmcaxogYKggSfLsdxl8of3Q/oIbqCqLLIO9IAF0GWjX1z9NZRHPiXv8Wex4yDCaZsgEw0Y8w==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=14.14"
			}
		},
		"node_modules/tmp-promise": {
			"version": "3.0.3",
			"resolved": "https://registry.npmjs.org/tmp-promise/-/tmp-promise-3.0.3.tgz",
			"integrity": "sha512-RwM7MoPojPxsOBYnyd2hy0bxtIlVrihNs9pj5SUvY8Zz1sQcQG2tG1hSr8PDxfgEB8RNKDhqbIlroIarSNDNsQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"tmp": "^0.2.0"
			}
		},
		"node_modules/to-regex-range": {
			"version": "5.0.1",
			"resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
			"integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"is-number": "^7.0.0"
			},
			"engines": {
				"node": ">=8.0"
			}
		},
		"node_modules/toidentifier": {
			"version": "1.0.1",
			"resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
			"integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
			"license": "MIT",
			"engines": {
				"node": ">=0.6"
			}
		},
		"node_modules/ts-blank-space": {
			"version": "0.4.4",
			"resolved": "https://registry.npmjs.org/ts-blank-space/-/ts-blank-space-0.4.4.tgz",
			"integrity": "sha512-G6GkD6oEJ7j5gG2e5qAizfE4Ap7JXMpnN0CEp9FEt4LExdaqsdwB90aQsaAwcKhiSxVk5KoqFW9xfxTQ4lBUnQ==",
			"dev": true,
			"license": "Apache-2.0",
			"dependencies": {
				"typescript": "5.1.6 - 5.7.x"
			},
			"engines": {
				"node": ">=18.0.0"
			}
		},
		"node_modules/ts-blank-space/node_modules/typescript": {
			"version": "5.7.3",
			"resolved": "https://registry.npmjs.org/typescript/-/typescript-5.7.3.tgz",
			"integrity": "sha512-84MVSjMEHP+FQRPy3pX9sTVV/INIex71s9TL2Gm5FG/WG1SqXeKyZ0k7/blY/4FdOzI12CBy1vGc4og/eus0fw==",
			"dev": true,
			"license": "Apache-2.0",
			"bin": {
				"tsc": "bin/tsc",
				"tsserver": "bin/tsserver"
			},
			"engines": {
				"node": ">=14.17"
			}
		},
		"node_modules/tslib": {
			"version": "2.8.1",
			"resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
			"integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
			"dev": true,
			"license": "0BSD",
			"optional": true
		},
		"node_modules/tsx": {
			"version": "4.20.3",
			"resolved": "https://registry.npmjs.org/tsx/-/tsx-4.20.3.tgz",
			"integrity": "sha512-qjbnuR9Tr+FJOMBqJCW5ehvIo/buZq7vH7qD7JziU98h6l3qGy0a/yPFjwO+y0/T7GFpNgNAvEcPPVfyT8rrPQ==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"esbuild": "~0.25.0",
				"get-tsconfig": "^4.7.5"
			},
			"bin": {
				"tsx": "dist/cli.mjs"
			},
			"engines": {
				"node": ">=18.0.0"
			},
			"optionalDependencies": {
				"fsevents": "~2.3.3"
			}
		},
		"node_modules/type-is": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/type-is/-/type-is-2.0.1.tgz",
			"integrity": "sha512-OZs6gsjF4vMp32qrCbiVSkrFmXtG/AZhY3t0iAMrMBiAZyV9oALtXO8hsrHbMXF9x6L3grlFuwW2oAz7cav+Gw==",
			"license": "MIT",
			"dependencies": {
				"content-type": "^1.0.5",
				"media-typer": "^1.1.0",
				"mime-types": "^3.0.0"
			},
			"engines": {
				"node": ">= 0.6"
			}
		},
		"node_modules/typescript": {
			"version": "5.8.3",
			"resolved": "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
			"integrity": "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
			"dev": true,
			"license": "Apache-2.0",
			"bin": {
				"tsc": "bin/tsc",
				"tsserver": "bin/tsserver"
			},
			"engines": {
				"node": ">=14.17"
			}
		},
		"node_modules/uc.micro": {
			"version": "2.1.0",
			"resolved": "https://registry.npmjs.org/uc.micro/-/uc.micro-2.1.0.tgz",
			"integrity": "sha512-ARDJmphmdvUk6Glw7y9DQ2bFkKBHwQHLi2lsaH6PPmz/Ka9sFOBsBluozhDltWmnv9u/cF6Rt87znRTPV+yp/A==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/ufo": {
			"version": "1.6.1",
			"resolved": "https://registry.npmjs.org/ufo/-/ufo-1.6.1.tgz",
			"integrity": "sha512-9a4/uxlTWJ4+a5i0ooc1rU7C7YOw3wT+UGqdeNNHWnOF9qcMBgLRS+4IYUqbczewFx4mLEig6gawh7X6mFlEkA==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/underscore": {
			"version": "1.13.7",
			"resolved": "https://registry.npmjs.org/underscore/-/underscore-1.13.7.tgz",
			"integrity": "sha512-GMXzWtsc57XAtguZgaQViUOzs0KTkk8ojr3/xAxXLITqf/3EMwxC0inyETfDFjH/Krbhuep0HNbbjI9i/q3F3g==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/undici": {
			"version": "5.29.0",
			"resolved": "https://registry.npmjs.org/undici/-/undici-5.29.0.tgz",
			"integrity": "sha512-raqeBD6NQK4SkWhQzeYKd1KmIG6dllBOTt55Rmkt4HtI9mwdWtJljnrXjAFUBLTSN67HWrOIZ3EPF4kjUw80Bg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"@fastify/busboy": "^2.0.0"
			},
			"engines": {
				"node": ">=14.0"
			}
		},
		"node_modules/unenv": {
			"version": "2.0.0-rc.17",
			"resolved": "https://registry.npmjs.org/unenv/-/unenv-2.0.0-rc.17.tgz",
			"integrity": "sha512-B06u0wXkEd+o5gOCMl/ZHl5cfpYbDZKAT+HWTL+Hws6jWu7dCiqBBXXXzMFcFVJb8D4ytAnYmxJA83uwOQRSsg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"defu": "^6.1.4",
				"exsolve": "^1.0.4",
				"ohash": "^2.0.11",
				"pathe": "^2.0.3",
				"ufo": "^1.6.1"
			}
		},
		"node_modules/universalify": {
			"version": "2.0.1",
			"resolved": "https://registry.npmjs.org/universalify/-/universalify-2.0.1.tgz",
			"integrity": "sha512-gptHNQghINnc/vTGIk0SOFGFNXw7JVrlRUtConJRlvaw6DuX0wO5Jeko9sWrMBhh+PsYAZ7oXAiOnf/UKogyiw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">= 10.0.0"
			}
		},
		"node_modules/unpipe": {
			"version": "1.0.0",
			"resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
			"integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/uri-js": {
			"version": "4.4.1",
			"resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
			"integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
			"license": "BSD-2-Clause",
			"dependencies": {
				"punycode": "^2.1.0"
			}
		},
		"node_modules/use-sync-external-store": {
			"version": "1.5.0",
			"resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.5.0.tgz",
			"integrity": "sha512-Rb46I4cGGVBmjamjphe8L/UnvJD+uPPtTkNvX5mZgqdbavhI4EbgIWJiIHXJ8bc/i9EQGPRh4DwEURJ552Do0A==",
			"license": "MIT",
			"peerDependencies": {
				"react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
			}
		},
		"node_modules/vary": {
			"version": "1.1.2",
			"resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
			"integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
			"license": "MIT",
			"engines": {
				"node": ">= 0.8"
			}
		},
		"node_modules/walk-back": {
			"version": "5.1.1",
			"resolved": "https://registry.npmjs.org/walk-back/-/walk-back-5.1.1.tgz",
			"integrity": "sha512-e/FRLDVdZQWFrAzU6Hdvpm7D7m2ina833gIKLptQykRK49mmCYHLHq7UqjPDbxbKLZkTkW1rFqbengdE3sLfdw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=12.17"
			}
		},
		"node_modules/which": {
			"version": "2.0.2",
			"resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
			"integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
			"license": "ISC",
			"dependencies": {
				"isexe": "^2.0.0"
			},
			"bin": {
				"node-which": "bin/node-which"
			},
			"engines": {
				"node": ">= 8"
			}
		},
		"node_modules/workerd": {
			"version": "1.20250612.0",
			"resolved": "https://registry.npmjs.org/workerd/-/workerd-1.20250612.0.tgz",
			"integrity": "sha512-YWCjj4uZf3eH32epQy/c7tKWOInAswgFRAJoH6I/EY08OJKDfoJtKvRZj5f675KoJlKTPAoJ1ig/oE+RUKP3uw==",
			"dev": true,
			"hasInstallScript": true,
			"license": "Apache-2.0",
			"bin": {
				"workerd": "bin/workerd"
			},
			"engines": {
				"node": ">=16"
			},
			"optionalDependencies": {
				"@cloudflare/workerd-darwin-64": "1.20250612.0",
				"@cloudflare/workerd-darwin-arm64": "1.20250612.0",
				"@cloudflare/workerd-linux-64": "1.20250612.0",
				"@cloudflare/workerd-linux-arm64": "1.20250612.0",
				"@cloudflare/workerd-windows-64": "1.20250612.0"
			}
		},
		"node_modules/workers-mcp": {
			"version": "0.0.13",
			"resolved": "https://registry.npmjs.org/workers-mcp/-/workers-mcp-0.0.13.tgz",
			"integrity": "sha512-JoFASGioyaVAI1Rn+a4PJcV66cWthL7wnwZZYl1u3pwUz014Ym76sBPvGLuODWXjOkE7D3z+6CM4nH8pW4tlcA==",
			"dev": true,
			"license": "Apache-2.0",
			"dependencies": {
				"@clack/prompts": "^0.8.2",
				"@modelcontextprotocol/sdk": "^1.0.3",
				"@silvia-odwyer/photon-node": "^0.3.3",
				"chalk": "^5.3.0",
				"fs-extra": "^11.2.0",
				"jsdoc-api": "^9.3.4",
				"just-filter-object": "^3.2.0",
				"just-map-values": "^3.2.0",
				"npm-which": "^3.0.1",
				"tmp-promise": "^3.0.3",
				"ts-blank-space": "^0.4.4",
				"tsx": "^4.19.2"
			},
			"bin": {
				"workers-mcp": "dist/cli.js"
			},
			"engines": {
				"node": ">=16.17.0"
			}
		},
		"node_modules/wrangler": {
			"version": "4.20.1",
			"resolved": "https://registry.npmjs.org/wrangler/-/wrangler-4.20.1.tgz",
			"integrity": "sha512-XbjBqpi2vTJSxqacovcGK33UtCrnmUAC69kJWLD2UvIZc5Ixeh0jAdjd6N1mcQB2M1/A2jGQSA4Pkoqw/Xw3bQ==",
			"dev": true,
			"license": "MIT OR Apache-2.0",
			"dependencies": {
				"@cloudflare/kv-asset-handler": "0.4.0",
				"@cloudflare/unenv-preset": "2.3.3",
				"blake3-wasm": "2.1.5",
				"esbuild": "0.25.4",
				"miniflare": "4.20250612.0",
				"path-to-regexp": "6.3.0",
				"unenv": "2.0.0-rc.17",
				"workerd": "1.20250612.0"
			},
			"bin": {
				"wrangler": "bin/wrangler.js",
				"wrangler2": "bin/wrangler.js"
			},
			"engines": {
				"node": ">=18.0.0"
			},
			"optionalDependencies": {
				"fsevents": "~2.3.2"
			},
			"peerDependencies": {
				"@cloudflare/workers-types": "^4.20250612.0"
			},
			"peerDependenciesMeta": {
				"@cloudflare/workers-types": {
					"optional": true
				}
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/aix-ppc64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.4.tgz",
			"integrity": "sha512-1VCICWypeQKhVbE9oW/sJaAmjLxhVqacdkvPLEjwlttjfwENRSClS8EjBz0KzRyFSCPDIkuXW34Je/vk7zdB7Q==",
			"cpu": [
				"ppc64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"aix"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/android-arm": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.4.tgz",
			"integrity": "sha512-QNdQEps7DfFwE3hXiU4BZeOV68HHzYwGd0Nthhd3uCkkEKK7/R6MTgM0P7H7FAs5pU/DIWsviMmEGxEoxIZ+ZQ==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/android-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.4.tgz",
			"integrity": "sha512-bBy69pgfhMGtCnwpC/x5QhfxAz/cBgQ9enbtwjf6V9lnPI/hMyT9iWpR1arm0l3kttTr4L0KSLpKmLp/ilKS9A==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/android-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.4.tgz",
			"integrity": "sha512-TVhdVtQIFuVpIIR282btcGC2oGQoSfZfmBdTip2anCaVYcqWlZXGcdcKIUklfX2wj0JklNYgz39OBqh2cqXvcQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"android"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/darwin-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.4.tgz",
			"integrity": "sha512-Y1giCfM4nlHDWEfSckMzeWNdQS31BQGs9/rouw6Ub91tkK79aIMTH3q9xHvzH8d0wDru5Ci0kWB8b3up/nl16g==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/darwin-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.4.tgz",
			"integrity": "sha512-CJsry8ZGM5VFVeyUYB3cdKpd/H69PYez4eJh1W/t38vzutdjEjtP7hB6eLKBoOdxcAlCtEYHzQ/PJ/oU9I4u0A==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"darwin"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/freebsd-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.4.tgz",
			"integrity": "sha512-yYq+39NlTRzU2XmoPW4l5Ifpl9fqSk0nAJYM/V/WUGPEFfek1epLHJIkTQM6bBs1swApjO5nWgvr843g6TjxuQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/freebsd-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.4.tgz",
			"integrity": "sha512-0FgvOJ6UUMflsHSPLzdfDnnBBVoCDtBTVyn/MrWloUNvq/5SFmh13l3dvgRPkDihRxb77Y17MbqbCAa2strMQQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"freebsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-arm": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.4.tgz",
			"integrity": "sha512-kro4c0P85GMfFYqW4TWOpvmF8rFShbWGnrLqlzp4X1TNWjRY3JMYUfDCtOxPKOIY8B0WC8HN51hGP4I4hz4AaQ==",
			"cpu": [
				"arm"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.4.tgz",
			"integrity": "sha512-+89UsQTfXdmjIvZS6nUnOOLoXnkUTB9hR5QAeLrQdzOSWZvNSAXAtcRDHWtqAUtAmv7ZM1WPOOeSxDzzzMogiQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-ia32": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.4.tgz",
			"integrity": "sha512-yTEjoapy8UP3rv8dB0ip3AfMpRbyhSN3+hY8mo/i4QXFeDxmiYbEKp3ZRjBKcOP862Ua4b1PDfwlvbuwY7hIGQ==",
			"cpu": [
				"ia32"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-loong64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.4.tgz",
			"integrity": "sha512-NeqqYkrcGzFwi6CGRGNMOjWGGSYOpqwCjS9fvaUlX5s3zwOtn1qwg1s2iE2svBe4Q/YOG1q6875lcAoQK/F4VA==",
			"cpu": [
				"loong64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-mips64el": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.4.tgz",
			"integrity": "sha512-IcvTlF9dtLrfL/M8WgNI/qJYBENP3ekgsHbYUIzEzq5XJzzVEV/fXY9WFPfEEXmu3ck2qJP8LG/p3Q8f7Zc2Xg==",
			"cpu": [
				"mips64el"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-ppc64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.4.tgz",
			"integrity": "sha512-HOy0aLTJTVtoTeGZh4HSXaO6M95qu4k5lJcH4gxv56iaycfz1S8GO/5Jh6X4Y1YiI0h7cRyLi+HixMR+88swag==",
			"cpu": [
				"ppc64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-riscv64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.4.tgz",
			"integrity": "sha512-i8JUDAufpz9jOzo4yIShCTcXzS07vEgWzyX3NH2G7LEFVgrLEhjwL3ajFE4fZI3I4ZgiM7JH3GQ7ReObROvSUA==",
			"cpu": [
				"riscv64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-s390x": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.4.tgz",
			"integrity": "sha512-jFnu+6UbLlzIjPQpWCNh5QtrcNfMLjgIavnwPQAfoGx4q17ocOU9MsQ2QVvFxwQoWpZT8DvTLooTvmOQXkO51g==",
			"cpu": [
				"s390x"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/linux-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.4.tgz",
			"integrity": "sha512-6e0cvXwzOnVWJHq+mskP8DNSrKBr1bULBvnFLpc1KY+d+irZSgZ02TGse5FsafKS5jg2e4pbvK6TPXaF/A6+CA==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"linux"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/netbsd-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.4.tgz",
			"integrity": "sha512-vUnkBYxZW4hL/ie91hSqaSNjulOnYXE1VSLusnvHg2u3jewJBz3YzB9+oCw8DABeVqZGg94t9tyZFoHma8gWZQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/netbsd-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.4.tgz",
			"integrity": "sha512-XAg8pIQn5CzhOB8odIcAm42QsOfa98SBeKUdo4xa8OvX8LbMZqEtgeWE9P/Wxt7MlG2QqvjGths+nq48TrUiKw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"netbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/openbsd-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.4.tgz",
			"integrity": "sha512-Ct2WcFEANlFDtp1nVAXSNBPDxyU+j7+tId//iHXU2f/lN5AmO4zLyhDcpR5Cz1r08mVxzt3Jpyt4PmXQ1O6+7A==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/openbsd-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.4.tgz",
			"integrity": "sha512-xAGGhyOQ9Otm1Xu8NT1ifGLnA6M3sJxZ6ixylb+vIUVzvvd6GOALpwQrYrtlPouMqd/vSbgehz6HaVk4+7Afhw==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"openbsd"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/sunos-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.4.tgz",
			"integrity": "sha512-Mw+tzy4pp6wZEK0+Lwr76pWLjrtjmJyUB23tHKqEDP74R3q95luY/bXqXZeYl4NYlvwOqoRKlInQialgCKy67Q==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"sunos"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/win32-arm64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.4.tgz",
			"integrity": "sha512-AVUP428VQTSddguz9dO9ngb+E5aScyg7nOeJDrF1HPYu555gmza3bDGMPhmVXL8svDSoqPCsCPjb265yG/kLKQ==",
			"cpu": [
				"arm64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/win32-ia32": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.4.tgz",
			"integrity": "sha512-i1sW+1i+oWvQzSgfRcxxG2k4I9n3O9NRqy8U+uugaT2Dy7kLO9Y7wI72haOahxceMX8hZAzgGou1FhndRldxRg==",
			"cpu": [
				"ia32"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/@esbuild/win32-x64": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.4.tgz",
			"integrity": "sha512-nOT2vZNw6hJ+z43oP1SPea/G/6AbN6X+bGNhNuq8NtRHy4wsMhw765IKLNmnjek7GvjWBYQ8Q5VBoYTFg9y1UQ==",
			"cpu": [
				"x64"
			],
			"dev": true,
			"license": "MIT",
			"optional": true,
			"os": [
				"win32"
			],
			"engines": {
				"node": ">=18"
			}
		},
		"node_modules/wrangler/node_modules/esbuild": {
			"version": "0.25.4",
			"resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.4.tgz",
			"integrity": "sha512-8pgjLUcUjcgDg+2Q4NYXnPbo/vncAY4UmyaCm0jZevERqCHZIaWwdJHkf8XQtu4AxSKCdvrUbT0XUr1IdZzI8Q==",
			"dev": true,
			"hasInstallScript": true,
			"license": "MIT",
			"bin": {
				"esbuild": "bin/esbuild"
			},
			"engines": {
				"node": ">=18"
			},
			"optionalDependencies": {
				"@esbuild/aix-ppc64": "0.25.4",
				"@esbuild/android-arm": "0.25.4",
				"@esbuild/android-arm64": "0.25.4",
				"@esbuild/android-x64": "0.25.4",
				"@esbuild/darwin-arm64": "0.25.4",
				"@esbuild/darwin-x64": "0.25.4",
				"@esbuild/freebsd-arm64": "0.25.4",
				"@esbuild/freebsd-x64": "0.25.4",
				"@esbuild/linux-arm": "0.25.4",
				"@esbuild/linux-arm64": "0.25.4",
				"@esbuild/linux-ia32": "0.25.4",
				"@esbuild/linux-loong64": "0.25.4",
				"@esbuild/linux-mips64el": "0.25.4",
				"@esbuild/linux-ppc64": "0.25.4",
				"@esbuild/linux-riscv64": "0.25.4",
				"@esbuild/linux-s390x": "0.25.4",
				"@esbuild/linux-x64": "0.25.4",
				"@esbuild/netbsd-arm64": "0.25.4",
				"@esbuild/netbsd-x64": "0.25.4",
				"@esbuild/openbsd-arm64": "0.25.4",
				"@esbuild/openbsd-x64": "0.25.4",
				"@esbuild/sunos-x64": "0.25.4",
				"@esbuild/win32-arm64": "0.25.4",
				"@esbuild/win32-ia32": "0.25.4",
				"@esbuild/win32-x64": "0.25.4"
			}
		},
		"node_modules/wrangler/node_modules/path-to-regexp": {
			"version": "6.3.0",
			"resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-6.3.0.tgz",
			"integrity": "sha512-Yhpw4T9C6hPpgPeA28us07OJeqZ5EzQTkbfwuhsUg0c237RomFoETJgmp2sa3F/41gfLE6G5cqcYwznmeEeOlQ==",
			"dev": true,
			"license": "MIT"
		},
		"node_modules/wrappy": {
			"version": "1.0.2",
			"resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
			"integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
			"license": "ISC"
		},
		"node_modules/ws": {
			"version": "8.18.0",
			"resolved": "https://registry.npmjs.org/ws/-/ws-8.18.0.tgz",
			"integrity": "sha512-8VbfWfHLbbwu3+N6OKsOMpBdT4kXPDDB9cJk2bJ6mh9ucxdlnNvH1e+roYkKmN9Nxw2yjz7VzeO9oOz2zJ04Pw==",
			"dev": true,
			"license": "MIT",
			"engines": {
				"node": ">=10.0.0"
			},
			"peerDependencies": {
				"bufferutil": "^4.0.1",
				"utf-8-validate": ">=5.0.2"
			},
			"peerDependenciesMeta": {
				"bufferutil": {
					"optional": true
				},
				"utf-8-validate": {
					"optional": true
				}
			}
		},
		"node_modules/xmlcreate": {
			"version": "2.0.4",
			"resolved": "https://registry.npmjs.org/xmlcreate/-/xmlcreate-2.0.4.tgz",
			"integrity": "sha512-nquOebG4sngPmGPICTS5EnxqhKbCmz5Ox5hsszI2T6U5qdrJizBc+0ilYSEjTSzU0yZcmvppztXe/5Al5fUwdg==",
			"dev": true,
			"license": "Apache-2.0"
		},
		"node_modules/youch": {
			"version": "3.3.4",
			"resolved": "https://registry.npmjs.org/youch/-/youch-3.3.4.tgz",
			"integrity": "sha512-UeVBXie8cA35DS6+nBkls68xaBBXCye0CNznrhszZjTbRVnJKQuNsyLKBTTL4ln1o1rh2PKtv35twV7irj5SEg==",
			"dev": true,
			"license": "MIT",
			"dependencies": {
				"cookie": "^0.7.1",
				"mustache": "^4.2.0",
				"stacktracey": "^2.1.8"
			}
		},
		"node_modules/zod": {
			"version": "3.25.67",
			"resolved": "https://registry.npmjs.org/zod/-/zod-3.25.67.tgz",
			"integrity": "sha512-idA2YXwpCdqUSKRCACDE6ItZD9TZzy3OZMtpfLoh6oPR47lipysRrJfjzMqFxQ3uJuUPyUeWe1r9vLH33xO/Qw==",
			"license": "MIT",
			"funding": {
				"url": "https://github.com/sponsors/colinhacks"
			}
		},
		"node_modules/zod-to-json-schema": {
			"version": "3.24.5",
			"resolved": "https://registry.npmjs.org/zod-to-json-schema/-/zod-to-json-schema-3.24.5.tgz",
			"integrity": "sha512-/AuWwMP+YqiPbsJx5D6TfgRTc4kTLjsh5SOcd4bLsfUg2RcEXrFMJl1DGgdHy2aCfsIA/cr/1JM0xcB2GZji8g==",
			"license": "ISC",
			"peerDependencies": {
				"zod": "^3.24.1"
			}
		}
	}
}



================================================
FILE: demos/remote-mcp-server/package.json
================================================
{
	"name": "remote-mcp-server",
	"version": "0.0.0",
	"private": true,
	"scripts": {
		"deploy": "wrangler deploy",
		"dev": "wrangler dev",
		"format": "biome format --write",
		"lint:fix": "biome lint --fix",
		"start": "wrangler dev",
		"cf-typegen": "wrangler types",
		"type-check": "tsc --noEmit"
	},
	"dependencies": {
		"@cloudflare/workers-oauth-provider": "^0.0.5",
		"@modelcontextprotocol/sdk": "^1.12.3",
		"agents": "^0.0.95",
		"hono": "^4.8.0",
		"zod": "^3.25.67"
	},
	"devDependencies": {
		"marked": "^15.0.12",
		"typescript": "^5.8.3",
		"workers-mcp": "^0.0.13",
		"wrangler": "^4.20.1"
	}
}



================================================
FILE: demos/remote-mcp-server/tsconfig.json
================================================
{
	"compilerOptions": {
		"target": "es2021",
		"lib": ["es2021"],
		"jsx": "react-jsx",
		"module": "es2022",
		"moduleResolution": "Bundler",
		"resolveJsonModule": true,
		"allowJs": true,
		"checkJs": false,
		"noEmit": true,
		"isolatedModules": true,
		"allowSyntheticDefaultImports": true,
		"forceConsistentCasingInFileNames": true,
		"strict": true,
		"skipLibCheck": true
	},
	"include": ["worker-configuration.d.ts", "src/**/*.ts"]
}



================================================
FILE: demos/remote-mcp-server/worker-configuration.d.ts
================================================
// Generated by Wrangler by running `wrangler types` (hash: 9c6c6f60ec3f74c7ee99dddce04c3506)
// Runtime types generated with workerd@1.20250317.0 2025-03-10 
declare namespace Cloudflare {
	interface Env {
		OAUTH_KV: KVNamespace;
		MCP_OBJECT: DurableObjectNamespace<import("./src/index").MyMCP>;
		ASSETS: Fetcher;
	}
}
interface Env extends Cloudflare.Env {}

// Begin runtime types
/*! *****************************************************************************
Copyright (c) Cloudflare. All rights reserved.
Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* eslint-disable */
// noinspection JSUnusedGlobalSymbols
declare var onmessage: never;
/**
 * An abnormal event (called an exception) which occurs as a result of calling a method or accessing a property of a web API.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException)
 */
declare class DOMException extends Error {
    constructor(message?: string, name?: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/message) */
    readonly message: string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/name) */
    readonly name: string;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMException/code)
     */
    readonly code: number;
    static readonly INDEX_SIZE_ERR: number;
    static readonly DOMSTRING_SIZE_ERR: number;
    static readonly HIERARCHY_REQUEST_ERR: number;
    static readonly WRONG_DOCUMENT_ERR: number;
    static readonly INVALID_CHARACTER_ERR: number;
    static readonly NO_DATA_ALLOWED_ERR: number;
    static readonly NO_MODIFICATION_ALLOWED_ERR: number;
    static readonly NOT_FOUND_ERR: number;
    static readonly NOT_SUPPORTED_ERR: number;
    static readonly INUSE_ATTRIBUTE_ERR: number;
    static readonly INVALID_STATE_ERR: number;
    static readonly SYNTAX_ERR: number;
    static readonly INVALID_MODIFICATION_ERR: number;
    static readonly NAMESPACE_ERR: number;
    static readonly INVALID_ACCESS_ERR: number;
    static readonly VALIDATION_ERR: number;
    static readonly TYPE_MISMATCH_ERR: number;
    static readonly SECURITY_ERR: number;
    static readonly NETWORK_ERR: number;
    static readonly ABORT_ERR: number;
    static readonly URL_MISMATCH_ERR: number;
    static readonly QUOTA_EXCEEDED_ERR: number;
    static readonly TIMEOUT_ERR: number;
    static readonly INVALID_NODE_TYPE_ERR: number;
    static readonly DATA_CLONE_ERR: number;
    get stack(): any;
    set stack(value: any);
}
type WorkerGlobalScopeEventMap = {
    fetch: FetchEvent;
    scheduled: ScheduledEvent;
    queue: QueueEvent;
    unhandledrejection: PromiseRejectionEvent;
    rejectionhandled: PromiseRejectionEvent;
};
declare abstract class WorkerGlobalScope extends EventTarget<WorkerGlobalScopeEventMap> {
    EventTarget: typeof EventTarget;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console) */
interface Console {
    "assert"(condition?: boolean, ...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/clear_static) */
    clear(): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/count_static) */
    count(label?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/countreset_static) */
    countReset(label?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug_static) */
    debug(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dir_static) */
    dir(item?: any, options?: any): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dirxml_static) */
    dirxml(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error_static) */
    error(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/group_static) */
    group(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupcollapsed_static) */
    groupCollapsed(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupend_static) */
    groupEnd(): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info_static) */
    info(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log_static) */
    log(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/table_static) */
    table(tabularData?: any, properties?: string[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time_static) */
    time(label?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeend_static) */
    timeEnd(label?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timelog_static) */
    timeLog(label?: string, ...data: any[]): void;
    timeStamp(label?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace_static) */
    trace(...data: any[]): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn_static) */
    warn(...data: any[]): void;
}
declare const console: Console;
type BufferSource = ArrayBufferView | ArrayBuffer;
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
declare namespace WebAssembly {
    class CompileError extends Error {
        constructor(message?: string);
    }
    class RuntimeError extends Error {
        constructor(message?: string);
    }
    type ValueType = "anyfunc" | "externref" | "f32" | "f64" | "i32" | "i64" | "v128";
    interface GlobalDescriptor {
        value: ValueType;
        mutable?: boolean;
    }
    class Global {
        constructor(descriptor: GlobalDescriptor, value?: any);
        value: any;
        valueOf(): any;
    }
    type ImportValue = ExportValue | number;
    type ModuleImports = Record<string, ImportValue>;
    type Imports = Record<string, ModuleImports>;
    type ExportValue = Function | Global | Memory | Table;
    type Exports = Record<string, ExportValue>;
    class Instance {
        constructor(module: Module, imports?: Imports);
        readonly exports: Exports;
    }
    interface MemoryDescriptor {
        initial: number;
        maximum?: number;
        shared?: boolean;
    }
    class Memory {
        constructor(descriptor: MemoryDescriptor);
        readonly buffer: ArrayBuffer;
        grow(delta: number): number;
    }
    type ImportExportKind = "function" | "global" | "memory" | "table";
    interface ModuleExportDescriptor {
        kind: ImportExportKind;
        name: string;
    }
    interface ModuleImportDescriptor {
        kind: ImportExportKind;
        module: string;
        name: string;
    }
    abstract class Module {
        static customSections(module: Module, sectionName: string): ArrayBuffer[];
        static exports(module: Module): ModuleExportDescriptor[];
        static imports(module: Module): ModuleImportDescriptor[];
    }
    type TableKind = "anyfunc" | "externref";
    interface TableDescriptor {
        element: TableKind;
        initial: number;
        maximum?: number;
    }
    class Table {
        constructor(descriptor: TableDescriptor, value?: any);
        readonly length: number;
        get(index: number): any;
        grow(delta: number, value?: any): number;
        set(index: number, value?: any): void;
    }
    function instantiate(module: Module, imports?: Imports): Promise<Instance>;
    function validate(bytes: BufferSource): boolean;
}
/**
 * This ServiceWorker API interface represents the global execution context of a service worker.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ServiceWorkerGlobalScope)
 */
interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
    DOMException: typeof DOMException;
    WorkerGlobalScope: typeof WorkerGlobalScope;
    btoa(data: string): string;
    atob(data: string): string;
    setTimeout(callback: (...args: any[]) => void, msDelay?: number): number;
    setTimeout<Args extends any[]>(callback: (...args: Args) => void, msDelay?: number, ...args: Args): number;
    clearTimeout(timeoutId: number | null): void;
    setInterval(callback: (...args: any[]) => void, msDelay?: number): number;
    setInterval<Args extends any[]>(callback: (...args: Args) => void, msDelay?: number, ...args: Args): number;
    clearInterval(timeoutId: number | null): void;
    queueMicrotask(task: Function): void;
    structuredClone<T>(value: T, options?: StructuredSerializeOptions): T;
    reportError(error: any): void;
    fetch(input: RequestInfo | URL, init?: RequestInit<RequestInitCfProperties>): Promise<Response>;
    self: ServiceWorkerGlobalScope;
    crypto: Crypto;
    caches: CacheStorage;
    scheduler: Scheduler;
    performance: Performance;
    Cloudflare: Cloudflare;
    readonly origin: string;
    Event: typeof Event;
    ExtendableEvent: typeof ExtendableEvent;
    CustomEvent: typeof CustomEvent;
    PromiseRejectionEvent: typeof PromiseRejectionEvent;
    FetchEvent: typeof FetchEvent;
    TailEvent: typeof TailEvent;
    TraceEvent: typeof TailEvent;
    ScheduledEvent: typeof ScheduledEvent;
    MessageEvent: typeof MessageEvent;
    CloseEvent: typeof CloseEvent;
    ReadableStreamDefaultReader: typeof ReadableStreamDefaultReader;
    ReadableStreamBYOBReader: typeof ReadableStreamBYOBReader;
    ReadableStream: typeof ReadableStream;
    WritableStream: typeof WritableStream;
    WritableStreamDefaultWriter: typeof WritableStreamDefaultWriter;
    TransformStream: typeof TransformStream;
    ByteLengthQueuingStrategy: typeof ByteLengthQueuingStrategy;
    CountQueuingStrategy: typeof CountQueuingStrategy;
    ErrorEvent: typeof ErrorEvent;
    EventSource: typeof EventSource;
    ReadableStreamBYOBRequest: typeof ReadableStreamBYOBRequest;
    ReadableStreamDefaultController: typeof ReadableStreamDefaultController;
    ReadableByteStreamController: typeof ReadableByteStreamController;
    WritableStreamDefaultController: typeof WritableStreamDefaultController;
    TransformStreamDefaultController: typeof TransformStreamDefaultController;
    CompressionStream: typeof CompressionStream;
    DecompressionStream: typeof DecompressionStream;
    TextEncoderStream: typeof TextEncoderStream;
    TextDecoderStream: typeof TextDecoderStream;
    Headers: typeof Headers;
    Body: typeof Body;
    Request: typeof Request;
    Response: typeof Response;
    WebSocket: typeof WebSocket;
    WebSocketPair: typeof WebSocketPair;
    WebSocketRequestResponsePair: typeof WebSocketRequestResponsePair;
    AbortController: typeof AbortController;
    AbortSignal: typeof AbortSignal;
    TextDecoder: typeof TextDecoder;
    TextEncoder: typeof TextEncoder;
    navigator: Navigator;
    Navigator: typeof Navigator;
    URL: typeof URL;
    URLSearchParams: typeof URLSearchParams;
    URLPattern: typeof URLPattern;
    Blob: typeof Blob;
    File: typeof File;
    FormData: typeof FormData;
    Crypto: typeof Crypto;
    SubtleCrypto: typeof SubtleCrypto;
    CryptoKey: typeof CryptoKey;
    CacheStorage: typeof CacheStorage;
    Cache: typeof Cache;
    FixedLengthStream: typeof FixedLengthStream;
    IdentityTransformStream: typeof IdentityTransformStream;
    HTMLRewriter: typeof HTMLRewriter;
    GPUAdapter: typeof GPUAdapter;
    GPUOutOfMemoryError: typeof GPUOutOfMemoryError;
    GPUValidationError: typeof GPUValidationError;
    GPUInternalError: typeof GPUInternalError;
    GPUDeviceLostInfo: typeof GPUDeviceLostInfo;
    GPUBufferUsage: typeof GPUBufferUsage;
    GPUShaderStage: typeof GPUShaderStage;
    GPUMapMode: typeof GPUMapMode;
    GPUTextureUsage: typeof GPUTextureUsage;
    GPUColorWrite: typeof GPUColorWrite;
}
declare function addEventListener<Type extends keyof WorkerGlobalScopeEventMap>(type: Type, handler: EventListenerOrEventListenerObject<WorkerGlobalScopeEventMap[Type]>, options?: EventTargetAddEventListenerOptions | boolean): void;
declare function removeEventListener<Type extends keyof WorkerGlobalScopeEventMap>(type: Type, handler: EventListenerOrEventListenerObject<WorkerGlobalScopeEventMap[Type]>, options?: EventTargetEventListenerOptions | boolean): void;
/**
 * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)
 */
declare function dispatchEvent(event: WorkerGlobalScopeEventMap[keyof WorkerGlobalScopeEventMap]): boolean;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/btoa) */
declare function btoa(data: string): string;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/atob) */
declare function atob(data: string): string;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/setTimeout) */
declare function setTimeout(callback: (...args: any[]) => void, msDelay?: number): number;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/setTimeout) */
declare function setTimeout<Args extends any[]>(callback: (...args: Args) => void, msDelay?: number, ...args: Args): number;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/clearTimeout) */
declare function clearTimeout(timeoutId: number | null): void;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/setInterval) */
declare function setInterval(callback: (...args: any[]) => void, msDelay?: number): number;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/setInterval) */
declare function setInterval<Args extends any[]>(callback: (...args: Args) => void, msDelay?: number, ...args: Args): number;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/clearInterval) */
declare function clearInterval(timeoutId: number | null): void;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/queueMicrotask) */
declare function queueMicrotask(task: Function): void;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/structuredClone) */
declare function structuredClone<T>(value: T, options?: StructuredSerializeOptions): T;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/reportError) */
declare function reportError(error: any): void;
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/fetch) */
declare function fetch(input: RequestInfo | URL, init?: RequestInit<RequestInitCfProperties>): Promise<Response>;
declare const self: ServiceWorkerGlobalScope;
/**
* The Web Crypto API provides a set of low-level functions for common cryptographic tasks.
* The Workers runtime implements the full surface of this API, but with some differences in
* the [supported algorithms](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#supported-algorithms)
* compared to those implemented in most browsers.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
*/
declare const crypto: Crypto;
/**
* The Cache API allows fine grained control of reading and writing from the Cloudflare global network cache.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/)
*/
declare const caches: CacheStorage;
declare const scheduler: Scheduler;
/**
* The Workers runtime supports a subset of the Performance API, used to measure timing and performance,
* as well as timing of subrequests and other operations.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/performance/)
*/
declare const performance: Performance;
declare const Cloudflare: Cloudflare;
declare const origin: string;
declare const navigator: Navigator;
interface TestController {
}
interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
    props: any;
}
type ExportedHandlerFetchHandler<Env = unknown, CfHostMetadata = unknown> = (request: Request<CfHostMetadata, IncomingRequestCfProperties<CfHostMetadata>>, env: Env, ctx: ExecutionContext) => Response | Promise<Response>;
type ExportedHandlerTailHandler<Env = unknown> = (events: TraceItem[], env: Env, ctx: ExecutionContext) => void | Promise<void>;
type ExportedHandlerTraceHandler<Env = unknown> = (traces: TraceItem[], env: Env, ctx: ExecutionContext) => void | Promise<void>;
type ExportedHandlerTailStreamHandler<Env = unknown> = (event: TailStream.TailEvent, env: Env, ctx: ExecutionContext) => TailStream.TailEventHandlerType | Promise<TailStream.TailEventHandlerType>;
type ExportedHandlerScheduledHandler<Env = unknown> = (controller: ScheduledController, env: Env, ctx: ExecutionContext) => void | Promise<void>;
type ExportedHandlerQueueHandler<Env = unknown, Message = unknown> = (batch: MessageBatch<Message>, env: Env, ctx: ExecutionContext) => void | Promise<void>;
type ExportedHandlerTestHandler<Env = unknown> = (controller: TestController, env: Env, ctx: ExecutionContext) => void | Promise<void>;
interface ExportedHandler<Env = unknown, QueueHandlerMessage = unknown, CfHostMetadata = unknown> {
    fetch?: ExportedHandlerFetchHandler<Env, CfHostMetadata>;
    tail?: ExportedHandlerTailHandler<Env>;
    trace?: ExportedHandlerTraceHandler<Env>;
    tailStream?: ExportedHandlerTailStreamHandler<Env>;
    scheduled?: ExportedHandlerScheduledHandler<Env>;
    test?: ExportedHandlerTestHandler<Env>;
    email?: EmailExportedHandler<Env>;
    queue?: ExportedHandlerQueueHandler<Env, QueueHandlerMessage>;
}
interface StructuredSerializeOptions {
    transfer?: any[];
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/PromiseRejectionEvent) */
declare abstract class PromiseRejectionEvent extends Event {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/PromiseRejectionEvent/promise) */
    readonly promise: Promise<any>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/PromiseRejectionEvent/reason) */
    readonly reason: any;
}
declare abstract class Navigator {
    sendBeacon(url: string, body?: (ReadableStream | string | (ArrayBuffer | ArrayBufferView) | Blob | FormData | URLSearchParams | URLSearchParams)): boolean;
    readonly userAgent: string;
    readonly gpu?: GPU;
}
/**
* The Workers runtime supports a subset of the Performance API, used to measure timing and performance,
* as well as timing of subrequests and other operations.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/performance/)
*/
interface Performance {
    /* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/performance/#performancetimeorigin) */
    readonly timeOrigin: number;
    /* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/performance/#performancenow) */
    now(): number;
}
interface AlarmInvocationInfo {
    readonly isRetry: boolean;
    readonly retryCount: number;
}
interface Cloudflare {
    readonly compatibilityFlags: Record<string, boolean>;
}
interface DurableObject {
    fetch(request: Request): Response | Promise<Response>;
    alarm?(alarmInfo?: AlarmInvocationInfo): void | Promise<void>;
    webSocketMessage?(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void>;
    webSocketClose?(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void>;
    webSocketError?(ws: WebSocket, error: unknown): void | Promise<void>;
}
type DurableObjectStub<T extends Rpc.DurableObjectBranded | undefined = undefined> = Fetcher<T, "alarm" | "webSocketMessage" | "webSocketClose" | "webSocketError"> & {
    readonly id: DurableObjectId;
    readonly name?: string;
};
interface DurableObjectId {
    toString(): string;
    equals(other: DurableObjectId): boolean;
    readonly name?: string;
}
interface DurableObjectNamespace<T extends Rpc.DurableObjectBranded | undefined = undefined> {
    newUniqueId(options?: DurableObjectNamespaceNewUniqueIdOptions): DurableObjectId;
    idFromName(name: string): DurableObjectId;
    idFromString(id: string): DurableObjectId;
    get(id: DurableObjectId, options?: DurableObjectNamespaceGetDurableObjectOptions): DurableObjectStub<T>;
    jurisdiction(jurisdiction: DurableObjectJurisdiction): DurableObjectNamespace<T>;
}
type DurableObjectJurisdiction = "eu" | "fedramp";
interface DurableObjectNamespaceNewUniqueIdOptions {
    jurisdiction?: DurableObjectJurisdiction;
}
type DurableObjectLocationHint = "wnam" | "enam" | "sam" | "weur" | "eeur" | "apac" | "oc" | "afr" | "me";
interface DurableObjectNamespaceGetDurableObjectOptions {
    locationHint?: DurableObjectLocationHint;
}
interface DurableObjectState {
    waitUntil(promise: Promise<any>): void;
    readonly id: DurableObjectId;
    readonly storage: DurableObjectStorage;
    container?: Container;
    blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
    acceptWebSocket(ws: WebSocket, tags?: string[]): void;
    getWebSockets(tag?: string): WebSocket[];
    setWebSocketAutoResponse(maybeReqResp?: WebSocketRequestResponsePair): void;
    getWebSocketAutoResponse(): WebSocketRequestResponsePair | null;
    getWebSocketAutoResponseTimestamp(ws: WebSocket): Date | null;
    setHibernatableWebSocketEventTimeout(timeoutMs?: number): void;
    getHibernatableWebSocketEventTimeout(): number | null;
    getTags(ws: WebSocket): string[];
    abort(reason?: string): void;
}
interface DurableObjectTransaction {
    get<T = unknown>(key: string, options?: DurableObjectGetOptions): Promise<T | undefined>;
    get<T = unknown>(keys: string[], options?: DurableObjectGetOptions): Promise<Map<string, T>>;
    list<T = unknown>(options?: DurableObjectListOptions): Promise<Map<string, T>>;
    put<T>(key: string, value: T, options?: DurableObjectPutOptions): Promise<void>;
    put<T>(entries: Record<string, T>, options?: DurableObjectPutOptions): Promise<void>;
    delete(key: string, options?: DurableObjectPutOptions): Promise<boolean>;
    delete(keys: string[], options?: DurableObjectPutOptions): Promise<number>;
    rollback(): void;
    getAlarm(options?: DurableObjectGetAlarmOptions): Promise<number | null>;
    setAlarm(scheduledTime: number | Date, options?: DurableObjectSetAlarmOptions): Promise<void>;
    deleteAlarm(options?: DurableObjectSetAlarmOptions): Promise<void>;
}
interface DurableObjectStorage {
    get<T = unknown>(key: string, options?: DurableObjectGetOptions): Promise<T | undefined>;
    get<T = unknown>(keys: string[], options?: DurableObjectGetOptions): Promise<Map<string, T>>;
    list<T = unknown>(options?: DurableObjectListOptions): Promise<Map<string, T>>;
    put<T>(key: string, value: T, options?: DurableObjectPutOptions): Promise<void>;
    put<T>(entries: Record<string, T>, options?: DurableObjectPutOptions): Promise<void>;
    delete(key: string, options?: DurableObjectPutOptions): Promise<boolean>;
    delete(keys: string[], options?: DurableObjectPutOptions): Promise<number>;
    deleteAll(options?: DurableObjectPutOptions): Promise<void>;
    transaction<T>(closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T>;
    getAlarm(options?: DurableObjectGetAlarmOptions): Promise<number | null>;
    setAlarm(scheduledTime: number | Date, options?: DurableObjectSetAlarmOptions): Promise<void>;
    deleteAlarm(options?: DurableObjectSetAlarmOptions): Promise<void>;
    sync(): Promise<void>;
    sql: SqlStorage;
    transactionSync<T>(closure: () => T): T;
    getCurrentBookmark(): Promise<string>;
    getBookmarkForTime(timestamp: number | Date): Promise<string>;
    onNextSessionRestoreBookmark(bookmark: string): Promise<string>;
}
interface DurableObjectListOptions {
    start?: string;
    startAfter?: string;
    end?: string;
    prefix?: string;
    reverse?: boolean;
    limit?: number;
    allowConcurrency?: boolean;
    noCache?: boolean;
}
interface DurableObjectGetOptions {
    allowConcurrency?: boolean;
    noCache?: boolean;
}
interface DurableObjectGetAlarmOptions {
    allowConcurrency?: boolean;
}
interface DurableObjectPutOptions {
    allowConcurrency?: boolean;
    allowUnconfirmed?: boolean;
    noCache?: boolean;
}
interface DurableObjectSetAlarmOptions {
    allowConcurrency?: boolean;
    allowUnconfirmed?: boolean;
}
declare class WebSocketRequestResponsePair {
    constructor(request: string, response: string);
    get request(): string;
    get response(): string;
}
interface AnalyticsEngineDataset {
    writeDataPoint(event?: AnalyticsEngineDataPoint): void;
}
interface AnalyticsEngineDataPoint {
    indexes?: ((ArrayBuffer | string) | null)[];
    doubles?: number[];
    blobs?: ((ArrayBuffer | string) | null)[];
}
/**
 * An event which takes place in the DOM.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event)
 */
declare class Event {
    constructor(type: string, init?: EventInit);
    /**
     * Returns the type of event, e.g. "click", "hashchange", or "submit".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/type)
     */
    get type(): string;
    /**
     * Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/eventPhase)
     */
    get eventPhase(): number;
    /**
     * Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/composed)
     */
    get composed(): boolean;
    /**
     * Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/bubbles)
     */
    get bubbles(): boolean;
    /**
     * Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/cancelable)
     */
    get cancelable(): boolean;
    /**
     * Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/defaultPrevented)
     */
    get defaultPrevented(): boolean;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/returnValue)
     */
    get returnValue(): boolean;
    /**
     * Returns the object whose event listener's callback is currently being invoked.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/currentTarget)
     */
    get currentTarget(): EventTarget | undefined;
    /**
     * Returns the object to which event is dispatched (its target).
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/target)
     */
    get target(): EventTarget | undefined;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/srcElement)
     */
    get srcElement(): EventTarget | undefined;
    /**
     * Returns the event's timestamp as the number of milliseconds measured relative to the time origin.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/timeStamp)
     */
    get timeStamp(): number;
    /**
     * Returns true if event was dispatched by the user agent, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/isTrusted)
     */
    get isTrusted(): boolean;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/cancelBubble)
     */
    get cancelBubble(): boolean;
    /**
     * @deprecated
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/cancelBubble)
     */
    set cancelBubble(value: boolean);
    /**
     * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/stopImmediatePropagation)
     */
    stopImmediatePropagation(): void;
    /**
     * If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/preventDefault)
     */
    preventDefault(): void;
    /**
     * When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/stopPropagation)
     */
    stopPropagation(): void;
    /**
     * Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Event/composedPath)
     */
    composedPath(): EventTarget[];
    static readonly NONE: number;
    static readonly CAPTURING_PHASE: number;
    static readonly AT_TARGET: number;
    static readonly BUBBLING_PHASE: number;
}
interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
}
type EventListener<EventType extends Event = Event> = (event: EventType) => void;
interface EventListenerObject<EventType extends Event = Event> {
    handleEvent(event: EventType): void;
}
type EventListenerOrEventListenerObject<EventType extends Event = Event> = EventListener<EventType> | EventListenerObject<EventType>;
/**
 * EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget)
 */
declare class EventTarget<EventMap extends Record<string, Event> = Record<string, Event>> {
    constructor();
    /**
     * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
     *
     * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
     *
     * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
     *
     * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
     *
     * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
     *
     * If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.
     *
     * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener)
     */
    addEventListener<Type extends keyof EventMap>(type: Type, handler: EventListenerOrEventListenerObject<EventMap[Type]>, options?: EventTargetAddEventListenerOptions | boolean): void;
    /**
     * Removes the event listener in target's event listener list with the same type, callback, and options.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/removeEventListener)
     */
    removeEventListener<Type extends keyof EventMap>(type: Type, handler: EventListenerOrEventListenerObject<EventMap[Type]>, options?: EventTargetEventListenerOptions | boolean): void;
    /**
     * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget/dispatchEvent)
     */
    dispatchEvent(event: EventMap[keyof EventMap]): boolean;
}
interface EventTargetEventListenerOptions {
    capture?: boolean;
}
interface EventTargetAddEventListenerOptions {
    capture?: boolean;
    passive?: boolean;
    once?: boolean;
    signal?: AbortSignal;
}
interface EventTargetHandlerObject {
    handleEvent: (event: Event) => any | undefined;
}
/**
 * A controller object that allows you to abort one or more DOM requests as and when desired.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController)
 */
declare class AbortController {
    constructor();
    /**
     * Returns the AbortSignal object associated with this object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController/signal)
     */
    get signal(): AbortSignal;
    /**
     * Invoking this method will set this object's AbortSignal's aborted flag and signal to any observers that the associated activity is to be aborted.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortController/abort)
     */
    abort(reason?: any): void;
}
/**
 * A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal)
 */
declare abstract class AbortSignal extends EventTarget {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_static) */
    static abort(reason?: any): AbortSignal;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/timeout_static) */
    static timeout(delay: number): AbortSignal;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/any_static) */
    static any(signals: AbortSignal[]): AbortSignal;
    /**
     * Returns true if this AbortSignal's AbortController has signaled to abort, and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/aborted)
     */
    get aborted(): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/reason) */
    get reason(): any;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_event) */
    get onabort(): any | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_event) */
    set onabort(value: any | null);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/throwIfAborted) */
    throwIfAborted(): void;
}
interface Scheduler {
    wait(delay: number, maybeOptions?: SchedulerWaitOptions): Promise<void>;
}
interface SchedulerWaitOptions {
    signal?: AbortSignal;
}
/**
 * Extends the lifetime of the install and activate events dispatched on the global scope as part of the service worker lifecycle. This ensures that any functional events (like FetchEvent) are not dispatched until it upgrades database schemas and deletes the outdated cache entries.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ExtendableEvent)
 */
declare abstract class ExtendableEvent extends Event {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ExtendableEvent/waitUntil) */
    waitUntil(promise: Promise<any>): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent) */
declare class CustomEvent<T = any> extends Event {
    constructor(type: string, init?: CustomEventCustomEventInit);
    /**
     * Returns any custom data event was created with. Typically used for synthetic events.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CustomEvent/detail)
     */
    get detail(): T;
}
interface CustomEventCustomEventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
    detail?: any;
}
/**
 * A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob)
 */
declare class Blob {
    constructor(type?: ((ArrayBuffer | ArrayBufferView) | string | Blob)[], options?: BlobOptions);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/size) */
    get size(): number;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/type) */
    get type(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/slice) */
    slice(start?: number, end?: number, type?: string): Blob;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/arrayBuffer) */
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/text) */
    text(): Promise<string>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Blob/stream) */
    stream(): ReadableStream;
}
interface BlobOptions {
    type?: string;
}
/**
 * Provides information about files and allows JavaScript in a web page to access their content.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/File)
 */
declare class File extends Blob {
    constructor(bits: ((ArrayBuffer | ArrayBufferView) | string | Blob)[] | undefined, name: string, options?: FileOptions);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/name) */
    get name(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/lastModified) */
    get lastModified(): number;
}
interface FileOptions {
    type?: string;
    lastModified?: number;
}
/**
* The Cache API allows fine grained control of reading and writing from the Cloudflare global network cache.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/)
*/
declare abstract class CacheStorage {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CacheStorage/open) */
    open(cacheName: string): Promise<Cache>;
    readonly default: Cache;
}
/**
* The Cache API allows fine grained control of reading and writing from the Cloudflare global network cache.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/)
*/
declare abstract class Cache {
    /* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/#delete) */
    delete(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<boolean>;
    /* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/#match) */
    match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined>;
    /* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/cache/#put) */
    put(request: RequestInfo | URL, response: Response): Promise<void>;
}
interface CacheQueryOptions {
    ignoreMethod?: boolean;
}
/**
* The Web Crypto API provides a set of low-level functions for common cryptographic tasks.
* The Workers runtime implements the full surface of this API, but with some differences in
* the [supported algorithms](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/#supported-algorithms)
* compared to those implemented in most browsers.
*
* [Cloudflare Docs Reference](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
*/
declare abstract class Crypto {
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/subtle)
     */
    get subtle(): SubtleCrypto;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/getRandomValues) */
    getRandomValues<T extends Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | BigInt64Array | BigUint64Array>(buffer: T): T;
    /**
     * Available only in secure contexts.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Crypto/randomUUID)
     */
    randomUUID(): string;
    DigestStream: typeof DigestStream;
}
/**
 * This Web Crypto API interface provides a number of low-level cryptographic functions. It is accessed via the Crypto.subtle properties available in a window context (via Window.crypto).
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto)
 */
declare abstract class SubtleCrypto {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/encrypt) */
    encrypt(algorithm: string | SubtleCryptoEncryptAlgorithm, key: CryptoKey, plainText: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/decrypt) */
    decrypt(algorithm: string | SubtleCryptoEncryptAlgorithm, key: CryptoKey, cipherText: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/sign) */
    sign(algorithm: string | SubtleCryptoSignAlgorithm, key: CryptoKey, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/verify) */
    verify(algorithm: string | SubtleCryptoSignAlgorithm, key: CryptoKey, signature: ArrayBuffer | ArrayBufferView, data: ArrayBuffer | ArrayBufferView): Promise<boolean>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/digest) */
    digest(algorithm: string | SubtleCryptoHashAlgorithm, data: ArrayBuffer | ArrayBufferView): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/generateKey) */
    generateKey(algorithm: string | SubtleCryptoGenerateKeyAlgorithm, extractable: boolean, keyUsages: string[]): Promise<CryptoKey | CryptoKeyPair>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/deriveKey) */
    deriveKey(algorithm: string | SubtleCryptoDeriveKeyAlgorithm, baseKey: CryptoKey, derivedKeyAlgorithm: string | SubtleCryptoImportKeyAlgorithm, extractable: boolean, keyUsages: string[]): Promise<CryptoKey>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/deriveBits) */
    deriveBits(algorithm: string | SubtleCryptoDeriveKeyAlgorithm, baseKey: CryptoKey, length?: number | null): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/importKey) */
    importKey(format: string, keyData: (ArrayBuffer | ArrayBufferView) | JsonWebKey, algorithm: string | SubtleCryptoImportKeyAlgorithm, extractable: boolean, keyUsages: string[]): Promise<CryptoKey>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/exportKey) */
    exportKey(format: string, key: CryptoKey): Promise<ArrayBuffer | JsonWebKey>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/wrapKey) */
    wrapKey(format: string, key: CryptoKey, wrappingKey: CryptoKey, wrapAlgorithm: string | SubtleCryptoEncryptAlgorithm): Promise<ArrayBuffer>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/SubtleCrypto/unwrapKey) */
    unwrapKey(format: string, wrappedKey: ArrayBuffer | ArrayBufferView, unwrappingKey: CryptoKey, unwrapAlgorithm: string | SubtleCryptoEncryptAlgorithm, unwrappedKeyAlgorithm: string | SubtleCryptoImportKeyAlgorithm, extractable: boolean, keyUsages: string[]): Promise<CryptoKey>;
    timingSafeEqual(a: ArrayBuffer | ArrayBufferView, b: ArrayBuffer | ArrayBufferView): boolean;
}
/**
 * The CryptoKey dictionary of the Web Crypto API represents a cryptographic key.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey)
 */
declare abstract class CryptoKey {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/type) */
    readonly type: string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/extractable) */
    readonly extractable: boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/algorithm) */
    readonly algorithm: CryptoKeyKeyAlgorithm | CryptoKeyAesKeyAlgorithm | CryptoKeyHmacKeyAlgorithm | CryptoKeyRsaKeyAlgorithm | CryptoKeyEllipticKeyAlgorithm | CryptoKeyArbitraryKeyAlgorithm;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CryptoKey/usages) */
    readonly usages: string[];
}
interface CryptoKeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}
interface JsonWebKey {
    kty: string;
    use?: string;
    key_ops?: string[];
    alg?: string;
    ext?: boolean;
    crv?: string;
    x?: string;
    y?: string;
    d?: string;
    n?: string;
    e?: string;
    p?: string;
    q?: string;
    dp?: string;
    dq?: string;
    qi?: string;
    oth?: RsaOtherPrimesInfo[];
    k?: string;
}
interface RsaOtherPrimesInfo {
    r?: string;
    d?: string;
    t?: string;
}
interface SubtleCryptoDeriveKeyAlgorithm {
    name: string;
    salt?: ArrayBuffer;
    iterations?: number;
    hash?: (string | SubtleCryptoHashAlgorithm);
    $public?: CryptoKey;
    info?: ArrayBuffer;
}
interface SubtleCryptoEncryptAlgorithm {
    name: string;
    iv?: ArrayBuffer;
    additionalData?: ArrayBuffer;
    tagLength?: number;
    counter?: ArrayBuffer;
    length?: number;
    label?: ArrayBuffer;
}
interface SubtleCryptoGenerateKeyAlgorithm {
    name: string;
    hash?: (string | SubtleCryptoHashAlgorithm);
    modulusLength?: number;
    publicExponent?: ArrayBuffer;
    length?: number;
    namedCurve?: string;
}
interface SubtleCryptoHashAlgorithm {
    name: string;
}
interface SubtleCryptoImportKeyAlgorithm {
    name: string;
    hash?: (string | SubtleCryptoHashAlgorithm);
    length?: number;
    namedCurve?: string;
    compressed?: boolean;
}
interface SubtleCryptoSignAlgorithm {
    name: string;
    hash?: (string | SubtleCryptoHashAlgorithm);
    dataLength?: number;
    saltLength?: number;
}
interface CryptoKeyKeyAlgorithm {
    name: string;
}
interface CryptoKeyAesKeyAlgorithm {
    name: string;
    length: number;
}
interface CryptoKeyHmacKeyAlgorithm {
    name: string;
    hash: CryptoKeyKeyAlgorithm;
    length: number;
}
interface CryptoKeyRsaKeyAlgorithm {
    name: string;
    modulusLength: number;
    publicExponent: ArrayBuffer | (ArrayBuffer | ArrayBufferView);
    hash?: CryptoKeyKeyAlgorithm;
}
interface CryptoKeyEllipticKeyAlgorithm {
    name: string;
    namedCurve: string;
}
interface CryptoKeyArbitraryKeyAlgorithm {
    name: string;
    hash?: CryptoKeyKeyAlgorithm;
    namedCurve?: string;
    length?: number;
}
declare class DigestStream extends WritableStream<ArrayBuffer | ArrayBufferView> {
    constructor(algorithm: string | SubtleCryptoHashAlgorithm);
    get digest(): Promise<ArrayBuffer>;
    get bytesWritten(): number | bigint;
}
/**
 * A decoder for a specific method, that is a specific character encoding, like utf-8, iso-8859-2, koi8, cp1261, gbk, etc. A decoder takes a stream of bytes as input and emits a stream of code points. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextDecoder)
 */
declare class TextDecoder {
    constructor(decoder?: string, options?: TextDecoderConstructorOptions);
    /**
     * Returns the result of running encoding's decoder. The method can be invoked zero or more times with options's stream set to true, and then once without options's stream (or set to false), to process a fragmented input. If the invocation without options's stream (or set to false) has no input, it's clearest to omit both arguments.
     *
     * ```
     * var string = "", decoder = new TextDecoder(encoding), buffer;
     * while(buffer = next_chunk()) {
     *   string += decoder.decode(buffer, {stream:true});
     * }
     * string += decoder.decode(); // end-of-queue
     * ```
     *
     * If the error mode is "fatal" and encoding's decoder returns error, throws a TypeError.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextDecoder/decode)
     */
    decode(input?: (ArrayBuffer | ArrayBufferView), options?: TextDecoderDecodeOptions): string;
    get encoding(): string;
    get fatal(): boolean;
    get ignoreBOM(): boolean;
}
/**
 * TextEncoder takes a stream of code points as input and emits a stream of bytes. For a more scalable, non-native library, see StringView – a C-like representation of strings based on typed arrays.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextEncoder)
 */
declare class TextEncoder {
    constructor();
    /**
     * Returns the result of running UTF-8's encoder.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextEncoder/encode)
     */
    encode(input?: string): Uint8Array;
    /**
     * Runs the UTF-8 encoder on source, stores the result of that operation into destination, and returns the progress made as an object wherein read is the number of converted code units of source and written is the number of bytes modified in destination.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextEncoder/encodeInto)
     */
    encodeInto(input: string, buffer: ArrayBuffer | ArrayBufferView): TextEncoderEncodeIntoResult;
    get encoding(): string;
}
interface TextDecoderConstructorOptions {
    fatal: boolean;
    ignoreBOM: boolean;
}
interface TextDecoderDecodeOptions {
    stream: boolean;
}
interface TextEncoderEncodeIntoResult {
    read: number;
    written: number;
}
/**
 * Events providing information related to errors in scripts or in files.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ErrorEvent)
 */
declare class ErrorEvent extends Event {
    constructor(type: string, init?: ErrorEventErrorEventInit);
    get filename(): string;
    get message(): string;
    get lineno(): number;
    get colno(): number;
    get error(): any;
}
interface ErrorEventErrorEventInit {
    message?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: any;
}
/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData)
 */
declare class FormData {
    constructor();
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/append) */
    append(name: string, value: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/append) */
    append(name: string, value: Blob, filename?: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/delete) */
    delete(name: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/get) */
    get(name: string): (File | string) | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/getAll) */
    getAll(name: string): (File | string)[];
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/has) */
    has(name: string): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/set) */
    set(name: string, value: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData/set) */
    set(name: string, value: Blob, filename?: string): void;
    /* Returns an array of key, value pairs for every entry in the list. */
    entries(): IterableIterator<[
        key: string,
        value: File | string
    ]>;
    /* Returns a list of keys in the list. */
    keys(): IterableIterator<string>;
    /* Returns a list of values in the list. */
    values(): IterableIterator<(File | string)>;
    forEach<This = unknown>(callback: (this: This, value: File | string, key: string, parent: FormData) => void, thisArg?: This): void;
    [Symbol.iterator](): IterableIterator<[
        key: string,
        value: File | string
    ]>;
}
interface ContentOptions {
    html?: boolean;
}
declare class HTMLRewriter {
    constructor();
    on(selector: string, handlers: HTMLRewriterElementContentHandlers): HTMLRewriter;
    onDocument(handlers: HTMLRewriterDocumentContentHandlers): HTMLRewriter;
    transform(response: Response): Response;
}
interface HTMLRewriterElementContentHandlers {
    element?(element: Element): void | Promise<void>;
    comments?(comment: Comment): void | Promise<void>;
    text?(element: Text): void | Promise<void>;
}
interface HTMLRewriterDocumentContentHandlers {
    doctype?(doctype: Doctype): void | Promise<void>;
    comments?(comment: Comment): void | Promise<void>;
    text?(text: Text): void | Promise<void>;
    end?(end: DocumentEnd): void | Promise<void>;
}
interface Doctype {
    readonly name: string | null;
    readonly publicId: string | null;
    readonly systemId: string | null;
}
interface Element {
    tagName: string;
    readonly attributes: IterableIterator<string[]>;
    readonly removed: boolean;
    readonly namespaceURI: string;
    getAttribute(name: string): string | null;
    hasAttribute(name: string): boolean;
    setAttribute(name: string, value: string): Element;
    removeAttribute(name: string): Element;
    before(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    after(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    prepend(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    append(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    replace(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    remove(): Element;
    removeAndKeepContent(): Element;
    setInnerContent(content: string | ReadableStream | Response, options?: ContentOptions): Element;
    onEndTag(handler: (tag: EndTag) => void | Promise<void>): void;
}
interface EndTag {
    name: string;
    before(content: string | ReadableStream | Response, options?: ContentOptions): EndTag;
    after(content: string | ReadableStream | Response, options?: ContentOptions): EndTag;
    remove(): EndTag;
}
interface Comment {
    text: string;
    readonly removed: boolean;
    before(content: string, options?: ContentOptions): Comment;
    after(content: string, options?: ContentOptions): Comment;
    replace(content: string, options?: ContentOptions): Comment;
    remove(): Comment;
}
interface Text {
    readonly text: string;
    readonly lastInTextNode: boolean;
    readonly removed: boolean;
    before(content: string | ReadableStream | Response, options?: ContentOptions): Text;
    after(content: string | ReadableStream | Response, options?: ContentOptions): Text;
    replace(content: string | ReadableStream | Response, options?: ContentOptions): Text;
    remove(): Text;
}
interface DocumentEnd {
    append(content: string, options?: ContentOptions): DocumentEnd;
}
/**
 * This is the event type for fetch events dispatched on the service worker global scope. It contains information about the fetch, including the request and how the receiver will treat the response. It provides the event.respondWith() method, which allows us to provide a response to this fetch.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/FetchEvent)
 */
declare abstract class FetchEvent extends ExtendableEvent {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FetchEvent/request) */
    readonly request: Request;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/FetchEvent/respondWith) */
    respondWith(promise: Response | Promise<Response>): void;
    passThroughOnException(): void;
}
type HeadersInit = Headers | Iterable<Iterable<string>> | Record<string, string>;
/**
 * This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers)
 */
declare class Headers {
    constructor(init?: HeadersInit);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/get) */
    get(name: string): string | null;
    getAll(name: string): string[];
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/getSetCookie) */
    getSetCookie(): string[];
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/has) */
    has(name: string): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/set) */
    set(name: string, value: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/append) */
    append(name: string, value: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers/delete) */
    delete(name: string): void;
    forEach<This = unknown>(callback: (this: This, value: string, key: string, parent: Headers) => void, thisArg?: This): void;
    /* Returns an iterator allowing to go through all key/value pairs contained in this object. */
    entries(): IterableIterator<[
        key: string,
        value: string
    ]>;
    /* Returns an iterator allowing to go through all keys of the key/value pairs contained in this object. */
    keys(): IterableIterator<string>;
    /* Returns an iterator allowing to go through all values of the key/value pairs contained in this object. */
    values(): IterableIterator<string>;
    [Symbol.iterator](): IterableIterator<[
        key: string,
        value: string
    ]>;
}
type BodyInit = ReadableStream<Uint8Array> | string | ArrayBuffer | ArrayBufferView | Blob | URLSearchParams | FormData;
declare abstract class Body {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/body) */
    get body(): ReadableStream | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/bodyUsed) */
    get bodyUsed(): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/arrayBuffer) */
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/text) */
    text(): Promise<string>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/json) */
    json<T>(): Promise<T>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/formData) */
    formData(): Promise<FormData>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/blob) */
    blob(): Promise<Blob>;
}
/**
 * This Fetch API interface represents the response to a request.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response)
 */
declare var Response: {
    prototype: Response;
    new (body?: BodyInit | null, init?: ResponseInit): Response;
    error(): Response;
    redirect(url: string, status?: number): Response;
    json(any: any, maybeInit?: (ResponseInit | Response)): Response;
};
/**
 * This Fetch API interface represents the response to a request.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response)
 */
interface Response extends Body {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/clone) */
    clone(): Response;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/status) */
    status: number;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/statusText) */
    statusText: string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/headers) */
    headers: Headers;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/ok) */
    ok: boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/redirected) */
    redirected: boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/url) */
    url: string;
    webSocket: WebSocket | null;
    cf: any | undefined;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/type) */
    type: "default" | "error";
}
interface ResponseInit {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
    cf?: any;
    webSocket?: (WebSocket | null);
    encodeBody?: "automatic" | "manual";
}
type RequestInfo<CfHostMetadata = unknown, Cf = CfProperties<CfHostMetadata>> = Request<CfHostMetadata, Cf> | string;
/**
 * This Fetch API interface represents a resource request.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request)
 */
declare var Request: {
    prototype: Request;
    new <CfHostMetadata = unknown, Cf = CfProperties<CfHostMetadata>>(input: RequestInfo<CfProperties> | URL, init?: RequestInit<Cf>): Request<CfHostMetadata, Cf>;
};
/**
 * This Fetch API interface represents a resource request.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request)
 */
interface Request<CfHostMetadata = unknown, Cf = CfProperties<CfHostMetadata>> extends Body {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/clone) */
    clone(): Request<CfHostMetadata, Cf>;
    /**
     * Returns request's HTTP method, which is "GET" by default.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/method)
     */
    method: string;
    /**
     * Returns the URL of request as a string.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/url)
     */
    url: string;
    /**
     * Returns a Headers object consisting of the headers associated with request. Note that headers added in the network layer by the user agent will not be accounted for in this object, e.g., the "Host" header.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/headers)
     */
    headers: Headers;
    /**
     * Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/redirect)
     */
    redirect: string;
    fetcher: Fetcher | null;
    /**
     * Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/signal)
     */
    signal: AbortSignal;
    cf: Cf | undefined;
    /**
     * Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI]
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/integrity)
     */
    integrity: string;
    /* Returns a boolean indicating whether or not request can outlive the global in which it was created. */
    keepalive: boolean;
    /**
     * Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/cache)
     */
    cache?: "no-store";
}
interface RequestInit<Cf = CfProperties> {
    /* A string to set request's method. */
    method?: string;
    /* A Headers object, an object literal, or an array of two-item arrays to set request's headers. */
    headers?: HeadersInit;
    /* A BodyInit object or null to set request's body. */
    body?: BodyInit | null;
    /* A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. */
    redirect?: string;
    fetcher?: (Fetcher | null);
    cf?: Cf;
    /* A string indicating how the request will interact with the browser's cache to set request's cache. */
    cache?: "no-store";
    /* A cryptographic hash of the resource to be fetched by request. Sets request's integrity. */
    integrity?: string;
    /* An AbortSignal to set request's signal. */
    signal?: (AbortSignal | null);
    encodeResponseBody?: "automatic" | "manual";
}
type Service<T extends Rpc.WorkerEntrypointBranded | undefined = undefined> = Fetcher<T>;
type Fetcher<T extends Rpc.EntrypointBranded | undefined = undefined, Reserved extends string = never> = (T extends Rpc.EntrypointBranded ? Rpc.Provider<T, Reserved | "fetch" | "connect"> : unknown) & {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    connect(address: SocketAddress | string, options?: SocketOptions): Socket;
};
interface KVNamespaceListKey<Metadata, Key extends string = string> {
    name: Key;
    expiration?: number;
    metadata?: Metadata;
}
type KVNamespaceListResult<Metadata, Key extends string = string> = {
    list_complete: false;
    keys: KVNamespaceListKey<Metadata, Key>[];
    cursor: string;
    cacheStatus: string | null;
} | {
    list_complete: true;
    keys: KVNamespaceListKey<Metadata, Key>[];
    cacheStatus: string | null;
};
interface KVNamespace<Key extends string = string> {
    get(key: Key, options?: Partial<KVNamespaceGetOptions<undefined>>): Promise<string | null>;
    get(key: Key, type: "text"): Promise<string | null>;
    get<ExpectedValue = unknown>(key: Key, type: "json"): Promise<ExpectedValue | null>;
    get(key: Key, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
    get(key: Key, type: "stream"): Promise<ReadableStream | null>;
    get(key: Key, options?: KVNamespaceGetOptions<"text">): Promise<string | null>;
    get<ExpectedValue = unknown>(key: Key, options?: KVNamespaceGetOptions<"json">): Promise<ExpectedValue | null>;
    get(key: Key, options?: KVNamespaceGetOptions<"arrayBuffer">): Promise<ArrayBuffer | null>;
    get(key: Key, options?: KVNamespaceGetOptions<"stream">): Promise<ReadableStream | null>;
    list<Metadata = unknown>(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<Metadata, Key>>;
    put(key: Key, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: KVNamespacePutOptions): Promise<void>;
    getWithMetadata<Metadata = unknown>(key: Key, options?: Partial<KVNamespaceGetOptions<undefined>>): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, type: "text"): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(key: Key, type: "json"): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, type: "arrayBuffer"): Promise<KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, type: "stream"): Promise<KVNamespaceGetWithMetadataResult<ReadableStream, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, options: KVNamespaceGetOptions<"text">): Promise<KVNamespaceGetWithMetadataResult<string, Metadata>>;
    getWithMetadata<ExpectedValue = unknown, Metadata = unknown>(key: Key, options: KVNamespaceGetOptions<"json">): Promise<KVNamespaceGetWithMetadataResult<ExpectedValue, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, options: KVNamespaceGetOptions<"arrayBuffer">): Promise<KVNamespaceGetWithMetadataResult<ArrayBuffer, Metadata>>;
    getWithMetadata<Metadata = unknown>(key: Key, options: KVNamespaceGetOptions<"stream">): Promise<KVNamespaceGetWithMetadataResult<ReadableStream, Metadata>>;
    delete(key: Key): Promise<void>;
}
interface KVNamespaceListOptions {
    limit?: number;
    prefix?: (string | null);
    cursor?: (string | null);
}
interface KVNamespaceGetOptions<Type> {
    type: Type;
    cacheTtl?: number;
}
interface KVNamespacePutOptions {
    expiration?: number;
    expirationTtl?: number;
    metadata?: (any | null);
}
interface KVNamespaceGetWithMetadataResult<Value, Metadata> {
    value: Value | null;
    metadata: Metadata | null;
    cacheStatus: string | null;
}
type QueueContentType = "text" | "bytes" | "json" | "v8";
interface Queue<Body = unknown> {
    send(message: Body, options?: QueueSendOptions): Promise<void>;
    sendBatch(messages: Iterable<MessageSendRequest<Body>>, options?: QueueSendBatchOptions): Promise<void>;
}
interface QueueSendOptions {
    contentType?: QueueContentType;
    delaySeconds?: number;
}
interface QueueSendBatchOptions {
    delaySeconds?: number;
}
interface MessageSendRequest<Body = unknown> {
    body: Body;
    contentType?: QueueContentType;
    delaySeconds?: number;
}
interface QueueRetryOptions {
    delaySeconds?: number;
}
interface Message<Body = unknown> {
    readonly id: string;
    readonly timestamp: Date;
    readonly body: Body;
    readonly attempts: number;
    retry(options?: QueueRetryOptions): void;
    ack(): void;
}
interface QueueEvent<Body = unknown> extends ExtendableEvent {
    readonly messages: readonly Message<Body>[];
    readonly queue: string;
    retryAll(options?: QueueRetryOptions): void;
    ackAll(): void;
}
interface MessageBatch<Body = unknown> {
    readonly messages: readonly Message<Body>[];
    readonly queue: string;
    retryAll(options?: QueueRetryOptions): void;
    ackAll(): void;
}
interface R2Error extends Error {
    readonly name: string;
    readonly code: number;
    readonly message: string;
    readonly action: string;
    readonly stack: any;
}
interface R2ListOptions {
    limit?: number;
    prefix?: string;
    cursor?: string;
    delimiter?: string;
    startAfter?: string;
    include?: ("httpMetadata" | "customMetadata")[];
}
declare abstract class R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(key: string, options: R2GetOptions & {
        onlyIf: R2Conditional | Headers;
    }): Promise<R2ObjectBody | R2Object | null>;
    get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions & {
        onlyIf: R2Conditional | Headers;
    }): Promise<R2Object | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
    createMultipartUpload(key: string, options?: R2MultipartOptions): Promise<R2MultipartUpload>;
    resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload;
    delete(keys: string | string[]): Promise<void>;
    list(options?: R2ListOptions): Promise<R2Objects>;
}
interface R2MultipartUpload {
    readonly key: string;
    readonly uploadId: string;
    uploadPart(partNumber: number, value: ReadableStream | (ArrayBuffer | ArrayBufferView) | string | Blob, options?: R2UploadPartOptions): Promise<R2UploadedPart>;
    abort(): Promise<void>;
    complete(uploadedParts: R2UploadedPart[]): Promise<R2Object>;
}
interface R2UploadedPart {
    partNumber: number;
    etag: string;
}
declare abstract class R2Object {
    readonly key: string;
    readonly version: string;
    readonly size: number;
    readonly etag: string;
    readonly httpEtag: string;
    readonly checksums: R2Checksums;
    readonly uploaded: Date;
    readonly httpMetadata?: R2HTTPMetadata;
    readonly customMetadata?: Record<string, string>;
    readonly range?: R2Range;
    readonly storageClass: string;
    readonly ssecKeyMd5?: string;
    writeHttpMetadata(headers: Headers): void;
}
interface R2ObjectBody extends R2Object {
    get body(): ReadableStream;
    get bodyUsed(): boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T>(): Promise<T>;
    blob(): Promise<Blob>;
}
type R2Range = {
    offset: number;
    length?: number;
} | {
    offset?: number;
    length: number;
} | {
    suffix: number;
};
interface R2Conditional {
    etagMatches?: string;
    etagDoesNotMatch?: string;
    uploadedBefore?: Date;
    uploadedAfter?: Date;
    secondsGranularity?: boolean;
}
interface R2GetOptions {
    onlyIf?: (R2Conditional | Headers);
    range?: (R2Range | Headers);
    ssecKey?: (ArrayBuffer | string);
}
interface R2PutOptions {
    onlyIf?: (R2Conditional | Headers);
    httpMetadata?: (R2HTTPMetadata | Headers);
    customMetadata?: Record<string, string>;
    md5?: (ArrayBuffer | string);
    sha1?: (ArrayBuffer | string);
    sha256?: (ArrayBuffer | string);
    sha384?: (ArrayBuffer | string);
    sha512?: (ArrayBuffer | string);
    storageClass?: string;
    ssecKey?: (ArrayBuffer | string);
}
interface R2MultipartOptions {
    httpMetadata?: (R2HTTPMetadata | Headers);
    customMetadata?: Record<string, string>;
    storageClass?: string;
    ssecKey?: (ArrayBuffer | string);
}
interface R2Checksums {
    readonly md5?: ArrayBuffer;
    readonly sha1?: ArrayBuffer;
    readonly sha256?: ArrayBuffer;
    readonly sha384?: ArrayBuffer;
    readonly sha512?: ArrayBuffer;
    toJSON(): R2StringChecksums;
}
interface R2StringChecksums {
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
}
interface R2HTTPMetadata {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
}
type R2Objects = {
    objects: R2Object[];
    delimitedPrefixes: string[];
} & ({
    truncated: true;
    cursor: string;
} | {
    truncated: false;
});
interface R2UploadPartOptions {
    ssecKey?: (ArrayBuffer | string);
}
declare abstract class ScheduledEvent extends ExtendableEvent {
    readonly scheduledTime: number;
    readonly cron: string;
    noRetry(): void;
}
interface ScheduledController {
    readonly scheduledTime: number;
    readonly cron: string;
    noRetry(): void;
}
interface QueuingStrategy<T = any> {
    highWaterMark?: (number | bigint);
    size?: (chunk: T) => number | bigint;
}
interface UnderlyingSink<W = any> {
    type?: string;
    start?: (controller: WritableStreamDefaultController) => void | Promise<void>;
    write?: (chunk: W, controller: WritableStreamDefaultController) => void | Promise<void>;
    abort?: (reason: any) => void | Promise<void>;
    close?: () => void | Promise<void>;
}
interface UnderlyingByteSource {
    type: "bytes";
    autoAllocateChunkSize?: number;
    start?: (controller: ReadableByteStreamController) => void | Promise<void>;
    pull?: (controller: ReadableByteStreamController) => void | Promise<void>;
    cancel?: (reason: any) => void | Promise<void>;
}
interface UnderlyingSource<R = any> {
    type?: "" | undefined;
    start?: (controller: ReadableStreamDefaultController<R>) => void | Promise<void>;
    pull?: (controller: ReadableStreamDefaultController<R>) => void | Promise<void>;
    cancel?: (reason: any) => void | Promise<void>;
    expectedLength?: (number | bigint);
}
interface Transformer<I = any, O = any> {
    readableType?: string;
    writableType?: string;
    start?: (controller: TransformStreamDefaultController<O>) => void | Promise<void>;
    transform?: (chunk: I, controller: TransformStreamDefaultController<O>) => void | Promise<void>;
    flush?: (controller: TransformStreamDefaultController<O>) => void | Promise<void>;
    cancel?: (reason: any) => void | Promise<void>;
    expectedLength?: number;
}
interface StreamPipeOptions {
    /**
     * Pipes this readable stream to a given writable stream destination. The way in which the piping process behaves under various error conditions can be customized with a number of passed options. It returns a promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     *
     * Errors and closures of the source and destination streams propagate as follows:
     *
     * An error in this source readable stream will abort destination, unless preventAbort is truthy. The returned promise will be rejected with the source's error, or with any error that occurs during aborting the destination.
     *
     * An error in destination will cancel this source readable stream, unless preventCancel is truthy. The returned promise will be rejected with the destination's error, or with any error that occurs during canceling the source.
     *
     * When this source readable stream closes, destination will be closed, unless preventClose is truthy. The returned promise will be fulfilled once this process completes, unless an error is encountered while closing the destination, in which case it will be rejected with that error.
     *
     * If destination starts out closed or closing, this source readable stream will be canceled, unless preventCancel is true. The returned promise will be rejected with an error indicating piping to a closed stream failed, or with any error that occurs during canceling the source.
     *
     * The signal option can be set to an AbortSignal to allow aborting an ongoing pipe operation via the corresponding AbortController. In this case, this source readable stream will be canceled, and destination aborted, unless the respective options preventCancel or preventAbort are set.
     */
    preventClose?: boolean;
    preventAbort?: boolean;
    preventCancel?: boolean;
    signal?: AbortSignal;
}
type ReadableStreamReadResult<R = any> = {
    done: false;
    value: R;
} | {
    done: true;
    value?: undefined;
};
/**
 * This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a ReadableStream through the body property of a Response object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream)
 */
interface ReadableStream<R = any> {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/locked) */
    get locked(): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/cancel) */
    cancel(reason?: any): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/getReader) */
    getReader(): ReadableStreamDefaultReader<R>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/getReader) */
    getReader(options: ReadableStreamGetReaderOptions): ReadableStreamBYOBReader;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/pipeThrough) */
    pipeThrough<T>(transform: ReadableWritablePair<T, R>, options?: StreamPipeOptions): ReadableStream<T>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/pipeTo) */
    pipeTo(destination: WritableStream<R>, options?: StreamPipeOptions): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream/tee) */
    tee(): [
        ReadableStream<R>,
        ReadableStream<R>
    ];
    values(options?: ReadableStreamValuesOptions): AsyncIterableIterator<R>;
    [Symbol.asyncIterator](options?: ReadableStreamValuesOptions): AsyncIterableIterator<R>;
}
/**
 * This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a ReadableStream through the body property of a Response object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStream)
 */
declare const ReadableStream: {
    prototype: ReadableStream;
    new (underlyingSource: UnderlyingByteSource, strategy?: QueuingStrategy<Uint8Array>): ReadableStream<Uint8Array>;
    new <R = any>(underlyingSource?: UnderlyingSource<R>, strategy?: QueuingStrategy<R>): ReadableStream<R>;
};
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultReader) */
declare class ReadableStreamDefaultReader<R = any> {
    constructor(stream: ReadableStream);
    get closed(): Promise<void>;
    cancel(reason?: any): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultReader/read) */
    read(): Promise<ReadableStreamReadResult<R>>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultReader/releaseLock) */
    releaseLock(): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBReader) */
declare class ReadableStreamBYOBReader {
    constructor(stream: ReadableStream);
    get closed(): Promise<void>;
    cancel(reason?: any): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBReader/read) */
    read<T extends ArrayBufferView>(view: T): Promise<ReadableStreamReadResult<T>>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBReader/releaseLock) */
    releaseLock(): void;
    readAtLeast<T extends ArrayBufferView>(minElements: number, view: T): Promise<ReadableStreamReadResult<T>>;
}
interface ReadableStreamBYOBReaderReadableStreamBYOBReaderReadOptions {
    min?: number;
}
interface ReadableStreamGetReaderOptions {
    /**
     * Creates a ReadableStreamBYOBReader and locks the stream to the new reader.
     *
     * This call behaves the same way as the no-argument variant, except that it only works on readable byte streams, i.e. streams which were constructed specifically with the ability to handle "bring your own buffer" reading. The returned BYOB reader provides the ability to directly read individual chunks from the stream via its read() method, into developer-supplied buffers, allowing more precise control over allocation.
     */
    mode: "byob";
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBRequest) */
declare abstract class ReadableStreamBYOBRequest {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBRequest/view) */
    get view(): Uint8Array | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBRequest/respond) */
    respond(bytesWritten: number): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamBYOBRequest/respondWithNewView) */
    respondWithNewView(view: ArrayBuffer | ArrayBufferView): void;
    get atLeast(): number | null;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController) */
declare abstract class ReadableStreamDefaultController<R = any> {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/desiredSize) */
    get desiredSize(): number | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/close) */
    close(): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/enqueue) */
    enqueue(chunk?: R): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableStreamDefaultController/error) */
    error(reason: any): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController) */
declare abstract class ReadableByteStreamController {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/byobRequest) */
    get byobRequest(): ReadableStreamBYOBRequest | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/desiredSize) */
    get desiredSize(): number | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/close) */
    close(): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/enqueue) */
    enqueue(chunk: ArrayBuffer | ArrayBufferView): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ReadableByteStreamController/error) */
    error(reason: any): void;
}
/**
 * This Streams API interface represents a controller allowing control of a WritableStream's state. When constructing a WritableStream, the underlying sink is given a corresponding WritableStreamDefaultController instance to manipulate.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultController)
 */
declare abstract class WritableStreamDefaultController {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultController/signal) */
    get signal(): AbortSignal;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultController/error) */
    error(reason?: any): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController) */
declare abstract class TransformStreamDefaultController<O = any> {
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/desiredSize) */
    get desiredSize(): number | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/enqueue) */
    enqueue(chunk?: O): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/error) */
    error(reason: any): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStreamDefaultController/terminate) */
    terminate(): void;
}
interface ReadableWritablePair<R = any, W = any> {
    /**
     * Provides a convenient, chainable way of piping this readable stream through a transform stream (or any other { writable, readable } pair). It simply pipes the stream into the writable side of the supplied pair, and returns the readable side for further use.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     */
    writable: WritableStream<W>;
    readable: ReadableStream<R>;
}
/**
 * This Streams API interface provides a standard abstraction for writing streaming data to a destination, known as a sink. This object comes with built-in backpressure and queuing.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream)
 */
declare class WritableStream<W = any> {
    constructor(underlyingSink?: UnderlyingSink, queuingStrategy?: QueuingStrategy);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/locked) */
    get locked(): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/abort) */
    abort(reason?: any): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/close) */
    close(): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStream/getWriter) */
    getWriter(): WritableStreamDefaultWriter<W>;
}
/**
 * This Streams API interface is the object returned by WritableStream.getWriter() and once created locks the < writer to the WritableStream ensuring that no other streams can write to the underlying sink.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter)
 */
declare class WritableStreamDefaultWriter<W = any> {
    constructor(stream: WritableStream);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/closed) */
    get closed(): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/ready) */
    get ready(): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/desiredSize) */
    get desiredSize(): number | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/abort) */
    abort(reason?: any): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/close) */
    close(): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/write) */
    write(chunk?: W): Promise<void>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/WritableStreamDefaultWriter/releaseLock) */
    releaseLock(): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStream) */
declare class TransformStream<I = any, O = any> {
    constructor(transformer?: Transformer<I, O>, writableStrategy?: QueuingStrategy<I>, readableStrategy?: QueuingStrategy<O>);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStream/readable) */
    get readable(): ReadableStream<O>;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TransformStream/writable) */
    get writable(): WritableStream<I>;
}
declare class FixedLengthStream extends IdentityTransformStream {
    constructor(expectedLength: number | bigint, queuingStrategy?: IdentityTransformStreamQueuingStrategy);
}
declare class IdentityTransformStream extends TransformStream<ArrayBuffer | ArrayBufferView, Uint8Array> {
    constructor(queuingStrategy?: IdentityTransformStreamQueuingStrategy);
}
interface IdentityTransformStreamQueuingStrategy {
    highWaterMark?: (number | bigint);
}
interface ReadableStreamValuesOptions {
    preventCancel?: boolean;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CompressionStream) */
declare class CompressionStream extends TransformStream<ArrayBuffer | ArrayBufferView, Uint8Array> {
    constructor(format: "gzip" | "deflate" | "deflate-raw");
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/DecompressionStream) */
declare class DecompressionStream extends TransformStream<ArrayBuffer | ArrayBufferView, Uint8Array> {
    constructor(format: "gzip" | "deflate" | "deflate-raw");
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextEncoderStream) */
declare class TextEncoderStream extends TransformStream<string, Uint8Array> {
    constructor();
    get encoding(): string;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/TextDecoderStream) */
declare class TextDecoderStream extends TransformStream<ArrayBuffer | ArrayBufferView, string> {
    constructor(label?: string, options?: TextDecoderStreamTextDecoderStreamInit);
    get encoding(): string;
    get fatal(): boolean;
    get ignoreBOM(): boolean;
}
interface TextDecoderStreamTextDecoderStreamInit {
    fatal?: boolean;
    ignoreBOM?: boolean;
}
/**
 * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy)
 */
declare class ByteLengthQueuingStrategy implements QueuingStrategy<ArrayBufferView> {
    constructor(init: QueuingStrategyInit);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/highWaterMark) */
    get highWaterMark(): number;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/ByteLengthQueuingStrategy/size) */
    get size(): (chunk?: any) => number;
}
/**
 * This Streams API interface provides a built-in byte length queuing strategy that can be used when constructing streams.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy)
 */
declare class CountQueuingStrategy implements QueuingStrategy {
    constructor(init: QueuingStrategyInit);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy/highWaterMark) */
    get highWaterMark(): number;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/CountQueuingStrategy/size) */
    get size(): (chunk?: any) => number;
}
interface QueuingStrategyInit {
    /**
     * Creates a new ByteLengthQueuingStrategy with the provided high water mark.
     *
     * Note that the provided high water mark will not be validated ahead of time. Instead, if it is negative, NaN, or not a number, the resulting ByteLengthQueuingStrategy will cause the corresponding stream constructor to throw.
     */
    highWaterMark: number;
}
interface ScriptVersion {
    id?: string;
    tag?: string;
    message?: string;
}
declare abstract class TailEvent extends ExtendableEvent {
    readonly events: TraceItem[];
    readonly traces: TraceItem[];
}
interface TraceItem {
    readonly event: (TraceItemFetchEventInfo | TraceItemJsRpcEventInfo | TraceItemScheduledEventInfo | TraceItemAlarmEventInfo | TraceItemQueueEventInfo | TraceItemEmailEventInfo | TraceItemTailEventInfo | TraceItemCustomEventInfo | TraceItemHibernatableWebSocketEventInfo) | null;
    readonly eventTimestamp: number | null;
    readonly logs: TraceLog[];
    readonly exceptions: TraceException[];
    readonly diagnosticsChannelEvents: TraceDiagnosticChannelEvent[];
    readonly scriptName: string | null;
    readonly entrypoint?: string;
    readonly scriptVersion?: ScriptVersion;
    readonly dispatchNamespace?: string;
    readonly scriptTags?: string[];
    readonly outcome: string;
    readonly executionModel: string;
    readonly truncated: boolean;
    readonly cpuTime: number;
    readonly wallTime: number;
}
interface TraceItemAlarmEventInfo {
    readonly scheduledTime: Date;
}
interface TraceItemCustomEventInfo {
}
interface TraceItemScheduledEventInfo {
    readonly scheduledTime: number;
    readonly cron: string;
}
interface TraceItemQueueEventInfo {
    readonly queue: string;
    readonly batchSize: number;
}
interface TraceItemEmailEventInfo {
    readonly mailFrom: string;
    readonly rcptTo: string;
    readonly rawSize: number;
}
interface TraceItemTailEventInfo {
    readonly consumedEvents: TraceItemTailEventInfoTailItem[];
}
interface TraceItemTailEventInfoTailItem {
    readonly scriptName: string | null;
}
interface TraceItemFetchEventInfo {
    readonly response?: TraceItemFetchEventInfoResponse;
    readonly request: TraceItemFetchEventInfoRequest;
}
interface TraceItemFetchEventInfoRequest {
    readonly cf?: any;
    readonly headers: Record<string, string>;
    readonly method: string;
    readonly url: string;
    getUnredacted(): TraceItemFetchEventInfoRequest;
}
interface TraceItemFetchEventInfoResponse {
    readonly status: number;
}
interface TraceItemJsRpcEventInfo {
    readonly rpcMethod: string;
}
interface TraceItemHibernatableWebSocketEventInfo {
    readonly getWebSocketEvent: TraceItemHibernatableWebSocketEventInfoMessage | TraceItemHibernatableWebSocketEventInfoClose | TraceItemHibernatableWebSocketEventInfoError;
}
interface TraceItemHibernatableWebSocketEventInfoMessage {
    readonly webSocketEventType: string;
}
interface TraceItemHibernatableWebSocketEventInfoClose {
    readonly webSocketEventType: string;
    readonly code: number;
    readonly wasClean: boolean;
}
interface TraceItemHibernatableWebSocketEventInfoError {
    readonly webSocketEventType: string;
}
interface TraceLog {
    readonly timestamp: number;
    readonly level: string;
    readonly message: any;
}
interface TraceException {
    readonly timestamp: number;
    readonly message: string;
    readonly name: string;
    readonly stack?: string;
}
interface TraceDiagnosticChannelEvent {
    readonly timestamp: number;
    readonly channel: string;
    readonly message: any;
}
interface TraceMetrics {
    readonly cpuTime: number;
    readonly wallTime: number;
}
interface UnsafeTraceMetrics {
    fromTrace(item: TraceItem): TraceMetrics;
}
/**
 * The URL interface represents an object providing static methods used for creating object URLs.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL)
 */
declare class URL {
    constructor(url: string | URL, base?: string | URL);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/origin) */
    get origin(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/href) */
    get href(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/href) */
    set href(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/protocol) */
    get protocol(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/protocol) */
    set protocol(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/username) */
    get username(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/username) */
    set username(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/password) */
    get password(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/password) */
    set password(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/host) */
    get host(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/host) */
    set host(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hostname) */
    get hostname(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hostname) */
    set hostname(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/port) */
    get port(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/port) */
    set port(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/pathname) */
    get pathname(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/pathname) */
    set pathname(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/search) */
    get search(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/search) */
    set search(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hash) */
    get hash(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hash) */
    set hash(value: string);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/searchParams) */
    get searchParams(): URLSearchParams;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/toJSON) */
    toJSON(): string;
    /*function toString() { [native code] }*/
    toString(): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/canParse_static) */
    static canParse(url: string, base?: string): boolean;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/parse_static) */
    static parse(url: string, base?: string): URL | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL_static) */
    static createObjectURL(object: File | Blob): string;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL_static) */
    static revokeObjectURL(object_url: string): void;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams) */
declare class URLSearchParams {
    constructor(init?: (Iterable<Iterable<string>> | Record<string, string> | string));
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/size) */
    get size(): number;
    /**
     * Appends a specified key/value pair as a new search parameter.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/append)
     */
    append(name: string, value: string): void;
    /**
     * Deletes the given search parameter, and its associated value, from the list of all search parameters.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/delete)
     */
    delete(name: string, value?: string): void;
    /**
     * Returns the first value associated to the given search parameter.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/get)
     */
    get(name: string): string | null;
    /**
     * Returns all the values association with a given search parameter.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/getAll)
     */
    getAll(name: string): string[];
    /**
     * Returns a Boolean indicating if such a search parameter exists.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/has)
     */
    has(name: string, value?: string): boolean;
    /**
     * Sets the value associated to a given search parameter to the given value. If there were several values, delete the others.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/set)
     */
    set(name: string, value: string): void;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/URLSearchParams/sort) */
    sort(): void;
    /* Returns an array of key, value pairs for every entry in the search params. */
    entries(): IterableIterator<[
        key: string,
        value: string
    ]>;
    /* Returns a list of keys in the search params. */
    keys(): IterableIterator<string>;
    /* Returns a list of values in the search params. */
    values(): IterableIterator<string>;
    forEach<This = unknown>(callback: (this: This, value: string, key: string, parent: URLSearchParams) => void, thisArg?: This): void;
    /*function toString() { [native code] } Returns a string containing a query string suitable for use in a URL. Does not include the question mark. */
    toString(): string;
    [Symbol.iterator](): IterableIterator<[
        key: string,
        value: string
    ]>;
}
declare class URLPattern {
    constructor(input?: (string | URLPatternURLPatternInit), baseURL?: (string | URLPatternURLPatternOptions), patternOptions?: URLPatternURLPatternOptions);
    get protocol(): string;
    get username(): string;
    get password(): string;
    get hostname(): string;
    get port(): string;
    get pathname(): string;
    get search(): string;
    get hash(): string;
    test(input?: (string | URLPatternURLPatternInit), baseURL?: string): boolean;
    exec(input?: (string | URLPatternURLPatternInit), baseURL?: string): URLPatternURLPatternResult | null;
}
interface URLPatternURLPatternInit {
    protocol?: string;
    username?: string;
    password?: string;
    hostname?: string;
    port?: string;
    pathname?: string;
    search?: string;
    hash?: string;
    baseURL?: string;
}
interface URLPatternURLPatternComponentResult {
    input: string;
    groups: Record<string, string>;
}
interface URLPatternURLPatternResult {
    inputs: (string | URLPatternURLPatternInit)[];
    protocol: URLPatternURLPatternComponentResult;
    username: URLPatternURLPatternComponentResult;
    password: URLPatternURLPatternComponentResult;
    hostname: URLPatternURLPatternComponentResult;
    port: URLPatternURLPatternComponentResult;
    pathname: URLPatternURLPatternComponentResult;
    search: URLPatternURLPatternComponentResult;
    hash: URLPatternURLPatternComponentResult;
}
interface URLPatternURLPatternOptions {
    ignoreCase?: boolean;
}
/**
 * A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent)
 */
declare class CloseEvent extends Event {
    constructor(type: string, initializer?: CloseEventInit);
    /**
     * Returns the WebSocket connection close code provided by the server.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/code)
     */
    readonly code: number;
    /**
     * Returns the WebSocket connection close reason provided by the server.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/reason)
     */
    readonly reason: string;
    /**
     * Returns true if the connection closed cleanly; false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CloseEvent/wasClean)
     */
    readonly wasClean: boolean;
}
interface CloseEventInit {
    code?: number;
    reason?: string;
    wasClean?: boolean;
}
/**
 * A message received by a target object.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent)
 */
declare class MessageEvent extends Event {
    constructor(type: string, initializer: MessageEventInit);
    /**
     * Returns the data of the message.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/MessageEvent/data)
     */
    readonly data: ArrayBuffer | string;
}
interface MessageEventInit {
    data: ArrayBuffer | string;
}
type WebSocketEventMap = {
    close: CloseEvent;
    message: MessageEvent;
    open: Event;
    error: ErrorEvent;
};
/**
 * Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket)
 */
declare var WebSocket: {
    prototype: WebSocket;
    new (url: string, protocols?: (string[] | string)): WebSocket;
    readonly READY_STATE_CONNECTING: number;
    readonly CONNECTING: number;
    readonly READY_STATE_OPEN: number;
    readonly OPEN: number;
    readonly READY_STATE_CLOSING: number;
    readonly CLOSING: number;
    readonly READY_STATE_CLOSED: number;
    readonly CLOSED: number;
};
/**
 * Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket)
 */
interface WebSocket extends EventTarget<WebSocketEventMap> {
    accept(): void;
    /**
     * Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/send)
     */
    send(message: (ArrayBuffer | ArrayBufferView) | string): void;
    /**
     * Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/close)
     */
    close(code?: number, reason?: string): void;
    serializeAttachment(attachment: any): void;
    deserializeAttachment(): any | null;
    /**
     * Returns the state of the WebSocket object's connection. It can have the values described below.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/readyState)
     */
    readyState: number;
    /**
     * Returns the URL that was used to establish the WebSocket connection.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/url)
     */
    url: string | null;
    /**
     * Returns the subprotocol selected by the server, if any. It can be used in conjunction with the array form of the constructor's second argument to perform subprotocol negotiation.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/protocol)
     */
    protocol: string | null;
    /**
     * Returns the extensions selected by the server, if any.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/WebSocket/extensions)
     */
    extensions: string | null;
}
declare const WebSocketPair: {
    new (): {
        0: WebSocket;
        1: WebSocket;
    };
};
interface SqlStorage {
    exec<T extends Record<string, SqlStorageValue>>(query: string, ...bindings: any[]): SqlStorageCursor<T>;
    get databaseSize(): number;
    Cursor: typeof SqlStorageCursor;
    Statement: typeof SqlStorageStatement;
}
declare abstract class SqlStorageStatement {
}
type SqlStorageValue = ArrayBuffer | string | number | null;
declare abstract class SqlStorageCursor<T extends Record<string, SqlStorageValue>> {
    next(): {
        done?: false;
        value: T;
    } | {
        done: true;
        value?: never;
    };
    toArray(): T[];
    one(): T;
    raw<U extends SqlStorageValue[]>(): IterableIterator<U>;
    columnNames: string[];
    get rowsRead(): number;
    get rowsWritten(): number;
    [Symbol.iterator](): IterableIterator<T>;
}
interface Socket {
    get readable(): ReadableStream;
    get writable(): WritableStream;
    get closed(): Promise<void>;
    get opened(): Promise<SocketInfo>;
    close(): Promise<void>;
    startTls(options?: TlsOptions): Socket;
}
interface SocketOptions {
    secureTransport?: string;
    allowHalfOpen: boolean;
    highWaterMark?: (number | bigint);
}
interface SocketAddress {
    hostname: string;
    port: number;
}
interface TlsOptions {
    expectedServerHostname?: string;
}
interface SocketInfo {
    remoteAddress?: string;
    localAddress?: string;
}
interface GPU {
    requestAdapter(param1?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
}
declare abstract class GPUAdapter {
    requestDevice(param1?: GPUDeviceDescriptor): Promise<GPUDevice>;
    requestAdapterInfo(unmaskHints?: string[]): Promise<GPUAdapterInfo>;
    get features(): GPUSupportedFeatures;
    get limits(): GPUSupportedLimits;
}
interface GPUDevice extends EventTarget {
    createBuffer(param1: GPUBufferDescriptor): GPUBuffer;
    createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
    createSampler(descriptor: GPUSamplerDescriptor): GPUSampler;
    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
    createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
    createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
    createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
    createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
    createTexture(param1: GPUTextureDescriptor): GPUTexture;
    destroy(): void;
    createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet;
    pushErrorScope(filter: string): void;
    popErrorScope(): Promise<GPUError | null>;
    get queue(): GPUQueue;
    get lost(): Promise<GPUDeviceLostInfo>;
    get features(): GPUSupportedFeatures;
    get limits(): GPUSupportedLimits;
}
interface GPUDeviceDescriptor {
    label?: string;
    requiredFeatures?: string[];
    requiredLimits?: Record<string, number | bigint>;
    defaultQueue?: GPUQueueDescriptor;
}
interface GPUBufferDescriptor {
    label: string;
    size: number | bigint;
    usage: number;
    mappedAtCreation: boolean;
}
interface GPUQueueDescriptor {
    label?: string;
}
declare abstract class GPUBufferUsage {
    static readonly MAP_READ: number;
    static readonly MAP_WRITE: number;
    static readonly COPY_SRC: number;
    static readonly COPY_DST: number;
    static readonly INDEX: number;
    static readonly VERTEX: number;
    static readonly UNIFORM: number;
    static readonly STORAGE: number;
    static readonly INDIRECT: number;
    static readonly QUERY_RESOLVE: number;
}
interface GPUBuffer {
    getMappedRange(size?: (number | bigint), param2?: (number | bigint)): ArrayBuffer;
    unmap(): void;
    destroy(): void;
    mapAsync(offset: number, size?: (number | bigint), param3?: (number | bigint)): Promise<void>;
    get size(): number | bigint;
    get usage(): number;
    get mapState(): string;
}
declare abstract class GPUShaderStage {
    static readonly VERTEX: number;
    static readonly FRAGMENT: number;
    static readonly COMPUTE: number;
}
interface GPUBindGroupLayoutDescriptor {
    label?: string;
    entries: GPUBindGroupLayoutEntry[];
}
interface GPUBindGroupLayoutEntry {
    binding: number;
    visibility: number;
    buffer?: GPUBufferBindingLayout;
    sampler?: GPUSamplerBindingLayout;
    texture?: GPUTextureBindingLayout;
    storageTexture?: GPUStorageTextureBindingLayout;
}
interface GPUStorageTextureBindingLayout {
    access?: string;
    format: string;
    viewDimension?: string;
}
interface GPUTextureBindingLayout {
    sampleType?: string;
    viewDimension?: string;
    multisampled?: boolean;
}
interface GPUSamplerBindingLayout {
    type?: string;
}
interface GPUBufferBindingLayout {
    type?: string;
    hasDynamicOffset?: boolean;
    minBindingSize?: (number | bigint);
}
interface GPUBindGroupLayout {
}
interface GPUBindGroup {
}
interface GPUBindGroupDescriptor {
    label?: string;
    layout: GPUBindGroupLayout;
    entries: GPUBindGroupEntry[];
}
interface GPUBindGroupEntry {
    binding: number;
    resource: GPUBufferBinding | GPUSampler;
}
interface GPUBufferBinding {
    buffer: GPUBuffer;
    offset?: (number | bigint);
    size?: (number | bigint);
}
interface GPUSampler {
}
interface GPUSamplerDescriptor {
    label?: string;
    addressModeU?: string;
    addressModeV?: string;
    addressModeW?: string;
    magFilter?: string;
    minFilter?: string;
    mipmapFilter?: string;
    lodMinClamp?: number;
    lodMaxClamp?: number;
    compare: string;
    maxAnisotropy?: number;
}
interface GPUShaderModule {
    getCompilationInfo(): Promise<GPUCompilationInfo>;
}
interface GPUShaderModuleDescriptor {
    label?: string;
    code: string;
}
interface GPUPipelineLayout {
}
interface GPUPipelineLayoutDescriptor {
    label?: string;
    bindGroupLayouts: GPUBindGroupLayout[];
}
interface GPUComputePipeline {
    getBindGroupLayout(index: number): GPUBindGroupLayout;
}
interface GPUComputePipelineDescriptor {
    label?: string;
    compute: GPUProgrammableStage;
    layout: string | GPUPipelineLayout;
}
interface GPUProgrammableStage {
    module: GPUShaderModule;
    entryPoint: string;
    constants?: Record<string, number>;
}
interface GPUCommandEncoder {
    get label(): string;
    beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder;
    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
    copyBufferToBuffer(source: GPUBuffer, sourceOffset: number | bigint, destination: GPUBuffer, destinationOffset: number | bigint, size: number | bigint): void;
    finish(param0?: GPUCommandBufferDescriptor): GPUCommandBuffer;
    copyTextureToBuffer(source: GPUImageCopyTexture, destination: GPUImageCopyBuffer, copySize: Iterable<number> | GPUExtent3DDict): void;
    copyBufferToTexture(source: GPUImageCopyBuffer, destination: GPUImageCopyTexture, copySize: Iterable<number> | GPUExtent3DDict): void;
    copyTextureToTexture(source: GPUImageCopyTexture, destination: GPUImageCopyTexture, copySize: Iterable<number> | GPUExtent3DDict): void;
    clearBuffer(buffer: GPUBuffer, offset?: (number | bigint), size?: (number | bigint)): void;
}
interface GPUCommandEncoderDescriptor {
    label?: string;
}
interface GPUComputePassEncoder {
    setPipeline(pipeline: GPUComputePipeline): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Iterable<number>): void;
    dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void;
    end(): void;
}
interface GPUComputePassDescriptor {
    label?: string;
    timestampWrites?: GPUComputePassTimestampWrites;
}
interface GPUQuerySet {
}
interface GPUQuerySetDescriptor {
    label?: string;
}
interface GPUComputePassTimestampWrites {
    querySet: GPUQuerySet;
    beginningOfPassWriteIndex?: number;
    endOfPassWriteIndex?: number;
}
interface GPUCommandBufferDescriptor {
    label?: string;
}
interface GPUCommandBuffer {
}
interface GPUQueue {
    submit(commandBuffers: GPUCommandBuffer[]): void;
    writeBuffer(buffer: GPUBuffer, bufferOffset: number | bigint, data: ArrayBuffer | ArrayBufferView, dataOffset?: (number | bigint), size?: (number | bigint)): void;
}
declare abstract class GPUMapMode {
    static readonly READ: number;
    static readonly WRITE: number;
}
interface GPURequestAdapterOptions {
    powerPreference: string;
    forceFallbackAdapter?: boolean;
}
interface GPUAdapterInfo {
    get vendor(): string;
    get architecture(): string;
    get device(): string;
    get description(): string;
}
interface GPUSupportedFeatures {
    has(name: string): boolean;
    keys(): string[];
}
interface GPUSupportedLimits {
    get maxTextureDimension1D(): number;
    get maxTextureDimension2D(): number;
    get maxTextureDimension3D(): number;
    get maxTextureArrayLayers(): number;
    get maxBindGroups(): number;
    get maxBindingsPerBindGroup(): number;
    get maxDynamicUniformBuffersPerPipelineLayout(): number;
    get maxDynamicStorageBuffersPerPipelineLayout(): number;
    get maxSampledTexturesPerShaderStage(): number;
    get maxSamplersPerShaderStage(): number;
    get maxStorageBuffersPerShaderStage(): number;
    get maxStorageTexturesPerShaderStage(): number;
    get maxUniformBuffersPerShaderStage(): number;
    get maxUniformBufferBindingSize(): number | bigint;
    get maxStorageBufferBindingSize(): number | bigint;
    get minUniformBufferOffsetAlignment(): number;
    get minStorageBufferOffsetAlignment(): number;
    get maxVertexBuffers(): number;
    get maxBufferSize(): number | bigint;
    get maxVertexAttributes(): number;
    get maxVertexBufferArrayStride(): number;
    get maxInterStageShaderComponents(): number;
    get maxInterStageShaderVariables(): number;
    get maxColorAttachments(): number;
    get maxColorAttachmentBytesPerSample(): number;
    get maxComputeWorkgroupStorageSize(): number;
    get maxComputeInvocationsPerWorkgroup(): number;
    get maxComputeWorkgroupSizeX(): number;
    get maxComputeWorkgroupSizeY(): number;
    get maxComputeWorkgroupSizeZ(): number;
    get maxComputeWorkgroupsPerDimension(): number;
}
declare abstract class GPUError {
    get message(): string;
}
declare abstract class GPUOutOfMemoryError extends GPUError {
}
declare abstract class GPUInternalError extends GPUError {
}
declare abstract class GPUValidationError extends GPUError {
}
declare abstract class GPUDeviceLostInfo {
    get message(): string;
    get reason(): string;
}
interface GPUCompilationMessage {
    get message(): string;
    get type(): string;
    get lineNum(): number;
    get linePos(): number;
    get offset(): number;
    get length(): number;
}
interface GPUCompilationInfo {
    get messages(): GPUCompilationMessage[];
}
declare abstract class GPUTextureUsage {
    static readonly COPY_SRC: number;
    static readonly COPY_DST: number;
    static readonly TEXTURE_BINDING: number;
    static readonly STORAGE_BINDING: number;
    static readonly RENDER_ATTACHMENT: number;
}
interface GPUTextureDescriptor {
    label: string;
    size: number[] | GPUExtent3DDict;
    mipLevelCount?: number;
    sampleCount?: number;
    dimension?: string;
    format: string;
    usage: number;
    viewFormats?: string[];
}
interface GPUExtent3DDict {
    width: number;
    height?: number;
    depthOrArrayLayers?: number;
}
interface GPUTexture {
    createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
    destroy(): void;
    get width(): number;
    get height(): number;
    get depthOrArrayLayers(): number;
    get mipLevelCount(): number;
    get dimension(): string;
    get format(): string;
    get usage(): number;
}
interface GPUTextureView {
}
interface GPUTextureViewDescriptor {
    label: string;
    format: string;
    dimension: string;
    aspect?: string;
    baseMipLevel?: number;
    mipLevelCount: number;
    baseArrayLayer?: number;
    arrayLayerCount: number;
}
declare abstract class GPUColorWrite {
    static readonly RED: number;
    static readonly GREEN: number;
    static readonly BLUE: number;
    static readonly ALPHA: number;
    static readonly ALL: number;
}
interface GPURenderPipeline {
}
interface GPURenderPipelineDescriptor {
    label?: string;
    layout: string | GPUPipelineLayout;
    vertex: GPUVertexState;
    primitive?: GPUPrimitiveState;
    depthStencil?: GPUDepthStencilState;
    multisample?: GPUMultisampleState;
    fragment?: GPUFragmentState;
}
interface GPUVertexState {
    module: GPUShaderModule;
    entryPoint: string;
    constants?: Record<string, number>;
    buffers?: GPUVertexBufferLayout[];
}
interface GPUVertexBufferLayout {
    arrayStride: number | bigint;
    stepMode?: string;
    attributes: GPUVertexAttribute[];
}
interface GPUVertexAttribute {
    format: string;
    offset: number | bigint;
    shaderLocation: number;
}
interface GPUPrimitiveState {
    topology?: string;
    stripIndexFormat?: string;
    frontFace?: string;
    cullMode?: string;
    unclippedDepth?: boolean;
}
interface GPUStencilFaceState {
    compare?: string;
    failOp?: string;
    depthFailOp?: string;
    passOp?: string;
}
interface GPUDepthStencilState {
    format: string;
    depthWriteEnabled: boolean;
    depthCompare: string;
    stencilFront?: GPUStencilFaceState;
    stencilBack?: GPUStencilFaceState;
    stencilReadMask?: number;
    stencilWriteMask?: number;
    depthBias?: number;
    depthBiasSlopeScale?: number;
    depthBiasClamp?: number;
}
interface GPUMultisampleState {
    count?: number;
    mask?: number;
    alphaToCoverageEnabled?: boolean;
}
interface GPUFragmentState {
    module: GPUShaderModule;
    entryPoint: string;
    constants?: Record<string, number>;
    targets: GPUColorTargetState[];
}
interface GPUColorTargetState {
    format: string;
    blend: GPUBlendState;
    writeMask?: number;
}
interface GPUBlendState {
    color: GPUBlendComponent;
    alpha: GPUBlendComponent;
}
interface GPUBlendComponent {
    operation?: string;
    srcFactor?: string;
    dstFactor?: string;
}
interface GPURenderPassEncoder {
    setPipeline(pipeline: GPURenderPipeline): void;
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
    end(): void;
}
interface GPURenderPassDescriptor {
    label?: string;
    colorAttachments: GPURenderPassColorAttachment[];
    depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
    occlusionQuerySet?: GPUQuerySet;
    timestampWrites?: GPURenderPassTimestampWrites;
    maxDrawCount?: (number | bigint);
}
interface GPURenderPassColorAttachment {
    view: GPUTextureView;
    depthSlice?: number;
    resolveTarget?: GPUTextureView;
    clearValue?: (number[] | GPUColorDict);
    loadOp: string;
    storeOp: string;
}
interface GPUColorDict {
    r: number;
    g: number;
    b: number;
    a: number;
}
interface GPURenderPassDepthStencilAttachment {
    view: GPUTextureView;
    depthClearValue?: number;
    depthLoadOp?: string;
    depthStoreOp?: string;
    depthReadOnly?: boolean;
    stencilClearValue?: number;
    stencilLoadOp?: string;
    stencilStoreOp?: string;
    stencilReadOnly?: boolean;
}
interface GPURenderPassTimestampWrites {
    querySet: GPUQuerySet;
    beginningOfPassWriteIndex?: number;
    endOfPassWriteIndex?: number;
}
interface GPUImageCopyTexture {
    texture: GPUTexture;
    mipLevel?: number;
    origin?: (number[] | GPUOrigin3DDict);
    aspect?: string;
}
interface GPUImageCopyBuffer {
    buffer: GPUBuffer;
    offset?: (number | bigint);
    bytesPerRow?: number;
    rowsPerImage?: number;
}
interface GPUOrigin3DDict {
    x?: number;
    y?: number;
    z?: number;
}
/* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource) */
declare class EventSource extends EventTarget {
    constructor(url: string, init?: EventSourceEventSourceInit);
    /**
     * Aborts any instances of the fetch algorithm started for this EventSource object, and sets the readyState attribute to CLOSED.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/close)
     */
    close(): void;
    /**
     * Returns the URL providing the event stream.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/url)
     */
    get url(): string;
    /**
     * Returns true if the credentials mode for connection requests to the URL providing the event stream is set to "include", and false otherwise.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/withCredentials)
     */
    get withCredentials(): boolean;
    /**
     * Returns the state of this EventSource object's connection. It can have the values described below.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/readyState)
     */
    get readyState(): number;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/open_event) */
    get onopen(): any | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/open_event) */
    set onopen(value: any | null);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/message_event) */
    get onmessage(): any | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/message_event) */
    set onmessage(value: any | null);
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/error_event) */
    get onerror(): any | null;
    /* [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventSource/error_event) */
    set onerror(value: any | null);
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSED: number;
    static from(stream: ReadableStream): EventSource;
}
interface EventSourceEventSourceInit {
    withCredentials?: boolean;
    fetcher?: Fetcher;
}
interface Container {
    get running(): boolean;
    start(options?: ContainerStartupOptions): void;
    monitor(): Promise<void>;
    destroy(error?: any): Promise<void>;
    signal(signo: number): void;
    getTcpPort(port: number): Fetcher;
}
interface ContainerStartupOptions {
    entrypoint?: string[];
    enableInternet: boolean;
    env?: Record<string, string>;
}
type AiImageClassificationInput = {
    image: number[];
};
type AiImageClassificationOutput = {
    score?: number;
    label?: string;
}[];
declare abstract class BaseAiImageClassification {
    inputs: AiImageClassificationInput;
    postProcessedOutputs: AiImageClassificationOutput;
}
type AiImageToTextInput = {
    image: number[];
    prompt?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    seed?: number;
    repetition_penalty?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    raw?: boolean;
    messages?: RoleScopedChatInput[];
};
type AiImageToTextOutput = {
    description: string;
};
declare abstract class BaseAiImageToText {
    inputs: AiImageToTextInput;
    postProcessedOutputs: AiImageToTextOutput;
}
type AiObjectDetectionInput = {
    image: number[];
};
type AiObjectDetectionOutput = {
    score?: number;
    label?: string;
}[];
declare abstract class BaseAiObjectDetection {
    inputs: AiObjectDetectionInput;
    postProcessedOutputs: AiObjectDetectionOutput;
}
type AiSentenceSimilarityInput = {
    source: string;
    sentences: string[];
};
type AiSentenceSimilarityOutput = number[];
declare abstract class BaseAiSentenceSimilarity {
    inputs: AiSentenceSimilarityInput;
    postProcessedOutputs: AiSentenceSimilarityOutput;
}
type AiAutomaticSpeechRecognitionInput = {
    audio: number[];
};
type AiAutomaticSpeechRecognitionOutput = {
    text?: string;
    words?: {
        word: string;
        start: number;
        end: number;
    }[];
    vtt?: string;
};
declare abstract class BaseAiAutomaticSpeechRecognition {
    inputs: AiAutomaticSpeechRecognitionInput;
    postProcessedOutputs: AiAutomaticSpeechRecognitionOutput;
}
type AiSummarizationInput = {
    input_text: string;
    max_length?: number;
};
type AiSummarizationOutput = {
    summary: string;
};
declare abstract class BaseAiSummarization {
    inputs: AiSummarizationInput;
    postProcessedOutputs: AiSummarizationOutput;
}
type AiTextClassificationInput = {
    text: string;
};
type AiTextClassificationOutput = {
    score?: number;
    label?: string;
}[];
declare abstract class BaseAiTextClassification {
    inputs: AiTextClassificationInput;
    postProcessedOutputs: AiTextClassificationOutput;
}
type AiTextEmbeddingsInput = {
    text: string | string[];
};
type AiTextEmbeddingsOutput = {
    shape: number[];
    data: number[][];
};
declare abstract class BaseAiTextEmbeddings {
    inputs: AiTextEmbeddingsInput;
    postProcessedOutputs: AiTextEmbeddingsOutput;
}
type RoleScopedChatInput = {
    role: "user" | "assistant" | "system" | "tool" | (string & NonNullable<unknown>);
    content: string;
    name?: string;
};
type AiTextGenerationToolLegacyInput = {
    name: string;
    description: string;
    parameters?: {
        type: "object" | (string & NonNullable<unknown>);
        properties: {
            [key: string]: {
                type: string;
                description?: string;
            };
        };
        required: string[];
    };
};
type AiTextGenerationToolInput = {
    type: "function" | (string & NonNullable<unknown>);
    function: {
        name: string;
        description: string;
        parameters?: {
            type: "object" | (string & NonNullable<unknown>);
            properties: {
                [key: string]: {
                    type: string;
                    description?: string;
                };
            };
            required: string[];
        };
    };
};
type AiTextGenerationFunctionsInput = {
    name: string;
    code: string;
};
type AiTextGenerationResponseFormat = {
    type: string;
    json_schema?: any;
};
type AiTextGenerationInput = {
    prompt?: string;
    raw?: boolean;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    seed?: number;
    repetition_penalty?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    messages?: RoleScopedChatInput[];
    response_format?: AiTextGenerationResponseFormat;
    tools?: AiTextGenerationToolInput[] | AiTextGenerationToolLegacyInput[] | (object & NonNullable<unknown>);
    functions?: AiTextGenerationFunctionsInput[];
};
type AiTextGenerationOutput = {
    response?: string;
    tool_calls?: {
        name: string;
        arguments: unknown;
    }[];
} | ReadableStream;
declare abstract class BaseAiTextGeneration {
    inputs: AiTextGenerationInput;
    postProcessedOutputs: AiTextGenerationOutput;
}
type AiTextToSpeechInput = {
    prompt: string;
    lang?: string;
};
type AiTextToSpeechOutput = Uint8Array | {
    audio: string;
};
declare abstract class BaseAiTextToSpeech {
    inputs: AiTextToSpeechInput;
    postProcessedOutputs: AiTextToSpeechOutput;
}
type AiTextToImageInput = {
    prompt: string;
    negative_prompt?: string;
    height?: number;
    width?: number;
    image?: number[];
    image_b64?: string;
    mask?: number[];
    num_steps?: number;
    strength?: number;
    guidance?: number;
    seed?: number;
};
type AiTextToImageOutput = ReadableStream<Uint8Array>;
declare abstract class BaseAiTextToImage {
    inputs: AiTextToImageInput;
    postProcessedOutputs: AiTextToImageOutput;
}
type AiTranslationInput = {
    text: string;
    target_lang: string;
    source_lang?: string;
};
type AiTranslationOutput = {
    translated_text?: string;
};
declare abstract class BaseAiTranslation {
    inputs: AiTranslationInput;
    postProcessedOutputs: AiTranslationOutput;
}
type Ai_Cf_Openai_Whisper_Input = string | {
    /**
     * An array of integers that represent the audio data constrained to 8-bit unsigned integer values
     */
    audio: number[];
};
interface Ai_Cf_Openai_Whisper_Output {
    /**
     * The transcription
     */
    text: string;
    word_count?: number;
    words?: {
        word?: string;
        /**
         * The second this word begins in the recording
         */
        start?: number;
        /**
         * The ending second when the word completes
         */
        end?: number;
    }[];
    vtt?: string;
}
declare abstract class Base_Ai_Cf_Openai_Whisper {
    inputs: Ai_Cf_Openai_Whisper_Input;
    postProcessedOutputs: Ai_Cf_Openai_Whisper_Output;
}
type Ai_Cf_Unum_Uform_Gen2_Qwen_500M_Input = string | {
    /**
     * The input text prompt for the model to generate a response.
     */
    prompt?: string;
    /**
     * If true, a chat template is not applied and you must adhere to the specific model's expected formatting.
     */
    raw?: boolean;
    /**
     * Controls the creativity of the AI's responses by adjusting how many possible words it considers. Lower values make outputs more predictable; higher values allow for more varied and creative responses.
     */
    top_p?: number;
    /**
     * Limits the AI to choose from the top 'k' most probable words. Lower values make responses more focused; higher values introduce more variety and potential surprises.
     */
    top_k?: number;
    /**
     * Random seed for reproducibility of the generation.
     */
    seed?: number;
    /**
     * Penalty for repeated tokens; higher values discourage repetition.
     */
    repetition_penalty?: number;
    /**
     * Decreases the likelihood of the model repeating the same lines verbatim.
     */
    frequency_penalty?: number;
    /**
     * Increases the likelihood of the model introducing new topics.
     */
    presence_penalty?: number;
    image: number[] | (string & NonNullable<unknown>);
    /**
     * The maximum number of tokens to generate in the response.
     */
    max_tokens?: number;
};
interface Ai_Cf_Unum_Uform_Gen2_Qwen_500M_Output {
    description?: string;
}
declare abstract class Base_Ai_Cf_Unum_Uform_Gen2_Qwen_500M {
    inputs: Ai_Cf_Unum_Uform_Gen2_Qwen_500M_Input;
    postProcessedOutputs: Ai_Cf_Unum_Uform_Gen2_Qwen_500M_Output;
}
type Ai_Cf_Openai_Whisper_Tiny_En_Input = string | {
    /**
     * An array of integers that represent the audio data constrained to 8-bit unsigned integer values
     */
    audio: number[];
};
interface Ai_Cf_Openai_Whisper_Tiny_En_Output {
    /**
     * The transcription
     */
    text: string;
    word_count?: number;
    words?: {
        word?: string;
        /**
         * The second this word begins in the recording
         */
        start?: number;
        /**
         * The ending second when the word completes
         */
        end?: number;
    }[];
    vtt?: string;
}
declare abstract class Base_Ai_Cf_Openai_Whisper_Tiny_En {
    inputs: Ai_Cf_Openai_Whisper_Tiny_En_Input;
    postProcessedOutputs: Ai_Cf_Openai_Whisper_Tiny_En_Output;
}
interface Ai_Cf_Openai_Whisper_Large_V3_Turbo_Input {
    /**
     * Base64 encoded value of the audio data.
     */
    audio: string;
    /**
     * Supported tasks are 'translate' or 'transcribe'.
     */
    task?: string;
    /**
     * The language of the audio being transcribed or translated.
     */
    language?: string;
    /**
     * Preprocess the audio with a voice activity detection model.
     */
    vad_filter?: string;
    /**
     * A text prompt to help provide context to the model on the contents of the audio.
     */
    initial_prompt?: string;
    /**
     * The prefix it appended the the beginning of the output of the transcription and can guide the transcription result.
     */
    prefix?: string;
}
interface Ai_Cf_Openai_Whisper_Large_V3_Turbo_Output {
    transcription_info?: {
        /**
         * The language of the audio being transcribed or translated.
         */
        language?: string;
        /**
         * The confidence level or probability of the detected language being accurate, represented as a decimal between 0 and 1.
         */
        language_probability?: number;
        /**
         * The total duration of the original audio file, in seconds.
         */
        duration?: number;
        /**
         * The duration of the audio after applying Voice Activity Detection (VAD) to remove silent or irrelevant sections, in seconds.
         */
        duration_after_vad?: number;
    };
    /**
     * The complete transcription of the audio.
     */
    text: string;
    /**
     * The total number of words in the transcription.
     */
    word_count?: number;
    segments?: {
        /**
         * The starting time of the segment within the audio, in seconds.
         */
        start?: number;
        /**
         * The ending time of the segment within the audio, in seconds.
         */
        end?: number;
        /**
         * The transcription of the segment.
         */
        text?: string;
        /**
         * The temperature used in the decoding process, controlling randomness in predictions. Lower values result in more deterministic outputs.
         */
        temperature?: number;
        /**
         * The average log probability of the predictions for the words in this segment, indicating overall confidence.
         */
        avg_logprob?: number;
        /**
         * The compression ratio of the input to the output, measuring how much the text was compressed during the transcription process.
         */
        compression_ratio?: number;
        /**
         * The probability that the segment contains no speech, represented as a decimal between 0 and 1.
         */
        no_speech_prob?: number;
        words?: {
            /**
             * The individual word transcribed from the audio.
             */
            word?: string;
            /**
             * The starting time of the word within the audio, in seconds.
             */
            start?: number;
            /**
             * The ending time of the word within the audio, in seconds.
             */
            end?: number;
        }[];
    }[];
    /**
     * The transcription in WebVTT format, which includes timing and text information for use in subtitles.
     */
    vtt?: string;
}
declare abstract class Base_Ai_Cf_Openai_Whisper_Large_V3_Turbo {
    inputs: Ai_Cf_Openai_Whisper_Large_V3_Turbo_Input;
    postProcessedOutputs: Ai_Cf_Openai_Whisper_Large_V3_Turbo_Output;
}
interface Ai_Cf_Black_Forest_Labs_Flux_1_Schnell_Input {
    /**
     * A text description of the image you want to generate.
     */
    prompt: string;
    /**
     * The number of diffusion steps; higher values can improve quality but take longer.
     */
    steps?: number;
}
interface Ai_Cf_Black_Forest_Labs_Flux_1_Schnell_Output {
    /**
     * The generated image in Base64 format.
     */
    image?: string;
}
declare abstract class Base_Ai_Cf_Black_Forest_Labs_Flux_1_Schnell {
    inputs: Ai_Cf_Black_Forest_Labs_Flux_1_Schnell_Input;
    postProcessedOutputs: Ai_Cf_Black_Forest_Labs_Flux_1_Schnell_Output;
}
type Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct_Input = Prompt | Messages;
interface Prompt {
    /**
     * The input text prompt for the model to generate a response.
     */
    prompt: string;
    image?: number[] | (string & NonNullable<unknown>);
    /**
     * If true, a chat template is not applied and you must adhere to the specific model's expected formatting.
     */
    raw?: boolean;
    /**
     * If true, the response will be streamed back incrementally using SSE, Server Sent Events.
     */
    stream?: boolean;
    /**
     * The maximum number of tokens to generate in the response.
     */
    max_tokens?: number;
    /**
     * Controls the randomness of the output; higher values produce more random results.
     */
    temperature?: number;
    /**
     * Adjusts the creativity of the AI's responses by controlling how many possible words it considers. Lower values make outputs more predictable; higher values allow for more varied and creative responses.
     */
    top_p?: number;
    /**
     * Limits the AI to choose from the top 'k' most probable words. Lower values make responses more focused; higher values introduce more variety and potential surprises.
     */
    top_k?: number;
    /**
     * Random seed for reproducibility of the generation.
     */
    seed?: number;
    /**
     * Penalty for repeated tokens; higher values discourage repetition.
     */
    repetition_penalty?: number;
    /**
     * Decreases the likelihood of the model repeating the same lines verbatim.
     */
    frequency_penalty?: number;
    /**
     * Increases the likelihood of the model introducing new topics.
     */
    presence_penalty?: number;
    /**
     * Name of the LoRA (Low-Rank Adaptation) model to fine-tune the base model.
     */
    lora?: string;
}
interface Messages {
    /**
     * An array of message objects representing the conversation history.
     */
    messages: {
        /**
         * The role of the message sender (e.g., 'user', 'assistant', 'system', 'tool').
         */
        role: string;
        /**
         * The content of the message as a string.
         */
        content: string;
    }[];
    image?: number[] | string;
    functions?: {
        name: string;
        code: string;
    }[];
    /**
     * A list of tools available for the assistant to use.
     */
    tools?: ({
        /**
         * The name of the tool. More descriptive the better.
         */
        name: string;
        /**
         * A brief description of what the tool does.
         */
        description: string;
        /**
         * Schema defining the parameters accepted by the tool.
         */
        parameters: {
            /**
             * The type of the parameters object (usually 'object').
             */
            type: string;
            /**
             * List of required parameter names.
             */
            required?: string[];
            /**
             * Definitions of each parameter.
             */
            properties: {
                [k: string]: {
                    /**
                     * The data type of the parameter.
                     */
                    type: string;
                    /**
                     * A description of the expected parameter.
                     */
                    description: string;
                };
            };
        };
    } | {
        /**
         * Specifies the type of tool (e.g., 'function').
         */
        type: string;
        /**
         * Details of the function tool.
         */
        function: {
            /**
             * The name of the function.
             */
            name: string;
            /**
             * A brief description of what the function does.
             */
            description: string;
            /**
             * Schema defining the parameters accepted by the function.
             */
            parameters: {
                /**
                 * The type of the parameters object (usually 'object').
                 */
                type: string;
                /**
                 * List of required parameter names.
                 */
                required?: string[];
                /**
                 * Definitions of each parameter.
                 */
                properties: {
                    [k: string]: {
                        /**
                         * The data type of the parameter.
                         */
                        type: string;
                        /**
                         * A description of the expected parameter.
                         */
                        description: string;
                    };
                };
            };
        };
    })[];
    /**
     * If true, the response will be streamed back incrementally.
     */
    stream?: boolean;
    /**
     * The maximum number of tokens to generate in the response.
     */
    max_tokens?: number;
    /**
     * Controls the randomness of the output; higher values produce more random results.
     */
    temperature?: number;
    /**
     * Controls the creativity of the AI's responses by adjusting how many possible words it considers. Lower values make outputs more predictable; higher values allow for more varied and creative responses.
     */
    top_p?: number;
    /**
     * Limits the AI to choose from the top 'k' most probable words. Lower values make responses more focused; higher values introduce more variety and potential surprises.
     */
    top_k?: number;
    /**
     * Random seed for reproducibility of the generation.
     */
    seed?: number;
    /**
     * Penalty for repeated tokens; higher values discourage repetition.
     */
    repetition_penalty?: number;
    /**
     * Decreases the likelihood of the model repeating the same lines verbatim.
     */
    frequency_penalty?: number;
    /**
     * Increases the likelihood of the model introducing new topics.
     */
    presence_penalty?: number;
}
type Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct_Output = {
    /**
     * The generated text response from the model
     */
    response?: string;
    /**
     * An array of tool calls requests made during the response generation
     */
    tool_calls?: {
        /**
         * The arguments passed to be passed to the tool call request
         */
        arguments?: object;
        /**
         * The name of the tool to be called
         */
        name?: string;
    }[];
} | ReadableStream;
declare abstract class Base_Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct {
    inputs: Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct_Input;
    postProcessedOutputs: Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct_Output;
}
interface Ai_Cf_Meta_Llama_Guard_3_8B_Input {
    /**
     * An array of message objects representing the conversation history.
     */
    messages: {
        /**
         * The role of the message sender must alternate between 'user' and 'assistant'.
         */
        role: "user" | "assistant";
        /**
         * The content of the message as a string.
         */
        content: string;
    }[];
    /**
     * The maximum number of tokens to generate in the response.
     */
    max_tokens?: number;
    /**
     * Controls the randomness of the output; higher values produce more random results.
     */
    temperature?: number;
    /**
     * Dictate the output format of the generated response.
     */
    response_format?: {
        /**
         * Set to json_object to process and output generated text as JSON.
         */
        type?: string;
    };
}
interface Ai_Cf_Meta_Llama_Guard_3_8B_Output {
    response?: string | {
        /**
         * Whether the conversation is safe or not.
         */
        safe?: boolean;
        /**
         * A list of what hazard categories predicted for the conversation, if the conversation is deemed unsafe.
         */
        categories?: string[];
    };
    /**
     * Usage statistics for the inference request
     */
    usage?: {
        /**
         * Total number of tokens in input
         */
        prompt_tokens?: number;
        /**
         * Total number of tokens in output
         */
        completion_tokens?: number;
        /**
         * Total number of input and output tokens
         */
        total_tokens?: number;
    };
}
declare abstract class Base_Ai_Cf_Meta_Llama_Guard_3_8B {
    inputs: Ai_Cf_Meta_Llama_Guard_3_8B_Input;
    postProcessedOutputs: Ai_Cf_Meta_Llama_Guard_3_8B_Output;
}
interface AiModels {
    "@cf/huggingface/distilbert-sst-2-int8": BaseAiTextClassification;
    "@cf/stabilityai/stable-diffusion-xl-base-1.0": BaseAiTextToImage;
    "@cf/runwayml/stable-diffusion-v1-5-inpainting": BaseAiTextToImage;
    "@cf/runwayml/stable-diffusion-v1-5-img2img": BaseAiTextToImage;
    "@cf/lykon/dreamshaper-8-lcm": BaseAiTextToImage;
    "@cf/bytedance/stable-diffusion-xl-lightning": BaseAiTextToImage;
    "@cf/baai/bge-base-en-v1.5": BaseAiTextEmbeddings;
    "@cf/baai/bge-small-en-v1.5": BaseAiTextEmbeddings;
    "@cf/baai/bge-large-en-v1.5": BaseAiTextEmbeddings;
    "@cf/microsoft/resnet-50": BaseAiImageClassification;
    "@cf/facebook/detr-resnet-50": BaseAiObjectDetection;
    "@cf/meta/llama-2-7b-chat-int8": BaseAiTextGeneration;
    "@cf/mistral/mistral-7b-instruct-v0.1": BaseAiTextGeneration;
    "@cf/meta/llama-2-7b-chat-fp16": BaseAiTextGeneration;
    "@hf/thebloke/llama-2-13b-chat-awq": BaseAiTextGeneration;
    "@hf/thebloke/mistral-7b-instruct-v0.1-awq": BaseAiTextGeneration;
    "@hf/thebloke/zephyr-7b-beta-awq": BaseAiTextGeneration;
    "@hf/thebloke/openhermes-2.5-mistral-7b-awq": BaseAiTextGeneration;
    "@hf/thebloke/neural-chat-7b-v3-1-awq": BaseAiTextGeneration;
    "@hf/thebloke/llamaguard-7b-awq": BaseAiTextGeneration;
    "@hf/thebloke/deepseek-coder-6.7b-base-awq": BaseAiTextGeneration;
    "@hf/thebloke/deepseek-coder-6.7b-instruct-awq": BaseAiTextGeneration;
    "@cf/deepseek-ai/deepseek-math-7b-instruct": BaseAiTextGeneration;
    "@cf/defog/sqlcoder-7b-2": BaseAiTextGeneration;
    "@cf/openchat/openchat-3.5-0106": BaseAiTextGeneration;
    "@cf/tiiuae/falcon-7b-instruct": BaseAiTextGeneration;
    "@cf/thebloke/discolm-german-7b-v1-awq": BaseAiTextGeneration;
    "@cf/qwen/qwen1.5-0.5b-chat": BaseAiTextGeneration;
    "@cf/qwen/qwen1.5-7b-chat-awq": BaseAiTextGeneration;
    "@cf/qwen/qwen1.5-14b-chat-awq": BaseAiTextGeneration;
    "@cf/tinyllama/tinyllama-1.1b-chat-v1.0": BaseAiTextGeneration;
    "@cf/microsoft/phi-2": BaseAiTextGeneration;
    "@cf/qwen/qwen1.5-1.8b-chat": BaseAiTextGeneration;
    "@cf/mistral/mistral-7b-instruct-v0.2-lora": BaseAiTextGeneration;
    "@hf/nousresearch/hermes-2-pro-mistral-7b": BaseAiTextGeneration;
    "@hf/nexusflow/starling-lm-7b-beta": BaseAiTextGeneration;
    "@hf/google/gemma-7b-it": BaseAiTextGeneration;
    "@cf/meta-llama/llama-2-7b-chat-hf-lora": BaseAiTextGeneration;
    "@cf/google/gemma-2b-it-lora": BaseAiTextGeneration;
    "@cf/google/gemma-7b-it-lora": BaseAiTextGeneration;
    "@hf/mistral/mistral-7b-instruct-v0.2": BaseAiTextGeneration;
    "@cf/meta/llama-3-8b-instruct": BaseAiTextGeneration;
    "@cf/fblgit/una-cybertron-7b-v2-bf16": BaseAiTextGeneration;
    "@cf/meta/llama-3-8b-instruct-awq": BaseAiTextGeneration;
    "@hf/meta-llama/meta-llama-3-8b-instruct": BaseAiTextGeneration;
    "@cf/meta/llama-3.1-8b-instruct": BaseAiTextGeneration;
    "@cf/meta/llama-3.1-8b-instruct-fp8": BaseAiTextGeneration;
    "@cf/meta/llama-3.1-8b-instruct-awq": BaseAiTextGeneration;
    "@cf/meta/llama-3.2-3b-instruct": BaseAiTextGeneration;
    "@cf/meta/llama-3.2-1b-instruct": BaseAiTextGeneration;
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast": BaseAiTextGeneration;
    "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b": BaseAiTextGeneration;
    "@cf/meta/m2m100-1.2b": BaseAiTranslation;
    "@cf/facebook/bart-large-cnn": BaseAiSummarization;
    "@cf/llava-hf/llava-1.5-7b-hf": BaseAiImageToText;
    "@cf/openai/whisper": Base_Ai_Cf_Openai_Whisper;
    "@cf/unum/uform-gen2-qwen-500m": Base_Ai_Cf_Unum_Uform_Gen2_Qwen_500M;
    "@cf/openai/whisper-tiny-en": Base_Ai_Cf_Openai_Whisper_Tiny_En;
    "@cf/openai/whisper-large-v3-turbo": Base_Ai_Cf_Openai_Whisper_Large_V3_Turbo;
    "@cf/black-forest-labs/flux-1-schnell": Base_Ai_Cf_Black_Forest_Labs_Flux_1_Schnell;
    "@cf/meta/llama-3.2-11b-vision-instruct": Base_Ai_Cf_Meta_Llama_3_2_11B_Vision_Instruct;
    "@cf/meta/llama-guard-3-8b": Base_Ai_Cf_Meta_Llama_Guard_3_8B;
}
type AiOptions = {
    gateway?: GatewayOptions;
    returnRawResponse?: boolean;
    prefix?: string;
    extraHeaders?: object;
};
type ConversionResponse = {
    name: string;
    mimeType: string;
    format: "markdown";
    tokens: number;
    data: string;
};
type AiModelsSearchParams = {
    author?: string;
    hide_experimental?: boolean;
    page?: number;
    per_page?: number;
    search?: string;
    source?: number;
    task?: string;
};
type AiModelsSearchObject = {
    id: string;
    source: number;
    name: string;
    description: string;
    task: {
        id: string;
        name: string;
        description: string;
    };
    tags: string[];
    properties: {
        property_id: string;
        value: string;
    }[];
};
interface InferenceUpstreamError extends Error {
}
interface AiInternalError extends Error {
}
type AiModelListType = Record<string, any>;
declare abstract class Ai<AiModelList extends AiModelListType = AiModels> {
    aiGatewayLogId: string | null;
    gateway(gatewayId: string): AiGateway;
    autorag(autoragId: string): AutoRAG;
    run<Name extends keyof AiModelList, Options extends AiOptions>(model: Name, inputs: AiModelList[Name]["inputs"], options?: Options): Promise<Options extends {
        returnRawResponse: true;
    } ? Response : AiModelList[Name]["postProcessedOutputs"]>;
    public models(params?: AiModelsSearchParams): Promise<AiModelsSearchObject[]>;
    public toMarkdown(files: {
        name: string;
        blob: Blob;
    }[], options?: {
        gateway?: GatewayOptions;
        extraHeaders?: object;
    }): Promise<ConversionResponse[]>;
    public toMarkdown(files: {
        name: string;
        blob: Blob;
    }, options?: {
        gateway?: GatewayOptions;
        extraHeaders?: object;
    }): Promise<ConversionResponse>;
}
type GatewayOptions = {
    id: string;
    cacheKey?: string;
    cacheTtl?: number;
    skipCache?: boolean;
    metadata?: Record<string, number | string | boolean | null | bigint>;
    collectLog?: boolean;
};
type AiGatewayPatchLog = {
    score?: number | null;
    feedback?: -1 | 1 | null;
    metadata?: Record<string, number | string | boolean | null | bigint> | null;
};
type AiGatewayLog = {
    id: string;
    provider: string;
    model: string;
    model_type?: string;
    path: string;
    duration: number;
    request_type?: string;
    request_content_type?: string;
    status_code: number;
    response_content_type?: string;
    success: boolean;
    cached: boolean;
    tokens_in?: number;
    tokens_out?: number;
    metadata?: Record<string, number | string | boolean | null | bigint>;
    step?: number;
    cost?: number;
    custom_cost?: boolean;
    request_size: number;
    request_head?: string;
    request_head_complete: boolean;
    response_size: number;
    response_head?: string;
    response_head_complete: boolean;
    created_at: Date;
};
type AIGatewayProviders = "workers-ai" | "anthropic" | "aws-bedrock" | "azure-openai" | "google-vertex-ai" | "huggingface" | "openai" | "perplexity-ai" | "replicate" | "groq" | "cohere" | "google-ai-studio" | "mistral" | "grok" | "openrouter" | "deepseek" | "cerebras" | "cartesia" | "elevenlabs" | "adobe-firefly";
type AIGatewayHeaders = {
    "cf-aig-metadata": Record<string, number | string | boolean | null | bigint> | string;
    "cf-aig-custom-cost": {
        per_token_in?: number;
        per_token_out?: number;
    } | {
        total_cost?: number;
    } | string;
    "cf-aig-cache-ttl": number | string;
    "cf-aig-skip-cache": boolean | string;
    "cf-aig-cache-key": string;
    "cf-aig-collect-log": boolean | string;
    Authorization: string;
    "Content-Type": string;
    [key: string]: string | number | boolean | object;
};
type AIGatewayUniversalRequest = {
    provider: AIGatewayProviders | string; // eslint-disable-line
    endpoint: string;
    headers: Partial<AIGatewayHeaders>;
    query: unknown;
};
interface AiGatewayInternalError extends Error {
}
interface AiGatewayLogNotFound extends Error {
}
declare abstract class AiGateway {
    patchLog(logId: string, data: AiGatewayPatchLog): Promise<void>;
    getLog(logId: string): Promise<AiGatewayLog>;
    run(data: AIGatewayUniversalRequest | AIGatewayUniversalRequest[]): Promise<Response>;
    getUrl(provider?: AIGatewayProviders | string): Promise<string>; // eslint-disable-line
}
interface AutoRAGInternalError extends Error {
}
interface AutoRAGNotFoundError extends Error {
}
interface AutoRAGUnauthorizedError extends Error {
}
type AutoRagSearchRequest = {
    query: string;
    max_num_results?: number;
    ranking_options?: {
        ranker?: string;
        score_threshold?: number;
    };
    rewrite_query?: boolean;
};
type AutoRagSearchResponse = {
    object: "vector_store.search_results.page";
    search_query: string;
    data: {
        file_id: string;
        filename: string;
        score: number;
        attributes: Record<string, string | number | boolean | null>;
        content: {
            type: "text";
            text: string;
        }[];
    }[];
    has_more: boolean;
    next_page: string | null;
};
type AutoRagAiSearchResponse = AutoRagSearchR