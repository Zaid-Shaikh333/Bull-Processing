import { Queue } from 'bullmq';
import { connection } from '../config/bull.config.js';

export const Queues = {
    testQueue: 'myTestQueue',
    externalApiQueue: 'externalApiQueue',
    batchProcessingQueue: 'batchProcessingQueue'
}

/**
 * Create a new Queue instance
 * This is a Test Queue. You can create as many Queues as you want
 * A Queue accepts name along with a Connection Object that indicates the host and port on which the Queue listens.
 * @param {string} name - The name of the Queue
 */
export const testQueue = new Queue(Queues.testQueue, connection); 

export const batchProcessingQueue = new Queue(Queues.batchProcessingQueue, connection, defaultJobOptions = {
    sizeLimit: 30*1024*1024
});

export const externalAPIQueue = new Queue(Queues.externalApiQueue, connection);