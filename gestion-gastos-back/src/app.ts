import express from "express"; // Importing the express module
import cors from "cors"; // Importing CORS middleware
import "reflect-metadata";
import { userRouter } from "./User/user.routes.js";
import { categoryRouter } from "./Category/category.routes.js";
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from "@mikro-orm/core";

const app = express(); // Creating an express app

// Create a route that sends a response when visiting the homepage
app.use(express.json());

// Configuración más específica (recomendada)
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    // credentials: true
  })
);

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
  next();
});

app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);

app.use((_, res) => {
  res.status(404).send({ message: "Resource not found" });
});
// Set up the server to listen on port 3001
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
