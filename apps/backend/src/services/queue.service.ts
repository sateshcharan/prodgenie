const queue = [];

export function addJob(job) {
  queue.push(job);
}

export function processJobs() {
  setInterval(() => {
    const job = queue.shift();
    if (job) {
      // run job logic here
      console.log('Processing job', job);
    }
  }, 1000);
}
