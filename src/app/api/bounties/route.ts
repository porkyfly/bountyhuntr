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

    // Fetch all bounties
    const bounties = await prisma.bounty.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out expired bounties and update them in DB if needed
    const expiredIds: string[] = [];
    const nonExpiredBounties = bounties.filter(bounty => {
      if (!bounty.expiryMinutes) return true;
      
      const expiryTime = new Date(bounty.createdAt.getTime() + bounty.expiryMinutes * 60 * 1000);
      const isExpired = expiryTime < now;
      
      if (isExpired) {
        expiredIds.push(bounty.id);
        return false;
      }
      return true;
    });

    // Update expired bounties in DB if any found
    if (expiredIds.length > 0) {
      await prisma.bounty.updateMany({
        where: {
          id: { in: expiredIds }
        },
        data: {
          expired: true
        }
      });
    }

    return NextResponse.json(nonExpiredBounties);
  } catch (error) {
    console.error('Error fetching bounties:', error);
    return NextResponse.json({ error: 'Failed to fetch bounties' }, { status: 500 });
  }
} 