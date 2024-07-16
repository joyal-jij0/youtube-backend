import 'dotenv/config'
import connectDB from "./db/index.js"
import {app} from './app.js'


connectDB()
.then(() => [
    app.listen(process.env.PORT || 8001, () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    } )
])
.catch((error) => {
    console.log("Mongo DB connection failed !!", error)
})








/*
import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGOOSE_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR", error)
        throw error
    }
})()

*/