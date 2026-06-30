//Flow of execution
//Imports packages
//Loads environment variables
//Connects MongoDB
//Creates Express app
//Adds middleware
//Adds routes
//Starts server

const express=require("express")
const dotenv=require("dotenv")
const cors = require("cors");

//importing the connectDB function to connect to MongoDB
const connectDB=require("./config/db")
dotenv.config()
connectDB();
const app=express()
//middleware to parse JSON bodies in requests without this, req.body will be undefined for JSON requests
app.use(cors())
app.use(express.json())
// using the user routes for any requests to /api/users this will route the requests to the appropriate controller functions defined in userRoutes.js
app.use("/api/users",require("./routes/userRoutes"))
app.get("/",(req,res)=>{
    res.send("API is running")
})
app.use("/api/posts",require("./routes/postRoutes"))
app.use(
  "/api/upload",
  require("./routes/uploadRoutes")
);
app.use("/api/roadmap",require("./routes/roadmapRoutes"))
app.use("/api/match",require("./routes/matchRoutes"))
app.use("/api/projects",require("./routes/projectRoutes"))
//starting the server on the specified PORT environment variable or defaulting to 5000 if not set
const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})