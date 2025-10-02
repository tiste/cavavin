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
      .sort({ createdAt: -1 })
      .toArray();

    return wines
      .map((wine) => this.mapWine(wine))
      .sort((a, b) => {
        if ((a.quantity || 0) === 0 && (b.quantity || 0) !== 0) return 1;
        if ((a.quantity || 0) !== 0 && (b.quantity || 0) === 0) return -1;
        return 0;
      });
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
      quantity: wine.quantity || 1,
      id: nanoid(),
      createdAt: new Date() as unknown as string,
      updatedAt: new Date() as unknown as string,
    });
  }

  async update(id: string, { updatedAt: _, ...wine }: Wine) {
    await this.mongo.db.collection<Wine>("wines").updateOne(
      {
        id: id,
      },
      {
        $set: {
          ...wine,
          createdAt: new Date(wine.createdAt) as unknown as string,
        },
        // @ts-ignore
        $currentDate: { updatedAt: true },
      },
      { upsert: true },
    );
  }

  async delete(id: string) {
    await this.mongo.db.collection<Wine>("wines").deleteOne({
      id: id,
    });
  }

  async refresh() {
    const wines = await this.getAll();

    const updates = wines.map(async (wine) => {
      const updatedWine = await this.getWineFromUrl(wine.url);
      if (updatedWine) {
        await this.update(wine.id, { ...wine, ...updatedWine });
      }
    });

    await Promise.all(updates);
  }

  private async getWineFromUrl(url: string): Promise<Partial<Wine> | null> {
    const fullUrl = "http" + (url.split("http")[1] || "");

    const response = await fetch(fullUrl, {
      headers: {
        "Accept-Language": "fr",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch wine from URL");
    }
    const html = await response.text();
    const jsonPattern =
      /<script[^>]*type="application\/json"[^>]*data-component-name="WinePageTopSection"[^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(jsonPattern);
    if (!match) return null;

    const data = JSON.parse(match[1].trim());

    const pageInformation = data.pageInformation;
    return {
      name: pageInformation.vintage.wine.name,
      year: pageInformation.vintage.year,
      url: fullUrl,
      estimatedPrice: pageInformation.price?.amount || null,
      tastes: (pageInformation.tastes?.flavor || [])
        .filter(
          (_: { primary_keywords: { name: string }[] }, i: number) => i < 3,
        )
        .flatMap((f: { primary_keywords: { name: string }[] }) =>
          (f.primary_keywords || [])
            .filter((_, i) => i < 3)
            .flatMap((k) => k.name),
        ),
      foods: (pageInformation.wine?.foods || []).flatMap(
        (f: { name: string }) => f.name,
      ),
      region: pageInformation.vintage.wine.region.name,
      winery: pageInformation.vintage.wine.winery.name,
      grapes: (pageInformation.vintage?.grapes || []).flatMap(
        (g: { name: string }) => g.name,
      ),
      imageUrl: pageInformation.vintage.image.variations.bottle_medium
        ? "https:" + pageInformation.vintage.image.variations.bottle_medium
        : null,
      color: pageInformation.vintage.wine.style?.wine_type_id
        ? pageInformation.vintage.wine.style.wine_type_id === 1
          ? "Rouge"
          : pageInformation.vintage.wine.style.wine_type_id === 2
            ? "Blanc"
            : pageInformation.vintage.wine.style.wine_type_id === 3
              ? "Champagne"
              : pageInformation.vintage.wine.style.wine_type_id === 4
                ? "Rosé"
                : null
        : null,
      structure: {
        acidity: pageInformation.tastes?.structure?.acidity || null,
        fizziness: pageInformation.tastes?.structure?.fizziness || null,
        intensity: pageInformation.tastes?.structure?.intensity || null,
        sweetness: pageInformation.tastes?.structure?.sweetness || null,
        tannin: pageInformation.tastes?.structure?.tannin || null,
      },
    };
  }

  private mapWine({ _id: _, ...wine }: WithId<Wine>): Wine {
    return {
      ...wine,
      createdAt: dayjs(wine.createdAt).toISOString(),
      updatedAt: dayjs(wine.updatedAt).toISOString(),
    };
  }
}
