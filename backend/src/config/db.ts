import { Db, MongoClient } from 'mongodb'

let mongoClient: MongoClient | null = null
let cachedDb: Db | null = null

export const getMongoClient = async (): Promise<MongoClient> => {
  if (mongoClient) return mongoClient
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/simplon_form'
  mongoClient = new MongoClient(uri)
  await mongoClient.connect()
  return mongoClient
}

export const getDb = async (): Promise<Db> => {
  if (cachedDb) return cachedDb
  const client = await getMongoClient()
  cachedDb = client.db()
  return cachedDb
}



