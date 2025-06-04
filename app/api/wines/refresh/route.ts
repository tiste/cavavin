import { WineRepository } from "@/lib/repositories/wine.repository";
import { NextResponse } from "next/server";

export async function POST() {
  const repository = await WineRepository.getInstance();

  return repository
    .refresh()
    .then(() => NextResponse.json({ success: true }, { status: 200 }))
    .catch((e) => {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: 500 },
      );
    });
}
