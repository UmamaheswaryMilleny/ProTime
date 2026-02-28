import mongoose from "mongoose";
import { config } from "../../shared/config/index";

export class MongoConnect {
  private _dburl: string;
  constructor() {
    this._dburl = config.database.URI;
  }
  async connectDB() {
    try {
      await mongoose.connect(this._dburl);
      console.log("db connected");
      mongoose.connection.on("error", (error) => {
        console.log("db connection error", error);
      });
      mongoose.connection.on("disconnected", () => {
        console.log("db disconnected");
      });
    } catch (error) {
      console.log("failed to connect db", error);
    }
  }
}
