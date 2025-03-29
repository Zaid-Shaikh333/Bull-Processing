import { Worker } from 'bullmq';
import { Queues, testQueue, externalAPIQueue } from '../queues/queues.js'
import axios from 'axios';
import { addJobs} from '../queues/addJobs.js';
import IORedis from 'ioredis';
const redisConnection = new IORedis({
    maxRetriesPerRequest: null, 
    enableReadyCheck: true, 
});

const testWorker = new Worker(Queues.testQueue, async (job) => {
    console.log(`Processing Test Job: ${job}`);

    if (job.name === 'Bulk Job') {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`Random Log after Promise simulation`);

        console.log(`Job Completed: ${job.data.key} - ${job.data.value}`);
    }
}, {
    connection: redisConnection,
    concurrency: 5, limiter: {
        max: 5,
        duration: 1000
    }
});

const apiWorker = new Worker(Queues.externalApiQueue, async (job) => {
    console.log(`Processing API Job: ${job.data}`);

    if (job.name === 'External API Job') {
        try {
            const response = await axios.get(job.data.url);
            console.log(`External API Response: ${JSON.parse(response.data)}`);
            return response
        } catch (error) {
            throw new Error(`API Called Failed: ${error.message}`);
        }
    }
}, {
    connection: redisConnection,
    concurrency: 5, limiter: {
        max: 5,
        duration: 1000
    }
});


testWorker.on('progress' , (job, progress) => {
    console.log(`Test Worker Job ${job} under Progress: ${progress}`);
})

testWorker.on('completed', (job) => {
    console.log(`Test Worker Job Completed: ${job}`);
})

apiWorker.on('progress', (job, progress) => {
    console.log(`ExternalAPI Worker Job: ${job} under Progress: ${progress}`);
})

apiWorker.on('completed', (job) => {
    console.log(`ExternalAPI Worker Job Completed: ${job}`);
})

async function cleanOldJobs() {
    await testQueue.clean(100, 100, 'completed'); 
    await externalAPIQueue.clean(100, 100, 'completed');
    console.log('Cleaned old jobs');
}

addJobs();
cleanOldJobs()
