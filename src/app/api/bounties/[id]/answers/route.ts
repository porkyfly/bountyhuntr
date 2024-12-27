import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;

    const answer = await prisma.answer.create({
      data: {
        content,
        bountyId: params.id,
      },
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create answer' },
      { status: 500 }
    );
  }
} 