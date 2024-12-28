import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { bountyId: string } }
) {
  try {
    // Parse form data
    const formData = await req.formData();
    const content = formData.get('content')?.toString();
    const imageUrl = formData.get('imageUrl')?.toString();

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create the answer
    const answer = await prisma.answer.create({
      data: {
        content,
        imageUrl,
        bountyId: params.bountyId,
      }
    });

    // Update bounty to answered
    await prisma.bounty.update({
      where: { id: params.bountyId },
      data: { answered: true }
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
} 