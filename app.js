const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
// const applicationsRoutes = require('./routes/applicationsRoutes');
// const backgroundChecksRoutes = require('./routes/backgroundChecksRoutes');
// const documentsRoutes = require('./routes/documentsRoutes');
// const messagesRoutes = require('./routes/messagesRoutes');
// const paymentsRoutes = require('./routes/paymentsRoutes');
// const propertiesRoutes = require('./routes/propertiesRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/users', userRoutes);
// app.use('/applications', applicationsRoutes);
// app.use('/background-checks', backgroundChecksRoutes);
// app.use('/documents', documentsRoutes);
// app.use('/messages', messagesRoutes);
// app.use('/payments', paymentsRoutes);
// app.use('/properties', propertiesRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
