import mongoose from "mongoose";
import { config } from "../../shared/config/index";
import { logger } from "../config/logger.config";

export class MongoConnect {
  private _dburl: string;
  constructor() {
    this._dburl = config.database.URI;
  }
  async connectDB() {
    try {
      await mongoose.connect(this._dburl);
      logger.info("db connected");
      mongoose.connection.on("error", (error) => {
        logger.error("db connection error", { error });
      });
      mongoose.connection.on("disconnected", () => {
        logger.info("db disconnected");
      });
    } catch (error) {
      logger.error("failed to connect db", { error });
    }
  }
}
