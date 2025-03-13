require('dotenv').config();
const express = require('express');
const uploadRoutes = require('./routes/uploadRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/upload', uploadRoutes);
app.use('/download', downloadRoutes);

app.get('/', (req, res) => {
    res.send("MEGA Storage API is running...");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
