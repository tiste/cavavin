import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Wine } from "@/domain/wine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const json = (await request.json()) as Wine;

  const prompt = `
Tu es un expert en œnologie. Je vais te donner les informations sur un vin.
Tu dois uniquement me répondre par l’année d’apogée estimée pour ce vin, au format AAAA,
sans phrase ni ponctuation, même si l’information est incertaine. Si tu ne sais pas, réponds "inconnu".

Exemple attendu : 2027

Voici le vin : ${json.name}, ${json.winery || ""}, ${json.year}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const answer = response.choices[0].message.content?.trim();
    return NextResponse.json(
      {
        success: true,
        answer: Number.isNaN(Number(answer)) ? "inconnu" : Number(answer),
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("Error in AI route:", e);
    return NextResponse.json({ success: false, message: e }, { status: 500 });
  }
}
