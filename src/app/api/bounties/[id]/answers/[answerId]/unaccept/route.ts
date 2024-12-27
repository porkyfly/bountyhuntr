import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    // Update the bounty status back to open
    await prisma.bounty.update({
      where: { id: params.id },
      data: { status: 'open' }
    });

    // Unmark the answer as accepted
    const answer = await prisma.answer.update({
      where: { id: params.answerId },
      data: { accepted: false }
    });

    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unaccept answer' }, { status: 500 });
  }
} 