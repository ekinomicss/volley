import express from 'express';
import logRoutes from './app/routes/logRoutes';
import { watchLogs } from './app/utils/logMonitor';

const app = express();
app.use(express.json());
app.use('/api', logRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Monitor logs from the open-source repository
  watchLogs('/path/to/open-source-project/logfile.log');  // Adjust the path to the log file
});
