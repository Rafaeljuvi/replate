require ('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express()
const PORT = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

//Route
app.get('/', (req, res) => {
    res.json({message: 'API Running Succesfully'});
});

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
