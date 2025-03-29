import { Worker, Job } from 'bullmq';
import { Queues, testQueue, externalApiQueue } from '../queues/queues'
import axios from 'axios';
import { addJobs} from '../queues/addJobs';

const testWorker = new Worker(Queues.testQueue, async (job) => {
    console.log(`Processing Test Job: ${job}`);

    if (job.name === 'Bulk Job') {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`Random Log after Promise simulation`);

        console.log(`Job Completed: ${job.data}`);
    }
}, {
    concurrency: 10, limiter: {
        max: 10,
        duration: 1000
    }
});

const apiWorker = new Worker(Queues.externalApiQueue, async (job) => {
    console.log(`Processing API Job: ${job}`);

    if (job.name === 'External API Job') {
        try {
            const response = await axios.get(job.data.url);
            console.log(`External API Response: ${response.data}`);
            return response
        } catch (error) {
            throw new Error(`API Called Failed: ${error.message}`);
        }
    }
}, {
    concurrency: 10, limiter: {
        max: 10,
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
    await testQueue.clean(100000, 100, 'completed'); 
    await externalApiQueue.clean(100000, 100, 'completed');
    console.log('Cleaned old jobs');
}


addJobs().then(() => cleanOldJobs())
