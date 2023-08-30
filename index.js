"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logFiles = ['api-prod-out.log', 'prod-api-prod-out.log', 'api-dev-out.log'];
const data = [];
//  Reading and parsing log files
for (const file of logFiles) {
    const lines = fs_1.default.readFileSync(file, 'utf-8').split('\n');
    for (const line of lines) {
        const parts = line.split(' ');
        const timestamp = parts[0] + ' ' + parts[1];
        const entry = { timestamp };
        if (line.includes('/api/')) {
            const endpoint = (_a = line.match(/\/api\/[^\s]+/)) === null || _a === void 0 ? void 0 : _a[0];
            entry.endpoint = endpoint;
        }
        if (line.includes('HTTP/1.1"')) {
            const status = parseInt(((_b = line.match(/HTTP\/1.1" (\d+)/)) === null || _b === void 0 ? void 0 : _b[1]) || '');
            entry.status = status;
        }
        data.push(entry);
    }
}
// Organizing the data for calculations
const endpointCounts = {};
const apiCallsPerMinute = {};
const apiCallsPerStatusCode = {};
for (const entry of data) {
    if (entry.endpoint) {
        endpointCounts[entry.endpoint] = (endpointCounts[entry.endpoint] || 0) + 1;
    }
    if (entry.status) {
        apiCallsPerStatusCode[entry.status] = (apiCallsPerStatusCode[entry.status] || 0) + 1;
    }
    if (!isNaN(Date.parse(entry.timestamp))) {
        const minute = new Date(entry.timestamp).toISOString().substr(11, 5); // Extracting HH:mm from timestamp
        apiCallsPerMinute[minute] = (apiCallsPerMinute[minute] || 0) + 1;
    }
}
//  Calculating insights
const sortedEndpoints = Object.entries(endpointCounts)
    .sort((a, b) => b[1] - a[1]) //sorting in descending order based on the count
    .map(([endpoint, count]) => ({
    endpoint: endpoint.length > 40 ? endpoint.slice(0, 40) + '...' : endpoint,
    count,
}));
const sortedMinutes = Object.entries(apiCallsPerMinute)
    .filter(([minute, count]) => minute !== 'undefined')
    .sort((a, b) => a[0].localeCompare(b[0]));
const sortedStatusCodes = Object.entries(apiCallsPerStatusCode).sort((a, b) => b[1] - a[1]); //sorting in descending order based on the count
//Displaying results
console.log('Endpoint Counts:');
console.log('┌──────────────────────────────────────┬───────┐');
console.log('│             endpoint                 │ count │');
console.log('├──────────────────────────────────────┼───────┤');
for (const item of sortedEndpoints) {
    console.log(`│ ${item.endpoint.padEnd(36)} │ ${String(item.count).padEnd(6)} │`);
}
console.log('└──────────────────────────────────────┴───────┘');
console.log('API Calls Per Minute:');
console.log('┌────────────┬───────┐');
console.log('│   minute   │ count │');
console.log('├────────────┼───────┤');
for (const item of sortedMinutes) {
    console.log(`│ ${item[0].padEnd(10)} │ ${String(item[1]).padEnd(6)} │`);
}
console.log('└────────────┴─────────┘');
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
function getStatusTitle(statusCode) {
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
// Creating output.txt file content
const outputContent = `
Endpoint Counts:
${formatTable(sortedEndpoints)}

API Calls Per Minute:
${formatTable(sortedMinutes, 'minute', 'count')}  

API Calls Per HTTP Status Code:
${formatTable(sortedStatusCodes, 'statusCode', 'count')}  
`;
// Writing output to file output.txt
const outputFilePath = 'output.txt';
fs_1.default.writeFileSync(outputFilePath, outputContent, 'utf-8');
console.log(`Output has been written to ${outputFilePath}`);
// Helper function to format table as a string
function formatTable(data, columnTitle1 = 'endpoint', columnTitle2 = 'count') {
    if (data.length === 0) {
        return 'No data available.';
    }
    const header = [columnTitle1, columnTitle2]; // Adding column titles
    const rows = data.map(item => Object.values(item));
    const table = [header, ...rows]
        .map(row => row.map(String))
        .map(row => row.join('\t'))
        .join('\n');
    return table;
}
