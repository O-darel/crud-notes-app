const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const notesRoutes = require('./routes/notes');
const logger=require("./logger")

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// //simple logging middleware
// app.use((req, res, next) => {
//     const start = Date.now(); // Record the start time

//     // Log request method and URL
//     console.log("Request Method:", req.method);
//     console.log("Request URL:", req.originalUrl);

//     // Override the res.send method to log the response status after it has been sent
//     const originalSend = res.send;
//     res.send = function (body) {
//         const duration = Date.now() - start; // Calculate duration
//         console.log("Response Status:", res.statusCode);
//         console.log("Request Duration:", duration, "ms");
//         console.log("===============================================")

//         // Call the original res.send function
//         originalSend.call(this, body);
//     };

//     // Continue to the next middleware or route handler
//     next();
// });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

//Routes for notes
app.use('/api/notes', notesRoutes);

// Serve the index.html file for all other routes
app.get('/', (req, res) => {
    logger.info('Root endpoint accessed', {
        method: req.method,                // HTTP method
        url: req.url,                      // Requested URL
        clientIP: req.ip,                  // Client IP address
        userAgent: req.get('User-Agent'),  // User-Agent header
        filePath,                          // Path of the file being served
    });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Example route to test logging
// app.get('/about', (req, res) => {
//     res.send('About us!');
// });

// Catch-all route for 404 errors
app.use((req, res, next) => {
    const filePath = path.join(__dirname, 'public', '404.html');

    // Log 404 details
    logger.warn('404 Not Found', {
        method: req.method,                // HTTP method
        url: req.originalUrl,              // Requested URL
        clientIP: req.ip,                  // Client IP address
        userAgent: req.get('User-Agent'),  // User-Agent header
    });

    res.status(404).sendFile(filePath);
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
