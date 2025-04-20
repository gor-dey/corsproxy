import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";

const app = new Koa();
const router = new Router();

app.use(
  bodyParser({
    enableTypes: ["json", "form", "text"],
    extendTypes: {
      text: ["text/plain", "text/xml"],
    },
  })
);

// CORS middleware
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  ctx.set("Access-Control-Allow-Headers", "*");
  ctx.set("Access-Control-Expose-Headers", "*");

  if (ctx.method === "OPTIONS") {
    ctx.status = 204; // No Content
    return;
  }

  await next();
});

// Proxy route for all HTTP methods
router.all("/:url(.*)", async (ctx) => {
  let targetUrl = ctx.params.url;

  if (!targetUrl) {
    ctx.status = 400;
    ctx.body = "Bad Request: No URL provided";
    return;
  }

  // Ensure URL has proper protocol
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  // Reconstruct the full target URL, including query parameters
  const fullUrl = `${targetUrl}${ctx.querystring ? `?${ctx.querystring}` : ""}`;

  try {
    // Build fetch options
    const options = {
      method: ctx.method,
      headers: { ...ctx.request.headers },
      redirect: "follow",
    };

    // Remove headers that would cause issues
    delete options.headers.host;
    delete options.headers.origin;
    delete options.headers["content-length"];

    // Handle request body for methods like POST, PUT
    if (ctx.request.body && ["POST", "PUT", "PATCH"].includes(ctx.method)) {
      options.body = JSON.stringify(ctx.request.body);
      if (options.headers) {
        options.headers["content-type"] = "application/json";
      }
    }

    const response = await fetch(fullUrl, options);

    // Copy status and headers from the proxied response
    ctx.status = response.status;

    // Forward all response headers
    for (const [key, value] of response.headers.entries()) {
      // Skip setting these security headers
      if (
        !["content-security-policy", "content-length", "connection"].includes(
          key.toLowerCase()
        )
      ) {
        ctx.set(key, value);
      }
    }

    // Handle response based on content type
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      ctx.body = await response.json();
    } else if (contentType.includes("text/")) {
      ctx.body = await response.text();
    } else {
      ctx.body = Buffer.from(await response.arrayBuffer());
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = `Error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
});

app.use(router.routes()).use(router.allowedMethods());

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.argv[2] || process.env.PORT || 8080;
app
  .listen(PORT, () => {
    console.log(
      `\x1b[32m✓\x1b[0m CORS Proxy server running on \x1b[36mhttp://localhost:${PORT}\x1b[0m`
    );
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
