# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TypingMind Plugin** that integrates DuckDuckGo web search capabilities. It allows users to perform web searches directly from their TypingMind chat interface, with results including definitions, related topics, and search results all formatted in Markdown.

## Repository Structure

- **plugin.json**: Plugin metadata and configuration, including:
  - OpenAI spec for function calling integration
  - HTTP action configuration for the DuckDuckGo API
  - Result transformation using Handlebars templates
  - No user settings required (public API)
- **implementation.js**: JavaScript runtime that handles search validation, API calls, and result formatting
- **README.md**: User-facing documentation
- **LICENSE**: MIT license

## Key Architecture Concepts

### Plugin Configuration (plugin.json)

The plugin uses a declarative configuration system:

1. **Function Spec**: Defines the function signature for LLM integration via `openaiSpec`
   - Single parameter: `query` (string containing the search term)
   - Clear description of when to use the search function

2. **HTTP Action**: Configures the API call via `httpAction`
   - Method: GET to DuckDuckGo's public JSON API endpoint
   - URL: `https://api.duckduckgo.com/?q={query}&format=json&no_html=1`
   - No authentication required (free public API)

3. **Result Transform**: Uses Handlebars template to format API response into Markdown sections:
   - Definition section (when available)
   - Related Topics section
   - Search Results section
   - Conditional rendering ensures clean output

### Implementation Flow (implementation.js)

The plugin exports an async function that handles web search requests:

1. **Input**: Receives `params` containing the search `query`
2. **Validation** (implementation.js:14-26):
   - Checks query exists and is a non-empty string
   - Enforces 500 character limit for reasonable search queries
3. **API Call** (implementation.js:28-42):
   - Properly encodes the query for URL safety
   - Calls DuckDuckGo API with `no_html=1` to avoid HTML in responses
   - Handles HTTP errors appropriately
4. **Formatting** (implementation.js:44-83):
   - Strips HTML tags from results
   - Organizes output into sections: Definition, Related Topics, Search Results
   - Gracefully handles cases with no results
5. **Output**: Returns Markdown-formatted text

### DuckDuckGo API Response Structure

The DuckDuckGo API returns a JSON object with:
- `AbstractText`: Definition or summary text
- `RelatedTopics`: Array of related topics and disambiguation entries
- `Results`: Array of search result objects
- Each object includes `Text`, `Result` (HTML), and potentially URLs

## Common Development Tasks

### Testing Changes

Since this plugin uses a public API with no authentication:

1. **Manual testing** via the TypingMind interface is the primary validation method
2. **Test various query types**:
   - Simple searches: "machine learning"
   - Definitional queries: "what is photosynthesis"
   - Ambiguous searches: "python" (should return disambiguation)
   - Edge cases: very long queries, special characters
3. **Validation**: Ensure plugin.json is valid JSON

### Making Changes

- **Updating API parameters**: Modify the URL in `httpAction.url` (plugin.json:25)
  - Available params: `q` (query), `format`, `no_html`, `t` (user agent), `kl` (language)
- **Changing output format**: Update the `resultTransform.templateString` (plugin.json:30)
- **Adjusting result filtering**: Modify the JavaScript formatting in `formatSearchResults()` (implementation.js:44-83)

### Validating the Plugin

Run basic validation:

```bash
# Validate JSON syntax
cat plugin.json | jq .

# Check for development notes
grep -n "TODO\|FIXME\|BUG" implementation.js
```

## Important Patterns

- **Query Encoding**: Use `encodeURIComponent()` for URL safety (implementation.js:29)
- **HTML Sanitization**: Strip HTML tags from API responses before display (implementation.js:57, 71)
- **Error Handling**: Provide user-friendly error messages for validation and API failures
- **Conditional Rendering**: Use Handlebars `{{#if}}` blocks to handle missing data sections gracefully
- **No Authentication**: This is a key advantage - DuckDuckGo's public API requires no API key setup

## Architecture Decisions

1. **Public API Only**: DuckDuckGo's free JSON endpoint needs no authentication, reducing friction for users
2. **Client-Side Formatting**: Result transformation happens in both Handlebars (initial structure) and JavaScript (HTML cleanup, final format)
3. **No User Settings**: Simplifies plugin configuration - users just invoke the search function
4. **Markdown Output**: Renders cleanly in the TypingMind interface with proper formatting

## Related Resources

- DuckDuckGo API Documentation: https://duckduckgo.com/api
- TypingMind Plugin Documentation: https://docs.typingmind.com/plugins
