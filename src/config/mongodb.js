import { ServerApiVersion, MongoClient } from 'mongodb'
import { env } from './environment'
let dbtrelloInstance = null
const mongodbClientInstace = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})

export const CONNECT_DB = async () => {
    await mongodbClientInstace.connect()
    dbtrelloInstance = mongodbClientInstace.db(env.DATABASE_NAME)
}
export const GET_DB = () => {
    if (!dbtrelloInstance) throw new Error('connect database first')
    return dbtrelloInstance
}
export const CLOSE_DB = () => {
    mongodbClientInstace.close()
}