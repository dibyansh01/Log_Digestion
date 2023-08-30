import fs from 'fs';

// Defining the LogEntry interface
interface LogEntry {
  timestamp: string;
  endpoint?: string;
  status?: number;
}

// Defining the list of log files
const logFiles = ['api-prod-out.log', 'prod-api-prod-out.log', 'api-dev-out.log'];

// Initializing an array to store log data
const data: LogEntry[] = [];

// Step 1: Reading and parsing log files
for (const file of logFiles) {
  // Reading the file contents and split it into lines
  const lines = fs.readFileSync(file, 'utf-8').split('\n');
  for (const line of lines) {
    const parts = line.split(' ');
    const timestamp = parts[0] + ' ' + parts[1];
    const entry: LogEntry = { timestamp };

    // Checking if the line contains an API endpoint and extracting it
    if (line.includes('/api/')) {
      const endpoint = line.match(/\/api\/[^\s]+/)?.[0];
      entry.endpoint = endpoint;
    }

    // Checking if the line contains an HTTP status code and extracting it
    if (line.includes('HTTP/1.1"')) {
      const status = parseInt(line.match(/HTTP\/1.1" (\d+)/)?.[1] || '');
      entry.status = status;
    }

    // Adding the parsed entry to the data array
    data.push(entry);
  }
}

// Initializing data structures for calculations
const endpointCounts: Record<string, number> = {};
const apiCallsPerMinute: Record<string, number> = {};
const apiCallsPerStatusCode: Record<number, number> = {};

// Step 2: Organizing the data for calculations
for (const entry of data) {
  // Updating endpointCounts if an endpoint is present in the entry
  if (entry.endpoint) {
    endpointCounts[entry.endpoint] = (endpointCounts[entry.endpoint] || 0) + 1;
  }

  // Updating apiCallsPerStatusCode if a status code is present in the entry
  if (entry.status) {
    apiCallsPerStatusCode[entry.status] = (apiCallsPerStatusCode[entry.status] || 0) + 1;
  }

  // Updating apiCallsPerMinute if a valid timestamp is present in the entry
  if (!isNaN(Date.parse(entry.timestamp))) {
    const minute = new Date(entry.timestamp).toISOString().substr(11, 5); // Extracting HH:mm from timestamp
    apiCallsPerMinute[minute] = (apiCallsPerMinute[minute] || 0) + 1;
  }
}

// Step 3: Calculating insights and sorting data
const sortedEndpoints = Object.entries(endpointCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([endpoint, count]) => ({
    endpoint: endpoint.length > 40 ? endpoint.slice(0, 40) + '...' : endpoint,
    count,
  }));
const sortedMinutes = Object.entries(apiCallsPerMinute)
  .filter(([minute, count]) => minute !== 'undefined')
  .sort((a, b) => a[0].localeCompare(b[0]));
const sortedStatusCodes = Object.entries(apiCallsPerStatusCode)
  .sort((a, b) => b[1] - a[1]);

// Displaying results as formatted tables
console.log('Endpoint Counts:');
console.log('┌──────────────────────────────────────┬───────┐');
console.log('│             endpoint                 │ count │');
console.log('├──────────────────────────────────────┼───────┤');
for (const item of sortedEndpoints) {
  console.log(`│ ${item.endpoint.padEnd(36)} │ ${String(item.count).padEnd(6)} │`);
}
console.log('└──────────────────────────────────────┴───────┘');

// Displaying API Calls Per Minute
console.log('API Calls Per Minute:');
console.log('┌────────────┬───────┐');
console.log('│   minute   │ count │');
console.log('├────────────┼───────┤');
for (const item of sortedMinutes) {
  console.log(`│ ${item[0].padEnd(10)} │ ${String(item[1]).padEnd(6)} │`);
}
console.log('└────────────┴─────────┘');

// Displaying API Calls Per HTTP Status Code
console.log('API Calls Per HTTP Status Code:');
console.log('┌────────────────┬────────────┬───────────┐');
console.log('│   (index)      │ statusCode │   count   │');
console.log('├────────────────┼────────────┼───────────┤');
for (const item of sortedStatusCodes) {
  const statusCodeTitle = getStatusTitle(item[0]);
  console.log(`│ ${statusCodeTitle.padEnd(13)}  │ ${String(item[0]).padEnd(11)}│ ${String(item[1]).padEnd(6)}    │`);
}
console.log('└────────────────┴────────────┴────────────┘');

// Helper function to get status code title
function getStatusTitle(statusCode: any) {
  switch (statusCode) {
    case '200':
      return 'OK';
    case '304':
      return 'Not Modified';
    case '404':
      return 'Not Found';
    case '500':
      return 'Server Error';
    default:
      return 'Other';
  }
}

// Step 4: Creating text file output content
const outputContent = `
Endpoint Counts:
${formatTable(sortedEndpoints)}

API Calls Per Minute:
${formatTable(sortedMinutes, 'minute', 'count')}

API Calls Per HTTP Status Code:
${formatTable(sortedStatusCodes, 'statusCode', 'count')}
`;

// Step 5: Writing output to a file
const outputFilePath = 'output.txt';
fs.writeFileSync(outputFilePath, outputContent, 'utf-8');
console.log(`Output has been written to ${outputFilePath}`);

// Helper function to format table as a string
function formatTable(data: any[], columnTitle1 = 'endpoint', columnTitle2 = 'count') {
  if (data.length === 0) {
    return 'No data available.';
  }

  const header = [columnTitle1, columnTitle2];
  const rows = data.map(item => Object.values(item));

  const table = [header, ...rows]
    .map(row => row.map(String))
    .map(row => row.join('\t'))
    .join('\n');

  return table;
}
