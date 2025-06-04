import express, { Application } from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './database/data-source';
import { router } from './routes/index';
import { KafkaConsumerService } from './services/kafka';

dotenv.config();

const port = process.env.PORT || 8080;
const app: Application = express();
const kafkaConsumerService = new KafkaConsumerService();

app.use(express.json());

app.listen(port, async () => {
  console.debug(`Server listening on port ${port}`);
});

AppDataSource.initialize()
  .then(async () => {
    console.debug('Connected to the database !');

    await kafkaConsumerService.start();
  })
  .catch((error) => {
    console.error('Error during Data Source initialization:', error);
  });

app.get('/', (req, res) => {
  res.send('Hello from Vanrysel Test API !');
});

app.use('/api/v1', router);

export default app;
