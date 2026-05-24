import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/appprotime';

async function run() {
  try {
    await mongoose.connect(DATABASE_URI);
    const db = mongoose.connection.db;
    if (!db) return;
    
    const userId = "6a10640573d029d647714da9";
    const todos = await db.collection('todos').find({ userId: new mongoose.Types.ObjectId(userId) }).toArray();
    console.log('--- USER TODOS ---');
    console.log(todos.map(t => ({ title: t.title, priority: t.priority, status: t.status })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
