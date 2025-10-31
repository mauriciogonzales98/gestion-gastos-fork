// Services/status/serviceStatus.js
export default class StatusService {
  constructor() {}

  async checkBackendStatus() {
    let timeoutId;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`http://localhost:3001/api/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Backend status check failed:", error);

      if (error.name !== "AbortError") {
        console.error("Backend status check failed:", error);
      }

      return false;
    }
  }
}
