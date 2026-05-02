const app = require("./app");
const env = require("./config/env");
const connectDatabase = require("./config/db");

const startServer = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error("JWT_SECRET is missing. Add it to your .env file.");
    }

    await connectDatabase(env.mongoUri);

    app.listen(env.port, () => {
      console.log(`RouteReady API running on port ${env.port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
