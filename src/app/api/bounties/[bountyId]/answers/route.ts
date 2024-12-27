import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(
  request: Request,
  { params }: { params: { bountyId: string } }
) {
  try {
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    let imageUrl = null;
    if (image) {
      const blob = await put(image.name, image, {
        access: 'public',
      });
      imageUrl = blob.url;
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        imageUrl,
        bountyId: params.bountyId,
      },
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