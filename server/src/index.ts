import "reflect-metadata";
import dotenv from "dotenv";
import { App } from "./infrastructure/config/server/server.js";
import { config } from "./shared/config.js";
import { MongoConnect } from "./infrastructure/database/mongoDB/mongoConnect.js";
import { connectRedis } from "./infrastructure/config/redisConfig.js";
dotenv.config();

async function startServer() {
  try {
    await connectRedis();
    console.log("Redis connected");

    const mongo = new MongoConnect();
    await mongo.connectDB();
    console.log("MongoDB connected");

    const app = new App();
    const expressServer = app.getApp();

    const PORT = Number(config.server.PORT) || 3000;

    expressServer.listen(PORT, () =>
      console.log(`Server running at port ${PORT}`)
    );
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();