import express from 'express';
import logRoutes from './app/routes/logRoutes';
import { watchLogs } from './app/utils/logMonitor';

const app = express();

app.use(express.json());
app.use('/api', logRoutes); // Add the /api prefix

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});