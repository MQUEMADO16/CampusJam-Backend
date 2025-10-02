const express = require('express');
const app = express();
app.use(express.json());

// Start the server
const PORT = proccess.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));