import { Wine } from "@/domain/wine";
import { connectToDatabase, Mongo } from "@/lib/mongo";
import { WithId } from "mongodb";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

export class WineRepository {
  private static instance: WineRepository;

  private readonly userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

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

  async create(wine: Wine & { htmlDom?: string }) {
    if (wine.htmlDom) {
      const wineData = this.parseWineHtmlContent(wine.htmlDom, wine.url);
      wine = {
        ...wine,
        ...wineData,
      };
      delete wine.htmlDom;
    } else if (Object.keys(wine).length === 1 && wine.url) {
      const wineData = await this.getWineFromUrl(wine.url);

      if (!wineData) {
        throw new Error(
          "Impossible de récupérer les données du vin. Le site a peut-être bloqué la requête. Veuillez réessayer dans quelques instants.",
        );
      }

      wine = {
        ...wine,
        ...wineData,
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

  async update(id: string, { updatedAt: _, ...wine }: any) {
    if (wine.htmlDom) {
      const wineData = this.parseWineHtmlContent(wine.htmlDom, wine.url);
      wine = {
        ...wine,
        ...wineData,
      };
      delete wine.htmlDom;
    }
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

  private parseWineHtmlContent(
    html: string,
    url: string,
  ): Partial<Wine> | null {
    try {
      const jsonPattern =
        /<script[^>]*type="application\/json"[^>]*data-component-name="WinePageTopSection"[^>]*>([\s\S]*?)<\/script>/i;
      const match = html.match(jsonPattern);
      if (!match) {
        console.warn(
          `⚠ Aucune donnée WinePageTopSection trouvée dans le HTML fourni.`,
        );
        return null;
      }
      const data = JSON.parse(match[1].trim());
      const pageInformation = data.pageInformation;
      return {
        name: pageInformation.vintage.wine.name,
        year: pageInformation.vintage.year,
        url: url,
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
    } catch (e) {
      console.error("Erreur lors du parsing du HTML Vivino :", e);
      return null;
    }
  }

  private async getWineFromUrl(
    url: string,
    retryCount: number = 0,
  ): Promise<Partial<Wine> | null> {
    const fullUrl = "http" + (url.split("http")[1] || "");
    const maxRetries = 5;

    if (retryCount > 0) {
      const retryDelay = this.getRandomDelay(3000, 8000);
      console.log(
        `⏱ Retry ${retryCount}/${maxRetries} après ${retryDelay}ms...`,
      );
      await this.sleep(retryDelay);
    } else {
      await this.sleep(this.getRandomDelay(500, 1500));
    }

    try {
      const response = await fetch(fullUrl, {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "User-Agent": this.getRandomUserAgent(),
        },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          if (retryCount < maxRetries) {
            console.warn(
              `⚠ HTTP ${response.status} - tentative ${retryCount + 1}/${maxRetries}`,
            );
            return this.getWineFromUrl(url, retryCount + 1);
          }
        }
        throw new Error(
          `Failed to fetch wine from URL: ${response.status} ${response.statusText}`,
        );
      }

      const html = await response.text();

      if (
        html.includes("challenge.js") ||
        html.includes("awswaf.com") ||
        html.includes("cf-challenge") ||
        html.includes("Just a moment")
      ) {
        console.warn(`🛡 WAF challenge détecté pour: ${fullUrl}`);

        if (retryCount < maxRetries) {
          return this.getWineFromUrl(url, retryCount + 1);
        }
        return null;
      }

      return this.parseWineHtmlContent(html, fullUrl);
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        console.warn(`⏱ Timeout pour: ${fullUrl}`);
        if (retryCount < maxRetries) {
          return this.getWineFromUrl(url, retryCount + 1);
        }
      }
      throw error;
    }
  }

  private mapWine({ _id: _, ...wine }: WithId<Wine>): Wine {
    return {
      ...wine,
      ...(wine.grapes ? wine.grapes : { grapes: [] }),
      ...(wine.tastes ? wine.tastes : { tastes: [] }),
      ...(wine.foods ? wine.foods : { foods: [] }),
      createdAt: dayjs(wine.createdAt).toISOString(),
      updatedAt: dayjs(wine.updatedAt).toISOString(),
    };
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private getRandomDelay(min: number = 2000, max: number = 5000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
