import { Db, MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGO_URL!
    : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = "cavavin";

export type Mongo = { client: MongoClient; db: Db };

export async function connectToDatabase(): Promise<Mongo> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (!global.mongo) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.mongo = await MongoClient.connect(MONGODB_URI).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return global.mongo;
}
