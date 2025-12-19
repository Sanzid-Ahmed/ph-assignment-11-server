// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const crypto = require("crypto");
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 3000;

// Firebase Admin Setup
const serviceAccount = require("./assetverse-86357-firebase-adminsdk-fbsvc-1ff1cb7421.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cynajx1.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Helper: Generate tracking ID
function generateTrackingId() {
  const prefix = "PRCL";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${date}-${random}`;
}

// Verify Firebase Token Middleware
const verifyFBToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send({ message: "Unauthorized access" });

  try {
    const idToken = token.split(" ")[1]; // Expect format "Bearer <token>"
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.decoded_email = decoded.email;
    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
};

// Main Function
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");











    
    const database = client.db("assetverseDB");
    const usersCollection = database.collection("users");
    const assetsCollection = database.collection("assets");









    // HR Registration
    app.post('/register-hr', verifyFBToken, async(req, res) => {
      const user = req.body;
      user.role = 'hr';
      user.createdAt = new Date();

      const email = user.email;
      const userExist = await usersCollection.findOne({email})

      if(userExist){
        return res.send({message: 'user exist'})
      }


      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // Employee Registration
    app.post('/register-employee', verifyFBToken, async(req, res) => {
      const user = req.body;
      user.role = 'employee';
      user.createdAt = new Date();

      const email = user.email;
      const userExist = await usersCollection.findOne({email})

      if(userExist){
        return res.send({message: 'user exist'})
      }


      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    app.get('/users/:email/role', async(req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({role: user?.role || 'user'})
    })





    // Asset related APIs-------------------------------------
    // Add Assets
    app.post('/assets', verifyFBToken, async (req, res) => {
      const asset = req.body;
      asset.createdAt = new Date();

      const result = await assetsCollection.insertOne(asset);
      res.send(result);
    })

    app.get('/assets/hr/:email', async (req, res) => {
      const email = req.params.email;
      const assets = await assetsCollection.find({ hrEmail: email }).toArray();
      res.send(assets);
    });

    // Delete an asset by ID
    app.delete('/assets/:id', async (req, res) => {
      const { id } = req.params;
      const result = await assetsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        res.send({ success: true, message: 'Asset deleted successfully' });
      } else {
        res.status(404).send({ success: false, message: 'Asset not found' });
      }
    });

    // Update asset
    app.put('/assets/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const result = await assetsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 1) {
        res.send({ success: true, message: 'Asset updated successfully' });
      } else {
        res.status(404).send({ success: false, message: 'Asset not found' });
      }
    });





















    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connection is active!");
  } finally {
    // await client.close(); // Keep connection alive for server
  }
}

run().catch(console.dir);

// Test Route
app.get("/", (req, res) => {
  res.send("AssetVerse Server is running!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
