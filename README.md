# CORS Proxy

A simple proxy server that helps bypass CORS restrictions for web applications.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Server runs at http://localhost:8080 by default.

You can specify a different port:

```bash
npm start 3000
```

## How to use

Send your requests to:

```
http://localhost:8080/example.com/api/data
```

Instead of:

```
https://example.com/api/data
```

## Features

- Works with GET, POST, PUT, DELETE requests
- Forwards headers, query parameters and request bodies
- Handles JSON, text and binary responses
- Adds CORS headers automatically