# tracelog-client-sdk

This is the official Node.js client library for the TraceLog (TraceLog API's address or website) platform.

This SDK allows you to easily send logs and metrics from your Node.js applications to the TraceLog API. It eliminates the complexity of issuing manual POST requests with axios.

### Özellikler
---
-Simple and intuitive API (.info(), .error())

-Automatic API Key management

-ypeScript support (includes type definitions)

-Asynchronous log sending in the background

## Installation
You can install the package in your project using NPM or Yarn:
```
npm install tracelog-client-sdk
```
🛠️ Usage
Using the SDK is very simple. First, import the LogStreamer class and create an instance with your API Key.

JavaScript
--
```

//JavaScript (CommonJS)
const { LogStreamer } = require('tracelog-client-sdk');

//TypeScript (ES Modules)
import { LogStreamer } from 'tracelog-client-sdk';

//1. Start the SDK with your API Key
//(You must get this API Key from your LogStream panel)
const logger = new LogStreamer('YOUR_SECRET_API_KEY_HERE');

//2. Start sending logs!

//A log at the information level
logger.info('User logged in successfully', {
  userId: 'user-123',
  process: 'auth'
});

//A log at the error level
try {
  //... Error-potential code ...
  throw new Error('Database connection broken');
} catch (error) {
  logger.error(error.message, {
    statusCode: 500,
    component: 'database-service'
});
}
```
Sending logs is done asynchronously in the background and does not prevent your main application from running.

## API Reference
-new LogStreamer(apiKey)
Starts the SDK client.

-apiKey (string, Required): Your API key obtained from your LogStream panel.

-.info(message, [metadata])
Sends a log at info level.

-message (string, Required): The main log message to send.

-metadata (object, Optional): Extra JSON data to be added to the log (eg: user ID, session ID, etc.).
-.error(message, [metadata])
It sends a log at error level.

-message (string, Required): Error message.

-metadata (object, Optional): Extra context information about the error (e.g. stack trace, request ID, etc.).
