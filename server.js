const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require("express-sslify");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Trust first proxy (important for Heroku, Render, etc.)
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for some external resources
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }),
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);

// Enable compression with more aggressive settings for text-based responses
app.use(
  compression({
    level: 6, // Compression level (0-9, where 9 is maximum)
    threshold: "1kb", // Only compress responses larger than 1kb
    filter: (req, res) => {
      // Don't compress responses with this header
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Fall back to standard filter function
      return compression.filter(req, res);
    },
  }),
);

// Enforce HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Security headers middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable browser's XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Set Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Set Permissions-Policy
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  next();
});

// Cache control for static files
const staticFileOptions = {
  maxAge: "1y", // Cache for 1 year
  immutable: true, // Tell browsers the file will never change
  lastModified: true, // Add Last-Modified header
  etag: true, // Add ETag header
  setHeaders: (res, path) => {
    // Set longer cache for static assets
    if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
};

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "build"), staticFileOptions));

// API routes would go here
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mock endpoint for scheduled tasks (for development/testing)
app.get("/api/supabase/get-scheduled-tasks", (req, res) => {
  // This is a mock implementation - replace with actual database queries
  const mockTasks = [
    {
      task_name: "Daily News Scraper",
      frequency: "24 hours",
      run_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
      last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      status: "active",
      origin_url: "https://example.com/news",
    },
    {
      task_name: "Product Price Monitor",
      frequency: "12 hours",
      run_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      last_run_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      status: "active",
      origin_url: "https://example.com/products",
    },
    {
      task_name: "Weekly Report Generator",
      frequency: "7 days",
      run_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      last_run_at: null, // Never run before
      status: "pending",
      origin_url: "https://example.com/reports",
    },
  ];

  res.json({
    status: "success",
    data: mockTasks,
  });
});

// Handle all other routes by serving the React app
app.get("*", (req, res, next) => {
  // Don't handle API routes here - they should be handled by your API server
  if (req.path.startsWith("/api/")) {
    return next();
  }

  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, "build", "index.html"), {
    // Disable caching for the HTML file
    cacheControl: false,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  // Set locals, only providing error in development
  const isDevelopment = process.env.NODE_ENV !== "production";
  const errorDetails = isDevelopment ? err.stack : undefined;

  // Log the error
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${err.status || 500} - ${err.message}`,
  );

  // Send error response
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(isDevelopment && { details: errorDetails }),
  });
});

// Start the server
const PORT = process.env.PORT || 8080;

// Only start the server if this file is run directly (not when imported)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Server time: ${new Date().toISOString()}`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Optionally exit the process
    // process.exit(1);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // Optionally exit the process
    // process.exit(1);
  });

  // Handle process termination
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
    });
  });
}

module.exports = app;
