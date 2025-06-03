import { NextRequest, NextResponse } from "next/server";
import { WineRepository } from "@/lib/repositories/wine.repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const repository = await WineRepository.getInstance();

  const wine = await repository.getOne((await params).id);

  return NextResponse.json({
    success: wine !== null,
    wine,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const repository = await WineRepository.getInstance();
  const json = await request.json();

  return repository
    .update((await params).id, json)
    .then(() => NextResponse.json({ success: true }, { status: 200 }))
    .catch((e) => {
      return NextResponse.json(
        { success: false, message: e.message },
        { status: 500 },
      );
    });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const repository = await WineRepository.getInstance();

  return repository
    .delete((await params).id)
    .then(() => NextResponse.json({ success: true }, { status: 202 }));
}
