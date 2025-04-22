
import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import { env } from '~/config/environment'
import { CONNECT_DB } from './config/mongodb'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'
const START_SEVER = () => {
  const app = express()
  app.use(cors(corsOptions))
  // Fix cái vụ Cache from disk của ExpressJS
  // https://stackoverflow.com/q/532340717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next();
  })
  app.use(cookieParser())
  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })
  app.use(express.json())
  app.use('/v1', APIs_V1)
  app.use(errorHandlingMiddleware)
  // tạo 1 server bọc app của express làm realtime với socketio
  const server = http.createServer(app)
  //khởi tạo biến io
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    console.log(socket.id)
    inviteUserToBoardSocket(socket)
  })
  if (env.BUILD_MODE === 'production') {
    server.listen(env.HOST_NUMBER, env.HOST_NAME, () => {
      // eslint-disable-next-line no-console
      console.log(`production, I am running at ${env.HOST_NAME}:${env.HOST_NUMBER}/`)
    })

  } else {
    server.listen(env.HOST_NUMBER, env.HOST_NAME, () => {
      // eslint-disable-next-line no-console
      console.log(`local, I am running at ${env.HOST_NAME}:${env.HOST_NUMBER}/`)
    })
  }
}
(async () => {
  try {
    console.log('1.connecting to db')
    await CONNECT_DB()
    console.log('2.connected to db')
    START_SEVER()
  } catch (error) {
    console.log('error', error)

  }

})()
