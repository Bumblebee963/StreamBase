import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app=express()

app.use(cors({
    origin: process.nextTick.CORS_ORIGIN,
    credentials: true
}))

// data from json
app.use(express.json({
    limit: "16kb"
}))

// data from url
app.use(express.urlencoded({
    limit: "16kb",
    encoded : true
}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'

//route declaration
app.use('/api/v1/users',userRouter)
 export {app}