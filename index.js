const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.efsdsdy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
    try{
        const allPostsCollection = client
        .db("Mybook")
        .collection("allPosts");

        const usersCollection = client
        .db("Mybook")
        .collection("users");

        app.get('/allposts', async(req, res) => {
            const query = {};
            const posts = await allPostsCollection.find(query).toArray();
            res.send(posts);
        });

        app.post("/allposts", async (req, res) => {
            const post = req.body;
            const result = await allPostsCollection.insertOne(post);
            res.send(result);
        });

        app.get('/allposts/:id', async(req, res) =>{
          const id = req.params.id;
          const filter = { _id: ObjectId(id) };
          const result = await allPostsCollection.find(filter).toArray();
          res.send(result);
        })

        app.put("/allposts/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const post = await allPostsCollection.findOne(filter);
            const react = await post.react;
            const newReact = await react + 1;
            const option = { upsert: true };
            const updatedDoc = {
              $set: {
                react: newReact
              },
            };
            const result = await allPostsCollection.updateOne(
              filter,
              updatedDoc,
              option
            );
            res.send(result);
        });

        app.get('/allposts/:id/comments', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const post = await allPostsCollection.findOne(filter);
            const comments = await post.comments;
            res.send(comments);
        });

        app.put('/allposts/:id/comments', async(req, res) => {
          const id = req.params.id;
          const comment = req.body;
          const filter = { _id: ObjectId(id) };
          const post = await allPostsCollection.findOne(filter);
          const comments = post.comments;
          const newComments = [...comments, comment];
          const option = { upsert: true };
            const updatedDoc = {
              $set: {
                comments: newComments
              },
            };
            const result = await allPostsCollection.updateOne(
              filter,
              updatedDoc,
              option
            );
            res.send(result);

        });

        app.post("/users", async (req, res) => {
          const user = req.body;
          console.log("user is called")
          const result = await usersCollection.insertOne(user);
          res.send(result);
        });


    }
    finally{

    }
}
run().catch(console.log());

app.get('/', (req, res) => {
    res.send('Mybook Server is Running')
});

app.listen(port, ()=> {
    console.log(`Mybook serve is running on port ${port}`)
})