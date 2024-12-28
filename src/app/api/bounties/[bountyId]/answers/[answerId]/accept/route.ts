import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { bountyId: string; answerId: string } }
) {
  try {
    // Update bounty to answered
    await prisma.bounty.update({
      where: { id: params.bountyId },
      data: { answered: true }
    });

    // Mark the answer as accepted
    await prisma.answer.update({
      where: { id: params.answerId },
      data: { accepted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting answer:', error);
    return NextResponse.json(
      { error: 'Failed to accept answer' },
      { status: 500 }
    );
  }
}
