import { Wine } from "@/domain/wine";
import { connectToDatabase, Mongo } from "@/lib/mongo";
import { WithId } from "mongodb";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

export class WineRepository {
  private static instance: WineRepository;

  static async getInstance(): Promise<WineRepository> {
    if (!WineRepository.instance) {
      const mongo = await connectToDatabase();
      WineRepository.instance = new WineRepository(mongo);
    }
    return WineRepository.instance;
  }

  private constructor(private readonly mongo: Mongo) {}

  async getAll(): Promise<Wine[]> {
    const wines = await this.mongo.db
      .collection<Wine>("wines")
      .find({})
      .toArray();

    return wines.map((wine) => this.mapWine(wine));
  }

  async getOne(id: string): Promise<Wine | null> {
    const wine = await this.mongo.db
      .collection<Wine>("wines")
      .findOne({ id: id });

    if (!wine) {
      return null;
    }

    return this.mapWine(wine);
  }

  async create(wine: Wine) {
    await this.mongo.db.collection<Wine>("wines").insertOne({
      ...wine,
      id: nanoid(),
      createdAt: new Date(wine.createdAt) as unknown as string,
    });
  }

  async update(id: string, r: Wine) {
    await this.mongo.db.collection<Wine>("wines").updateOne(
      {
        id: id,
      },
      {
        $set: { ...r, createdAt: new Date(r.createdAt) as unknown as string },
      },
      { upsert: true },
    );
  }

  async delete(id: string) {
    await this.mongo.db.collection<Wine>("wines").deleteOne({
      id: id,
    });
  }

  private mapWine(wine: WithId<Wine>): Wine {
    return {
      ...wine,
      createdAt: dayjs(wine.createdAt).format("YYYY-MM-DD"),
    };
  }
}
