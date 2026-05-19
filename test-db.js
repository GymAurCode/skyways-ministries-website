import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB, getMaskedURI } from "./api/lib/db.js";

// Load environment variables from .env
dotenv.config();

console.log("====================================================");
console.log("🛠️  MongoDB Connection Diagnostics Test Script");
console.log("====================================================");

const rawURI = process.env.MONGODB_URI;
if (!rawURI) {
  console.error("❌ FAILED: MONGODB_URI environment variable is not defined in your .env file!");
  console.log("Please define MONGODB_URI in your .env file before running this script.");
  process.exit(1);
}

console.log(`📡 Target URI: ${getMaskedURI(rawURI)}`);
console.log("⏳ Connecting...");

async function runTest() {
  try {
    const conn = await connectDB();
    console.log("====================================================");
    console.log("🎉 SUCCESS: MongoDB Connected");
    console.log(`   Host:      ${conn.connection.host}`);
    console.log(`   Port:      ${conn.connection.port}`);
    console.log(`   DB Name:   ${conn.connection.name}`);
    console.log("====================================================");
    
    // Close connection cleanly after successful test
    await mongoose.disconnect();
    console.log("Disconnected test connection cleanly. Diagnostic Test Passed! ✅");
    process.exit(0);
  } catch (err) {
    console.error("====================================================");
    console.error(`❌ FAILED: ${err.message || err}`);
    console.error("====================================================");
    
    // The db.js module already outputs the detailed diagnostic advice panel, so exit immediately.
    process.exit(1);
  }
}

runTest();
