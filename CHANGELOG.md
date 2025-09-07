# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-07

### Added
- Initial release of Grok CLI
- Fork of Google's gemini-cli adapted for xAI's Grok API
- Support for Grok-4 model via OpenAI-compatible API
- Function calling for structured JSON output
- Simplified authentication using XAI_API_KEY
- All original gemini-cli features including:
  - Interactive chat interface
  - File operations and code editing
  - Web search and browsing
  - MCP (Model Context Protocol) support
  - Customizable themes

### Changed
- Renamed all gemini references to grok
- Updated branding and ASCII art
- Simplified authentication to API key only
- Hardcoded model to grok-4
- Removed OAuth and Google authentication methods
- Disabled auto-update functionality

### Fixed
- JSON parsing issues with OpenAI-compatible responses
- TypeScript compilation errors for tool calls

### Technical
- Implemented GrokAdapter for API translation
- Uses function calling for JSON schema responses
- Compatible with side-by-side gemini-cli installation