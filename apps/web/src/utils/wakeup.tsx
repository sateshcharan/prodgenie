import axios from "axios";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const TIMEOUT_MS = 20000; // how long to keep trying (20 sec)
const INTERVAL_MS = 1500; // how frequently to poll

export const wakeWorkers = async () => {
  const wakeupUrl = `${WORKER_URL}/wakeup`;
  const healthUrl = `${WORKER_URL}/health`;

  try {
    // First attempt to wake the worker
    await axios.get(wakeupUrl, { method: "GET", cache: "no-cache" });
  } catch (err) {
    console.warn("Initial wake-up request failed—but continuing polling…");
  }

  // Polling for health readiness
  const start = Date.now();

  while (true) {
    try {
      const res = await axios.get(healthUrl);
      if (res.status === 200) {
        console.log("Worker is awake & healthy");
        return true; // resolve!
      }
    } catch (_) {
      // ignore, keep trying
    }

    // Timeout
    if (Date.now() - start > TIMEOUT_MS) {
      throw new Error("Worker failed to wake up within timeout");
    }

    // Wait interval before next poll
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
};
