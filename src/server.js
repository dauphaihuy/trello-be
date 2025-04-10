
import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import { env } from '~/config/environment'
import { CONNECT_DB } from './config/mongodb'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from './config/cors'
import cookieParser from 'cookie-parser'
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
    // Test Absolute import mapOrder
    // console.log(mapOrder(
    //   [{ id: 'id-1', name: 'One' },
    //   { id: 'id-2', name: 'Two' },
    //   { id: 'id-3', name: 'Three' },
    //   { id: 'id-4', name: 'Four' },
    //   { id: 'id-5', name: 'Five' }],
    //   ['id-5', 'id-4', 'id-2', 'id-3', 'id-1'],
    //   'id'
    // ))
    res.end('<h1>Hello World!</h1><hr>')
  })
  app.use(express.json())
  app.use('/v1', APIs_V1)
  app.use(errorHandlingMiddleware)
  app.listen(env.HOST_NUMBER, env.HOST_NAME, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Trung Quan Dev, I am running at ${env.HOST_NAME}:${env.HOST_NUMBER}/`)
  })
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
