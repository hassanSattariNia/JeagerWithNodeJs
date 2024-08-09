// index.js
const express = require('express');
const userRouter = require('./userRouter'); // Import the userRouter

const app = express();
const port = 3000;

app.use('/user', userRouter); // Mount the userRouter at /user

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
