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

  private parseVivinoVintageId(input: string): { vintageId: string | null; cleanUrl: string | null } {
    const urlMatch = input.match(/https?:\/\/(?:www\.)?vivino\.com\/\S+/);
    if (!urlMatch) {
      console.warn(`[Vivino] Aucune URL Vivino trouvée dans: "${input}"`);
      return { vintageId: null, cleanUrl: null };
    }

    try {
      const parsed = new URL(urlMatch[0]);
      const match = parsed.pathname.match(/^\/wines\/(\d+)/);
      if (!match) {
        console.warn(`[Vivino] Format d'URL non supporté (attendu /wines/{id}): ${urlMatch[0]}`);
        return { vintageId: null, cleanUrl: null };
      }
      const cleanUrl = `${parsed.origin}${parsed.pathname}`;
      return { vintageId: match[1], cleanUrl };
    } catch (e) {
      console.error(`[Vivino] Impossible de parser l'URL: ${urlMatch[0]}`, e);
      return { vintageId: null, cleanUrl: null };
    }
  }

  private async getWineFromUrl(url: string): Promise<Partial<Wine> | null> {
    const { vintageId, cleanUrl } = this.parseVivinoVintageId(url);

    if (!vintageId || !cleanUrl) {
      return null;
    }

    const apiHeaders = {
      "User-Agent": this.getRandomUserAgent(),
      "Accept-Language": "fr-FR,fr;q=0.9",
    };

    try {
      console.log(`[Vivino] Fetching vintage ${vintageId}...`);
      const res = await fetch(
        `https://www.vivino.com/api/vintages/${vintageId}`,
        { headers: apiHeaders, signal: AbortSignal.timeout(10000) },
      );

      if (!res.ok) {
        console.error(`[Vivino] vintage ${vintageId}: HTTP ${res.status} ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      const vintage = data.vintage;
      console.log(`[Vivino] Vintage récupéré: ${vintage.name} (${vintage.year || "NV"})`);

      let estimatedPrice: number | null = null;
      try {
        console.log(`[Vivino] Fetching price for vintage ${vintageId}...`);
        const exploreRes = await fetch(
          `https://www.vivino.com/api/explore/explore?vintage_ids[]=${vintageId}&min_rating=1`,
          { headers: apiHeaders, signal: AbortSignal.timeout(10000) },
        );
        if (exploreRes.ok) {
          const exploreData = await exploreRes.json();
          const price = exploreData.explore_vintage?.matches?.[0]?.price;
          estimatedPrice = price?.amount ?? null;
          console.log(`[Vivino] Prix: ${estimatedPrice ?? "non disponible"}`);
        } else {
          console.warn(`[Vivino] Prix: HTTP ${exploreRes.status} ${exploreRes.statusText}`);
        }
      } catch (e) {
        console.warn(`[Vivino] Prix non récupéré:`, e);
      }

      return this.mapVivinoApiToWine(vintage, cleanUrl, estimatedPrice);
    } catch (error: any) {
      console.error(`[Vivino] Erreur pour vintage ${vintageId}:`, error);
      return null;
    }
  }

  private mapVivinoApiToWine(
    vintage: any,
    url: string,
    estimatedPrice: number | null,
  ): Partial<Wine> {
    const wine = vintage.wine || {};
    const style = wine.style || {};
    const structure = style.baseline_structure || {};

    const typeId = style.wine_type_id ?? wine.type_id;
    const color =
      typeId === 1
        ? "Rouge"
        : typeId === 2
          ? "Blanc"
          : typeId === 3
            ? "Champagne"
            : typeId === 4
              ? "Rosé"
              : null;

    const variations = vintage.image?.variations || {};
    const imageUrl = variations.bottle_medium
      || variations.bottle_large
      || variations.large
      || variations.medium
      || null;

    return {
      name: wine.name,
      year: vintage.year || null,
      url,
      estimatedPrice,
      tastes: [],
      foods: (wine.foods || []).map((f: { name: string }) => f.name),
      region: wine.region?.name ?? null,
      winery: wine.winery?.name ?? null,
      grapes: (vintage.grapes || []).map((g: { name: string }) => g.name),
      imageUrl: imageUrl ? "https:" + imageUrl : null,
      color,
      structure: {
        acidity: structure.acidity ?? null,
        fizziness: structure.fizziness ?? null,
        intensity: structure.intensity ?? null,
        sweetness: structure.sweetness ?? null,
        tannin: structure.tannin ?? null,
      },
    };
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

}
