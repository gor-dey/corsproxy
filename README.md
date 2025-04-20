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

Server runs at http://localhost:8080

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

- Works with GET, POST, PUT, PATCH, DELETE requests
- Forwards headers, query parameters and request bodies
- Handles JSON, text and binary responses
- Adds CORS headers automatically