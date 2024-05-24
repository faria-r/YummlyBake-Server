const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxeycza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const AllrecipeCollection = client
      .db("YummlyBakes")
      .collection("allRecipes");
    const UsersCollection = client.db("YummlyBakes").collection("users");

    //JWT token for user
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "8h",
      });
      res.send({ token });
    });
    //API to store newly logged in user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await UsersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user is already exist", insertedId: null });
      }
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

//testing server msg
app.get("/", async (req, res) => {
  res.send("Bake server is running");
});

app.listen(port, () => console.log(`Bake server is running at ${port}`));
