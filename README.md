# Log_Digestion

A Node.js script for log file analysis and API call insight extraction.

## Table of Contents

- [Description](#description)
- [Built With](#built-with)
- [Features](#features)
- [Getting Started](#getting-started)
- [Development](#development)
- [Sample Output](#sample-output)

## Description

This tool reads log files containing API call information, processes the data, and provides insights about the number of API calls, status codes, and calls per minute.

## Built With 
1. Node.js
2. Typescript

## Features

- Tracks the quantity of API calls made to each endpoint.
- Examines API calls made each minute.
- Shows API call statistics broken down by HTTP status code.

## Getting Started
To run the app locally, please follow the following simple steps:

## Prerequisites

Node.js and npm should be installed on your machine.

## Development

1. Fork the repository to your profile.
   
2. Clone your repository by running the following command in your terminal:
   ```sh
   git clone <your-repository-url>
   ```
3. Install dependencies:

```bash
 npm install

```
4. In the same directory as the script, put your log files. Add your file names to the fileNames array in index.ts.

Run the script:

```bash
 tsc
 npm start

```

The tool will analyze the log files, show statistics, and output the results in a text file called "output.txt."

## Sample Output

```bash

Endpoint Counts:
┬────────────────────────────┬───────────┐
│         endpoint           │   count
├────────────────────────────┼───────────┼
│  /api/city                 │  13755    │
│ /api/masters/jobskill      │  13751    │
│ /api/masters/culturevalues │  12847    │
...


API Calls Per Minute:
┬─────────────────────┬
│   minute  │   count
├─────────────────────┼
│  00:00    │  309    │
│  00:01    │  439    │
│  00:02    │  476    │
...

   API Calls Per HTTP Status Code:
┌────────────────┬────────────┬───────────┐
│   (index)      │ statusCode │   count   │
├────────────────┼────────────┼───────────┤
│ OK             │ 200        │ 160059    │
│ Not Modified   │ 304        │ 144418    │
│ Not Found      │ 404        │ 97279     │
│ Other          │ 206        │ 11814     │
│ Server Error   │ 500        │ 2062      │
│ Other          │ 422        │ 857       │
│ Other          │ 400        │ 339       │
│ Other          │ 401        │ 44        │
│ Other          │ 416        │ 1         │
└────────────────┴────────────┴────────────┘
    ...
```
