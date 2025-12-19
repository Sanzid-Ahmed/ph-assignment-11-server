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
    const requestsCollection = database.collection("requests");
    const assignedAssetsCollection = database.collection("assignedAssets");
    const employeeAffiliationsCollection = database.collection("employeeAffiliations");










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

    app.get('/users/:email', async(req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send(user)
    })

    // get all employeeAffiliationsCollection under 1 HR
    app.get('/employees/:email', async (req, res) => {
      const email = req.params.email;
      const employees = await employeeAffiliationsCollection.find({ hrEmail: email }).toArray();
      res.send(employees);
    });
    // delete employee of HR
    app.delete('/employees/:email', async (req, res) => {
  const employeeEmail = req.params.email; // this is a string
  try {
    const result = await employeeAffiliationsCollection.deleteOne({ employeeEmail });

    if (result.deletedCount === 1) {
      res.send({ success: true, message: 'Employee deleted successfully' });
    } else {
      res.status(404).send({ success: false, message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Failed to delete employee' });
  }
});


    







    // Create a new asset request
    app.post("/requests", verifyFBToken, async (req, res) => {
        const requestData = req.body;
        requestData.requestDate = new Date();
        requestData.approvalDate = null;
        requestData.requestStatus = "pending";
        requestData.processedBy = "null";


        const result = await requestsCollection.insertOne(requestData);

        res.send(result);
  
    })
    // get asset request
    app.get('/requests/:email', async (req, res) => {
      const email = req.params.email;
      const assets = await requestsCollection.find({ hrEmail: email,
      }).toArray();
      res.send(assets);
    })

    app.patch("/requests/approve/:id", verifyFBToken, async (req, res) => {
  const requestId = req.params.id;
  const {
    assetId,
    employeeEmail,
    employeeName,
    hrEmail,
    companyName,
    companyLogo,
  } = req.body;

  // 1️⃣ Find the asset
  const asset = await assetsCollection.findOne({ _id: new ObjectId(assetId) });
  if (!asset) {
    return res.status(404).send({ message: "Asset not found" });
  }

  if (asset.availableQuantity <= 0) {
    return res.status(400).send({ message: "Asset out of stock" });
  }

  // 2️⃣ Decrease available quantity
  await assetsCollection.updateOne(
    { _id: new ObjectId(assetId) },
    { $inc: { availableQuantity: -1 } }
  );

  // 3️⃣ Update request status
  await requestsCollection.updateOne(
    { _id: new ObjectId(requestId) },
    {
      $set: {
        requestStatus: "approved",
        approvedAt: new Date(),
        approvedBy: hrEmail,
      },
    }
  );

  // 4️⃣ Assign asset to employee
  const assignedAsset = {
    assetId: new ObjectId(assetId),
    requestId: new ObjectId(requestId),
    assetName: asset.productName,
    assetImage: asset.productImage,
    employeeEmail,
    employeeName,
    hrEmail,
    companyName,
    companyLogo,
    assignedAt: new Date(),
    status: "assigned",
    returnable: asset.productType === "Returnable",
  };

  await assignedAssetsCollection.insertOne(assignedAsset);


  const affiliation = await employeeAffiliationsCollection.findOne({ employeeEmail, hrEmail });
  if (!affiliation) {
    await employeeAffiliationsCollection.insertOne({
      employeeEmail,
      employeeName,
      hrEmail,
      companyName,
      companyLogo,
      assignedAt: new Date()
    });
  }

  res.send({
    success: true,
    message: "Request approved & asset assigned",
  });
    });






    // Asset related APIs-------------------------------------
    // Add Assets
    app.post('/assets', verifyFBToken, async (req, res) => {
      const asset = req.body;
      asset.createdAt = new Date();

      const result = await assetsCollection.insertOne(asset);
      res.send(result);
    })

    app.get('/assets', async (req, res) => { 
      const allAssets = assetsCollection.find(); 
      const assets = await allAssets.toArray(); 
      res.send(assets); 
    })

    app.get('/assets/hr/:email', async (req, res) => {
      const email = req.params.email;
      const assets = await assetsCollection.find({ hrEmail: email }).toArray();
      res.send(assets);
    })

    app.get('/assets/:id', verifyFBToken, async (req, res) => {
  try {
    const id = req.params.id;

    const asset = await assetsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!asset) {
      return res.status(404).send({ message: "Asset not found" });
    }

    res.send(asset);
  } catch (error) {
    res.status(500).send({ message: "Failed to get asset" });
  }
    })
    // Delete an asset by ID
    app.delete('/assets/:id', async (req, res) => {
      const { id } = req.params;
      const result = await assetsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 1) {
        res.send({ success: true, message: 'Asset deleted successfully' });
      } else {
        res.status(404).send({ success: false, message: 'Asset not found' });
      }
    })
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
    })




















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
