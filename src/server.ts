import express, { Response, Request } from "express";

import { createClient } from "@vercel/postgres";
import { BASE_URL, PORT, PORT3 } from "./config/config";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors"
import path from "path";

const app = express()
const server =  createServer(app)
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET", "POST"]
    }
})


const client = createClient({
    connectionString: BASE_URL
})

client.connect()
app.use(cors({
    origin:"*",
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

io.on("connection",(socket) => {
    console.log("bella fra")
    socket.on("message-sent", (message)=>{
        client.query("INSERT INTO messages (content) VALUES($1)",[message],
            (error)=>{
                if(!error)io.emit("message-received",message)
            }
        )
        console.log(message)
        io.emit("message-recived", message)
    })
    socket.on("disconnect", ()=>{
        console.log("server disconnect")
    })
})

app.get("/", (req: Request, res: Response)=>{
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/api/messages", (requirement: Request,response:Response)=>{
   client.query("SELECT * FROM messages",(err,res)=>{
        err ? response.status(400).json({err}) : response.status(200).json(res.rows)
    })
})

app.post("/api/messages", async (requirement: Request,response:Response)=> {
client.query("INSERT INTO messages (content) VALUES ($1)",[requirement.body.content],
    (err,res)=>{ err ? response.status(500).json({message: err}) :
     response.status(200).json({message: "Update Data"})})

})


server.listen(PORT3),()=>{
    console.log("Server is running in http://localhost:"+PORT3)
}
