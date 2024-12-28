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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out expired bounties
    const filteredBounties = bounties.filter(bounty => {
      if (!bounty.expiryMinutes) return true; // Keep bounties with no expiry
      const expiryTime = new Date(bounty.createdAt.getTime() + bounty.expiryMinutes * 60 * 1000);
      return expiryTime > now;
    });

    return NextResponse.json(filteredBounties);
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    );
  }
} 