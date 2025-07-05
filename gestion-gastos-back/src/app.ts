import express from 'express'; // Importing the express module
const app = express(); // Creating an express app

// Create a route that sends a response when visiting the homepage
app.use(express.json());


app.use((_ , res) => {
  res.status(404).send({message: 'Resource not found'})
});
// Set up the server to listen on port 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});