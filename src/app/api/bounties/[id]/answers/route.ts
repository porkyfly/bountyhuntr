import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { content } = await req.json();

  const answer = await prisma.answer.create({
    data: {
      content,
      bountyId: params.id,
    },
  });

  return NextResponse.json(answer);
} 