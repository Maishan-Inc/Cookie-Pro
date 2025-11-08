export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("unhandledRejection", (reason) => {
      console.error(
        JSON.stringify({
          level: "error",
          message: "unhandled rejection",
          reason,
          timestamp: new Date().toISOString(),
        }),
      );
    });
  }
}
