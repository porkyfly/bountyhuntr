import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string; answerId: string } }
) {
  try {
    // Update the bounty status
    await prisma.bounty.update({
      where: { id: params.id },
      data: { status: 'completed' }
    });

    // Mark the answer as accepted
    const answer = await prisma.answer.update({
      where: { id: params.answerId },
      data: { accepted: true }
    });

    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to accept answer' }, { status: 500 });
  }
} 