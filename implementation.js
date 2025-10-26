async function duckduckgo_search(params) {
  const { query } = params;
  validateSearchQuery(query);

  try {
    const results = await searchDuckDuckGo(query);
    return formatSearchResults(results);
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error);
    throw new Error(`Search error: ${error.message}`);
  }
}

function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Please provide a valid search query.');
  }

  if (query.trim().length === 0) {
    throw new Error('Search query cannot be empty.');
  }

  if (query.length > 500) {
    throw new Error('Search query is too long (maximum 500 characters).');
  }
}

async function searchDuckDuckGo(query) {
  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(
      `DuckDuckGo API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

function formatSearchResults(data) {
  let markdown = '';

  // Add definition/abstract if available
  if (data.AbstractText) {
    markdown += `**Definition:**\n${data.AbstractText}\n\n`;
  }

  // Add related topics
  if (data.RelatedTopics && data.RelatedTopics.length > 0) {
    markdown += '**Related Topics:**\n';
    data.RelatedTopics.forEach((topic) => {
      if (topic.Text) {
        const text = topic.Text.replace(/<[^>]*>/g, ''); // Remove HTML tags
        markdown += `- ${text}\n`;
      }
    });
    markdown += '\n';
  }

  // Add search results
  if (data.Results && data.Results.length > 0) {
    markdown += '**Search Results:**\n';
    data.Results.forEach((result) => {
      if (result.Result) {
        // Clean HTML from result
        const title = result.Title || 'Result';
        const cleanResult = result.Result.replace(/<[^>]*>/g, ''); // Remove HTML tags
        markdown += `- ${cleanResult}\n`;
      }
    });
  }

  // If no results found
  if (!markdown.trim()) {
    markdown = `No results found for "${data.query || 'your search'}"`;
  }

  return markdown;
}
