import express from 'express';
import http from 'http';
import { connectDb } from './config/db';
import envVars from './config/envVars';
import logger from 'jet-logger';
import docRouter from './routers/document';
import authRouter from './routers/auth';
import uploadRouter from './routers/upload'
import VoiceService from './services/voice';
import SocketService from './services/socket';
import Session from 'express-session'
import MongoStore from 'connect-mongo';
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set('trust proxy', 1)
app.use(cors({
  origin: [envVars.CLIENT_BASE_URL], // e.g., 'http://localhost:3000'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}))
console.log('My cors origin points to ->', envVars.CLIENT_BASE_URL)
app.use(Session({ 
    name: 'ai-classroom-session',
    secret: envVars.APP_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        collectionName: 'sessions',
        dbName: envVars.DB_NAME,
        mongoUrl: envVars.DB_URL,
    }),
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
}))

app.get('/wake', (req, res)=>{
    res.send('I am awake')
})
app.use('/upload', uploadRouter)
app.use('/docs', docRouter)
app.use('/auth', authRouter)

//this server is hosted on render and render server sleeps after 15 muntes of inactivity, this function keeps it awake to aid ws connection
// setTimeout(()=>{
//     fetch(envVars.APP_BASE_URL + '/wake')
//     .then(res=>{
//         console.log('App is awake')
//     })
//     .catch(err=>{
//         console.log('App did not respond...')
//     })
// },14*60*1000)


function start() {

    connectDb()
    .then(()=>{
        const server = http.createServer(app)
        server.listen(envVars.PORT)
        server.on('listening', ()=>{
            logger.info(`server running on port ${(server.address() as {port: number}).port}...`)
            SocketService.useSocketServer(server)
        })
        VoiceService.loadVoicesToDB()
        .then(res=>{
            logger.info('Voices loaded successfully.')
        })
        .catch(err=>{
            logger.err('Failed to load voices')
        })
    })
}

start()