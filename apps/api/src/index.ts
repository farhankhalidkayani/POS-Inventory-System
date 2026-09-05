import { loadEnv } from "./shared/config/env.js";
import { buildServer } from "./server.js";

async function main(): Promise<void> {
  const env = loadEnv();
  const app = await buildServer(env);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
