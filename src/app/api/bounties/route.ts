import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question, reward = 0, latitude, longitude, expiryMinutes = 30 } = await req.json();

  const bounty = await prisma.bounty.create({
    data: {
      question,
      reward,
      latitude,
      longitude,
      expiryMinutes,
    },
    include: {
      answers: true
    }
  });

  return NextResponse.json(bounty);
}

export async function GET() {
  try {
    const now = new Date();

    const bounties = await prisma.bounty.findMany({
      where: {
        OR: [
          { expiryMinutes: null },  // Include bounties with no expiry
          {
            AND: [
              { expiryMinutes: { not: null } },
              {
                createdAt: {
                  gt: new Date(now.getTime() - (prisma.bounty.expiryMinutes || 0) * 60 * 1000)
                }
              }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bounties);
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
} 