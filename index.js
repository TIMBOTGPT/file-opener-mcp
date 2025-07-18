#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

class FileOpenerServer {
  constructor() {
    this.server = new Server(
      {
        name: 'file-opener-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'open_file',
          description: 'Open a file or directory using the system default application (macOS open command)',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Full path to the file or directory to open',
              },
              application: {
                type: 'string',
                description: 'Optional: specific application to open the file with (e.g., "Preview", "TextEdit")',
                optional: true,
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'reveal_in_finder',
          description: 'Reveal a file or directory in Finder',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Full path to the file or directory to reveal in Finder',
              },
            },
            required: ['path'],
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'open_file') {
          return await this.openFile(args.path, args.application);
        } else if (name === 'reveal_in_finder') {
          return await this.revealInFinder(args.path);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async openFile(filePath, application = null) {
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`File or directory does not exist: ${filePath}`);
    }

    try {
      let command = ['open'];
      
      if (application) {
        command.push('-a', application);
      }
      
      command.push(filePath);

      const process = spawn(command[0], command.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve, reject) => {
        process.on('close', (code) => {
          if (code === 0) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Successfully opened: ${filePath}${application ? ` with ${application}` : ''}`,
                },
              ],
            });
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
          }
        });

        process.on('error', (error) => {
          reject(new Error(`Failed to execute command: ${error.message}`));
        });
      });

    } catch (error) {
      throw new Error(`Failed to open file: ${error.message}`);
    }
  }

  async revealInFinder(filePath) {
    if (!existsSync(filePath)) {
      throw new Error(`File or directory does not exist: ${filePath}`);
    }

    try {
      const process = spawn('open', ['-R', filePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      return new Promise((resolve, reject) => {
        process.on('close', (code) => {
          if (code === 0) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `Successfully revealed in Finder: ${filePath}`,
                },
              ],
            });
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          }
        });

        process.on('error', (error) => {
          reject(new Error(`Failed to execute command: ${error.message}`));
        });
      });

    } catch (error) {
      throw new Error(`Failed to reveal in Finder: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('File Opener MCP server running on stdio');
  }
}

const server = new FileOpenerServer();
server.run().catch(console.error);
