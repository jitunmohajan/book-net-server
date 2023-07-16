require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = process.env.DB_CONNECTION_MONGODB;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('book-net');
    const bookCollection = db.collection('book');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });
    
    app.get('/recent-books', async (req, res) => {
      const cursor = bookCollection.find().sort({ timestampField: -1 }).limit(10);
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    app.get('/search-books', async (req, res) => {
      const search = req.body;
      const cursor = bookCollection.find(search);
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });

    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post('/add-new-book', async (req, res) => {
      // const bookId = req.params.id;
      const newBook = req.body;
      
      console.log(newBook);

      const result = await bookCollection.insertOne(newBook, { timestamp:true});

      console.log(result);

      res.json({ 
        "success": true, 
        "statusCode":200,
        "message": "Book created successfully",
        data: result
      });
    });

    app.get('/review/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'book not found' });
      }
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Book-net backend is running successfully!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
