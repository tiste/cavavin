import { NextRequest, NextResponse } from "next/server";
import { WineRepository } from "@/lib/repositories/wine.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const repository = await WineRepository.getInstance();

  const wines = await repository.getAll();

  return NextResponse.json(wines);
}

export async function POST(request: NextRequest) {
  const repository = await WineRepository.getInstance();
  const json = await request.json();

  return repository
    .create(json)
    .then(() => NextResponse.json({ success: true }, { status: 200 }))
    .catch((e) => {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: 500 },
      );
    });
}
