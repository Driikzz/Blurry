import express, { Request, Response } from "express";

const app = express();

app.get("/", (request: Request, response: Response) => { 
  response.status(200).send("Hello World");
}); 

app.listen(3000, () => { 
  console.log("Server running at PORT: ", 3000); 
}).on("error", (error) => {
  throw new Error(error.message);
});