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

// Mock endpoint for extracted data by ID (for development/testing)
app.get("/api/supabase/get-extracted-data/:id", (req, res) => {
  const { id } = req.params;

  // This is a mock implementation - replace with actual database queries
  const mockExtractedData = {
    "url-0": [
      {
        title: "Sample Article 1",
        description: "This is a sample description for article 1",
        author: "John Doe",
        publishDate: "2025-01-15",
        category: "Technology",
        url: "https://example.com/article1",
      },
      {
        title: "Sample Article 2",
        description: "This is a sample description for article 2",
        author: "Jane Smith",
        publishDate: "2025-01-14",
        category: "Business",
        url: "https://example.com/article2",
      },
    ],
    "url-1": [
      {
        productName: "Wireless Headphones",
        price: "$99.99",
        rating: "4.5/5",
        availability: "In Stock",
        brand: "TechBrand",
        features: "Noise Cancelling, Bluetooth 5.0",
      },
      {
        productName: "Smart Watch",
        price: "$199.99",
        rating: "4.2/5",
        availability: "Limited Stock",
        brand: "WearTech",
        features: "Heart Rate Monitor, GPS, Waterproof",
      },
    ],
    // Add data for the actual ID format used by the URL list
    "url-001": [
      {
        title: "Example Page 1 Content",
        headline: "Breaking News from Example Page 1",
        content: "This is the main content extracted from example.com/page1",
        author: "Example Author",
        publishDate: "2025-01-15",
        category: "News",
        tags: ["example", "news", "web"],
        readingTime: "5 minutes",
      },
      {
        title: "Related Article",
        headline: "Secondary content from the page",
        content: "Additional content found on the same page",
        author: "Staff Writer",
        publishDate: "2025-01-15",
        category: "Related",
        tags: ["related", "content"],
        readingTime: "3 minutes",
      },
    ],
    "url-002": [
      {
        title: "Example Page 2 Data",
        headline: "Important Updates from Page 2",
        content: "Extracted content from example.com/page2",
        author: "Content Manager",
        publishDate: "2025-01-14",
        category: "Updates",
        tags: ["updates", "page2", "content"],
        readingTime: "4 minutes",
        views: 1250,
        shares: 45,
      },
    ],
    "url-003": [
      {
        title: "Hacker News Story 1",
        headline: "Show HN: New JavaScript Framework",
        points: 245,
        author: "developer123",
        comments: 89,
        url: "https://news.ycombinator.com/item?id=123456",
        timestamp: "2025-01-15T10:30:00Z",
        category: "Show HN",
      },
      {
        title: "Hacker News Story 2",
        headline: "AI Breakthrough in Natural Language Processing",
        points: 567,
        author: "airesearcher",
        comments: 134,
        url: "https://news.ycombinator.com/item?id=123457",
        timestamp: "2025-01-15T09:15:00Z",
        category: "Tech",
      },
      {
        title: "Hacker News Story 3",
        headline: "YC Winter 2025 Demo Day Highlights",
        points: 123,
        author: "ycombinator",
        comments: 67,
        url: "https://news.ycombinator.com/item?id=123458",
        timestamp: "2025-01-15T08:00:00Z",
        category: "YC",
      },
    ],
  };

  // Get data for the specific ID, or return realistic sample data
  const data = mockExtractedData[id] || [
    {
      title: `Sample Data for ${id}`,
      content: "This is sample extracted content",
      extractedAt: new Date().toISOString(),
      source: id,
      status: "processed",
      dataFields: ["title", "content", "timestamp"],
      recordCount: 1,
    },
  ];

  res.json({
    status: "success",
    data: data,
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
