import express from 'express';
import logRoutes from './app/routes/logRoutes';

const app = express();

app.use(express.json());
app.use('/api', logRoutes);

const PORT = process.env.PORT || 8080;  // Make sure it listens to the correct port.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});