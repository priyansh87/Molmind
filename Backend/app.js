import express, { urlencoded } from "express" 
import cors from "cors" 
import cookieParser from "cookie-parser"
import dotenv from "dotenv" 
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.routes.js";
import projectRoute from "./routes/project.routes.js"



dotenv.config({}) ;



const app = express() 

app.get("/" , (req , res )=>{
    return res.status(200).json({
        message : "i am coming from backend!!! " , 
        success : true 
    })
})


app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended : true}))

const corsOptions = {
    origin: "http://localhost:3000", 
    credentials: true,
}


app.use(cors(corsOptions)) ;

app.use("/users" , userRoute ) ; 
app.use("/projects" , projectRoute ) ;


connectDB()
.then(()=>{

    app.on("error" , (error )=>{
        console.error("server could not be connected to mongodb") ; 
        process.exit(1) ;
    })

    app.listen( process.env.PORT ||8000, ()=>{
        console.log(`server is running on port : ${process.env.port}`)
    })
})
.catch((err)=>{
    console.log("mongo db connection failed !!! " , err) ;
})