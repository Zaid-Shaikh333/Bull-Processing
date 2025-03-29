import { testQueue, externalAPIQueue } from './queues.js';
const limit = 100;

export const addJobs = async () => {
    for (let count = 0; count < limit; count++) {
        const job = { key: `key-${count}`, value: `value-${count * count}` };
        const apiJob = { url: `https://jsonplaceholder.typicode.com/comments/${count}` };

        await testQueue.add('Bulk Job', job, {
            attempts: 3,
            backoff: { type: 'fixed', delay: 1000 },
            delay: 500,
            removeOnComplete: true,
        });

        await externalAPIQueue.add('External API Job', apiJob, {
            attempts: 1,
            backoff: { type: 'fixed', delay: 500 },
            delay: 500,
            removeOnComplete: true,
        });
    }
    console.log('✅ All jobs added');
};