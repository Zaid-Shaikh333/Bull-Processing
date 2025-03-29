import { testQueue, externalAPIQueue } from './queues';
const limit = 1000;

export const addJobs = async () => {
    for(let count = 0; count < limit; count++) {
        const job = {
            key: `key-${count}`,
            value: `value-${count*count}`
        }

        await testQueue.add('Bulk Job', job, {
            attempts: 3,
            backoff: { type: 'fixed', delay: 3000 },
            delay: 500,
            removeOnComplete: true,
            removeOnFail: false,
        })

        const apiJob = {
            url: `https://jsonplaceholder.typicode.com/comments/${count}`
        }

        await externalAPIQueue.add('External API Job', apiJob, {
            attempts: 1,
            backoff: { type: 'fixed', delay: 3000 },
            removeOnComplete: true,
        })
    }
}


addJobs();