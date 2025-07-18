# File Opener MCP Server

A Model Context Protocol (MCP) server that provides file opening capabilities for Claude AI.

## Features

- **open_file**: Open any file or directory with the system's default application
- **reveal_in_finder**: Reveal a file or directory in macOS Finder  
- Optional application specification (e.g., open with Preview, TextEdit, etc.)
- Cross-platform support (primarily macOS focused)
- Full error handling and validation

## Installation

### Quick Install
```bash
npm install -g file-opener-mcp
```

### From Source
1. Clone the repository:
   ```bash
   git clone https://github.com/richardmarkmurphy/file-opener-mcp.git
   cd file-opener-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Test the server:
   ```bash
   npm start
   ```

## Usage with Claude Desktop

Add this server to your Claude Desktop MCP configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "file-opener": {
      "command": "npx",
      "args": ["-y", "file-opener-mcp"],
      "description": "Open files with system applications"
    }
  }
}
```

Or if installed locally:
```json
{
  "mcpServers": {
    "file-opener": {
      "command": "node",
      "args": ["/path/to/file-opener-mcp/index.js"],
      "description": "Open files with system applications"
    }
  }
}
```

## Available Tools

### open_file
Opens a file or directory with the system's default application, or optionally with a specified application.

**Parameters:**
- `path` (required): Full path to the file or directory
- `application` (optional): Specific application to use (e.g., "Preview", "TextEdit")

**Example:**
```json
{
  "name": "open_file",
  "arguments": {
    "path": "/Users/mark/Documents/report.pdf",
    "application": "Preview"
  }
}
```

### reveal_in_finder
Reveals a file or directory in macOS Finder.

**Parameters:**
- `path` (required): Full path to the file or directory

**Example:**
```json
{
  "name": "reveal_in_finder",
  "arguments": {
    "path": "/Users/mark/Documents/report.pdf"
  }
}
```

## Requirements

- macOS (uses `open` command)
- Node.js 16+
- Claude Desktop with MCP support

## Security

- File existence is validated before opening
- Only executes safe system `open` commands
- Proper error handling and reporting
- No network access required

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/richardmarkmurphy/file-opener-mcp/issues) page.
