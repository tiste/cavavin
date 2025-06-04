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
    if (Object.keys(wine).length === 1 && wine.url) {
      wine = {
        ...wine,
        ...(await this.getWineFromUrl(wine.url)),
      };
    }

    await this.mongo.db.collection<Wine>("wines").insertOne({
      ...wine,
      quantity: wine.quantity || 0,
      id: nanoid(),
      createdAt: new Date() as unknown as string,
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

  private async getWineFromUrl(url: string): Promise<Partial<Wine> | null> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch wine from URL");
    }
    const html = await response.text();
    const jsonPattern =
      /<script[^>]*type="application\/json"[^>]*data-component-name="WinePageTopSection"[^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(jsonPattern);
    if (!match) return null;

    const data = JSON.parse(match[1].trim());

    return {
      name: data.vintage.wine.name,
      year: data.vintage.year,
      url: url,
      tastes: (data.pageInformation.tastes?.flavor || []).flatMap(
        (f: { primary_keywords: { name: string }[] }) =>
          (f.primary_keywords || []).flatMap((k) => k.name),
      ),
      foods: (data.pageInformation.wine?.foods || []).flatMap(
        (f: { name: string }) => f.name,
      ),
      region: data.vintage.wine.region.name,
      winery: data.vintage.wine.winery.name,
      grapes: (data.pageInformation.wine?.grapes || []).flatMap(
        (g: { name: string }) => g.name,
      ),
      imageUrl: data.vintage.image.variations.bottle_medium
        ? "https:" + data.vintage.image.variations.bottle_medium
        : null,

      //structure: {
      //         acidity: 4.020963,
      //         fizziness: null,
      //         intensity: 4.1428523,
      //         sweetness: 1.4378586,
      //         tannin: 3.8542342,
      //         user_structure_count: 205,
      //         calculated_structure_count: 126
      //       },

      // Léger
      // Puissant
      //
      // Souple
      // Tannique
      //
      // Sec
      // Moelleux
      //
      // Doux
      // Acide
    };
  }

  private mapWine({ _id: _, ...wine }: WithId<Wine>): Wine {
    return {
      ...wine,
      createdAt: dayjs(wine.createdAt).format("YYYY-MM-DD"),
    };
  }
}
