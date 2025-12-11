const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors');
const { ObjectId } = require('mongodb');




const port = process.env.PORT || 5000;



app.use(express.json());





app.get('/', (req, res) => {
  res.send('AssetVerse Server is running! Status: OK');
});


app.use((req, res, next) => {
    res.status(404).send({ message: 'Resource Not Found' });
});

app.listen(port, () => {
  console.log(`AssetVerse Server listening on port ${port}`);
});