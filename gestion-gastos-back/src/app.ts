import express from 'express'; // Importing the express module
import 'reflect-metadata';
import { usuarioRouter } from './usuarioPrueba/usuario.routes.js';
// import { characterClassRouter } from './character/characterClass.routes.js'
// import { itemRouter } from './character/item.routes.js'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express(); // Creating an express app

// Create a route that sends a response when visiting the homepage
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use("/api/usuario", usuarioRouter);

app.use((_ , res) => {
  res.status(404).send({message: 'Resource not found'})
});
// Set up the server to listen on port 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});