const cron = require('node-cron');

class CronService {
  constructor() {
    this.jobs = [];
  }

  start() {
    console.log('🕐 Starting cron jobs...');

    // Reset API usage counters monthly
    const resetUsageJob = cron.schedule('0 0 1 * *', async () => {
      console.log('Resetting monthly API usage...');
    }, {
      scheduled: false
    });

    // Update trending topics every 6 hours
    const trendsJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Updating trending topics...');
    }, {
      scheduled: false
    });

    this.jobs = [
      { name: 'resetUsage', job: resetUsageJob },
      { name: 'trends', job: trendsJob }
    ];

    // Start all jobs
    this.jobs.forEach(({ name, job }) => {
      job.start();
      console.log(`✅ Started ${name} cron job`);
    });
  }

  stop() {
    console.log('🛑 Stopping cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`❌ Stopped ${name} cron job`);
    });
  }
}

module.exports = CronService; 