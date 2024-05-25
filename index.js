const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
      console.log(token)
      res.send({ token });
    });
    //API to store newly logged in user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await UsersCollection.findOne(query);
      if (existingUser) {
       return res.send({ message: "user is already exist", insertedId: null });
      }
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    });
    //API to decrease Coin
    app.post('/updateCoin',async(req,res)=>{
      const {userId} = req.body;
    const result = await UsersCollection.findOneAndUpdate({_id: new ObjectId(userId)},{
      $inc:{coins: -10}
    })
    res.send(result)
    })
    //API to store all the recipe
    app.post('/allRecipe',async(req,res)=>{
      const recipes = req.body;
      const result = await AllrecipeCollection.insertOne(recipes);
      res.send(result)
    });
//API to  get specific recipe fields 
app.get('/recipes',async(req,res)=>{
  const projection = {name:1,photo:1,purchased_by:1,authorEmail:1,country:1}
  const result = await AllrecipeCollection.find({},{projection}).toArray();
  res.send(result);

})
//API to get All Recipes details
app.get('/allRecipes/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await AllrecipeCollection.find(query).toArray()
  res.send(result);
})
//API to get specific user data based on email
app.get('/user/:email',async(req,res)=>{
  const UserEmail = req.params.email;
  const query= {email:UserEmail}
  const result = await UsersCollection.findOne(query)
  res.send(result);
})





  } finally {
  }
}
run().catch(console.dir);

//testing server msg
app.get("/", async (req, res) => {
  res.send("Bake server is running");
});

app.listen(port, () => console.log(`Bake server is running at ${port}`));
