import dns from "node:dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== 'production',
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000
  });

  console.log(
    `MongoDB connected: ${mongoose.connection.name}`
  );
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}