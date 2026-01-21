require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const app = express()
const PORT = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api', storeRoutes);

//API check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API is running succesfully',
        timestamp: new Date().toISOString()
    });
});

//404 handler
app.use((req,res) =>{
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
})

//Error handler
app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
