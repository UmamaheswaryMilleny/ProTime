import mongoose from "mongoose";
import { config } from "../../../shared/config.js";
export class MongoConnect {
  private _dburl: string;
  constructor() {
    this._dburl = config.database.URI;
  }
  async connectDB() {
    try {
      await mongoose.connect(this._dburl);
      console.log("db connected successsfully");
      mongoose.connection.on("error", (error) => {
        console.log("mongoDb connection error", error);
      });
      mongoose.connection.on("disconnected", () => {
        console.log("mongoDb disconnected");
      });
    } catch (error) {
      console.log("failed to connect mongoDB", error);
    }
  }
}