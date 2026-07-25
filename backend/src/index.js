require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const widgetRoutes = require('./routes/widgets');
const serviceRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const servicesConfig = require('./services');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/widgets', widgetRoutes);
app.use('/services', serviceRoutes);
app.use('/admin', adminRoutes);

app.get('/about.json', (req, res) => {
  res.json({
    client: { host: req.ip },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services: servicesConfig.getAll()
    }
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Page non trouvée' }));

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;