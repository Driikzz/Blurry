import express, { Request, Response } from "express";

const app = express();
const userRouter = require("./routes/users.routes");



async function main() {

  app.get("/", (request: Request, response: Response) => { 
    response.status(200).send("Hello World");
  }); 

  app.use("/users",userRouter)


  app.listen(3000, () => { 
     console.log("Server running at PORT: ", 3000); 
  }).on("error", (error) => {
    throw new Error(error.message);
  });

}

main()
