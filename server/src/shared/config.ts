import dotenv from "dotenv"
dotenv.config()

export const config = {
  server: {
    PORT: process.env.PORT || 3000,
  },

  client : {
    URI : process.env.CLIENT_URI
  },

  database: {
    URI: process.env.DATABASEURI || "mongodb://127.0.0.1:27017/ProTimeApp",
  },

  jwt: {
    ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY || "",
    ACCESS_EXPIRES_IN: process.env.ACCESS_EXPIRES_IN || "15m",

    REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY || "",
    REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || "7d",

    RESET_SECRET_KEY: process.env.RESET_SECRET_KEY || "",
    RESET_EXPIRES_IN: process.env.RESET_EXPIRES_IN || "15m",

  },
  email:{
    EMAIL:process.env.EMAIL as string,
    PASSWORD:process.env.EMAIL_PASSWORD as string,
  },
  
};