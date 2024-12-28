import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { bountyId: string; answerId: string } }
) {
  try {
    // Update bounty to not answered if no other accepted answers
    const otherAcceptedAnswers = await prisma.answer.count({
      where: {
        bountyId: params.bountyId,
        accepted: true,
        id: { not: params.answerId }
      }
    });

    if (otherAcceptedAnswers === 0) {
      await prisma.bounty.update({
        where: { id: params.bountyId },
        data: { answered: false }
      });
    }

    // Mark the answer as not accepted
    await prisma.answer.update({
      where: { id: params.answerId },
      data: { accepted: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unaccepting answer:', error);
    return NextResponse.json(
      { error: 'Failed to unaccept answer' },
      { status: 500 }
    );
  }
} 