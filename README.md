# tracelog-client-sdk

The official, high-performance Node.js client library for the TraceLog platform.

TraceLog SDK goes beyond simple logging. It automatically tracks HTTP request durations, redacts sensitive data (like passwords) before they leave your server, and provides global context management for advanced filtering.

Say goodbye to complex manual logging and missing performance metrics!

## Features

- **Express HTTP Middleware:** Automatically tracks HTTP method, URL, status code, client IP, and exact request duration (ms).
- **Auto-Redaction (Security First):** Automatically masks sensitive keys (e.g., `password`, `token`, `credit_card`) with `[REDACTED]` before sending data to the backend.
- **Global Context:** Inject custom data (like environment, app version, or user IDs) into all logs automatically.
- **Graceful Shutdown:** Catches `SIGTERM/SIGINT` to securely log system shutdowns before your Node.js process exits.
- **TypeScript Ready:** Built with TypeScript, providing out-of-the-box type safety, intelligent autocompletion, and zero friction.

---

## Installation

You can install the package in your project using NPM or Yarn:

```bash
npm install tracelog-client-sdk
```
## Quick Start
1. Initialization
Import the SDK and initialize it with your Project ID and API Key.

### JavaScript (CommonJS):

### JavaScript
```
const { TraceLog } = require('tracelog-client-sdk');

const logger = new TraceLog({
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY',
    backendUrl: '[https://api.yourdomain.com](https://api.yourdomain.com)' // Optional: Defaults to localhost for local testing
});
```
### TypeScript (ES Modules):

### TypeScript
```
import { TraceLog } from 'tracelog-client-sdk';

const logger = new TraceLog({
    projectId: 'YOUR_PROJECT_ID',
    apiKey: 'YOUR_API_KEY'
});
```
---
### 2. Basic Logging
You can log messages with standard levels (info, warn, error, fatal, debug) and attach custom metadata.

### JavaScript
```
// A log at the information level
logger.log('info', 'User successfully authenticated', {
    userId: 'user_123',
    method: 'OAuth2'
});

// The SDK automatically masks sensitive fields!
logger.log('warn', 'Failed login attempt', {
    email: 'test@test.com',
    password: 'my_secret_password' // This will securely be sent as [REDACTED]
});
```

## Advanced Features
Auto HTTP Tracking (Express Middleware)
Track every single request in your Express app without writing manual logs. It calculates the exact response time (durationMs) and detects errors automatically.

### JavaScript
```
const express = require('express');
const { TraceLog, expressMiddleware } = require('tracelog-client-sdk');

const app = express();
const logger = new TraceLog({ projectId: '123', apiKey: 'sk_...' });

// Add this before your routes to track all incoming traffic!
app.use(expressMiddleware(logger));

app.get('/', (req, res) => {
    res.send('TraceLog is watching this route!');
});

app.listen(8080);
```

## Global Context Management
If you want to attach specific data (like the current environment or app version) to every log sent from your application, use the context manager.

### JavaScript
```
// Set it once (e.g., on app startup or user login)
logger.setContext({
    environment: 'production',
    appVersion: '2.1.0'
});

// All subsequent logs will automatically include { environment: 'production', appVersion: '2.1.0' }.
logger.log('info', 'Database connected successfully');

// To clear context when needed:
// logger.clearContext();
```

## API Reference
```
new TraceLog(options)
```
### Starts the SDK client.

- ***projectId (string | number, Required):*** Your TraceLog project ID.

- ***apiKey (string, Required):*** Your secure API key obtained from your TraceLog panel.

- ***backendUrl (string, Optional):*** Custom backend URL for self-hosted instances.
```
logger.log(level, message, [metadata])
```
### Sends an asynchronous log to the TraceLog API.
---
- ***level (string, Required):*** 'info' | 'warn' | 'error' | 'fatal' | 'debug'

- ***message (string, Required):*** The main log message.

- ***metadata (object, Optional):*** Extra JSON data to be added to the log.
```
logger.setContext(contextData)
```

### Appends default metadata to all future logs.
---
- ***contextData (object, Required):*** JSON object containing the context data.
```
expressMiddleware(loggerInstance)
```
Returns an Express middleware function that auto-logs HTTP traffic, calculates durations, and maps HTTP status codes to log levels.



