import LZ4 from 'lz4-kafkajs';
import kafkajs, { Consumer } from 'kafkajs';
import { readFileSync } from 'fs';
import { Kafka } from 'kafkajs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../entities/Product';
import { AppDataSource } from '../database/data-source';
import dotenv from 'dotenv';

const { CompressionTypes, CompressionCodecs } = kafkajs;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const certDir = join(__dirname, '..', '..', 'certificates');

dotenv.config();
CompressionCodecs[CompressionTypes.LZ4] = new LZ4().codec;

export class KafkaConsumerService {
  private resetOffset: boolean = false;
  private kafka: Kafka;
  private consumer: Consumer;
  private topic = process.env.KAFKA_TOPIC;
  private productRepository = AppDataSource.getRepository(Product);

  constructor() {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER],
      ssl: {
        key: readFileSync(`${certDir}/kafka-access-key.pem`, 'utf-8'),
        cert: readFileSync(`${certDir}/access_certificate.crt`, 'utf-8'),
        ca: readFileSync(`${certDir}/ca_certificate.crt`, 'utf-8'),
        rejectUnauthorized: true,
      },
    });
    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID,
      allowAutoTopicCreation: true,
    });
  }

  async start() {
    try {
      this.consumer.on(this.consumer.events.CRASH, (e) => {
        console.error('[CONSUMER.ON.CRASH] - Consumer crashed:', e);
        this.resetOffset = true;
      });

      if (this.resetOffset) {
        this.consumer.on(this.consumer.events.GROUP_JOIN, async (e) => {
          console.log('[CONSUMER.ON.GROUP_JOIN] - Group join event:', e);
          console.log('[CONSUMER.ON.GROUP_JOIN] - Resetting offsets to beginning on group join');

          await this.resetOffsets();
        });
      }

      await this.consumer
        .connect()
        .then(() => console.log('[CONSUMER.CONNECT] - Kafka consumer connected successfully'))
        .catch((err) => console.error('[CONSUMER.CONNECT] - Error connecting Kafka consumer:', err));

      await this.consumer
        .subscribe({ topic: this.topic, fromBeginning: true }) // frombeginning define if the consumer shoudl restart from zero or not
        .then(() => console.log(`[CONSUMER.SUBSCRIBE] - Subscribed to topic: ${this.topic}`)) // if <variable_assignement> true alors on run de zero ou non
        .catch((err) => console.error('[CONSUMER.SUBSCRIBE] - Error subscribing to topic:', err));

      await this.consumer.run({
        eachBatchAutoResolve: false,
        eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
          console.log('[CONSUMER.RUN] - Processing batch:');

          for (const message of batch.messages) {
            try {
              const { locale, product_id, data } = message.value?.toString()
                ? JSON.parse(message.value?.toString())
                : undefined;

              console.log('[CONSUMER.RUN] - Message received:', {
                locale,
                product_id,
                offset: message.offset,
                data,
              });

              if (product_id && data && locale) {
                try {
                  await this.productRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Product)
                    .values({ locale, product_id, product_data: data })
                    .orUpdate(['product_data'], ['locale', 'product_id'])
                    .execute();
                } catch (err) {
                  console.error('[CONSUMER.RUN] - Error when trying to upsert product in database', err);
                }
              }
              resolveOffset(message.offset);
            } catch (err) {
              console.error('[CONSUMER.RUN] - Error when processing message:', err);
            }
          }
          await heartbeat();
        },
        autoCommit: true,
      });
    } catch (err) {
      console.error('[CONSUMER.RUN] - Error starting Kafka consumer:', err);
    }
  }

  async shutdown(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      console.log('[CONSUMER.DISCONNECT] - Kafka consumer disconnected.');
    }
  }

  async getPartitions(): Promise<number[]> {
    const topicInfo = await this.kafka.admin().fetchTopicMetadata({ topics: [this.topic] });

    return topicInfo.topics[0]?.partitions.map((p) => p.partitionId) || [];
  }

  async resetOffsets(): Promise<void> {
    this.resetOffset = false;

    const partitions = await this.getPartitions();

    for (const partition of partitions) {
      await this.consumer.seek({
        topic: this.topic,
        partition,
        offset: '0',
      });
    }
  }
}
