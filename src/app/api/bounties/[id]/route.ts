import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const bounty = await prisma.bounty.findUnique({
    where: { id: params.id },
    include: { answers: true }
  });

  if (!bounty) {
    return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
  }

  return NextResponse.json(bounty);
} 