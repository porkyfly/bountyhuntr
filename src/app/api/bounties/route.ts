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
  const bounties = await prisma.bounty.findMany({
    include: {
      answers: true
    }
  });
  return NextResponse.json(bounties);
} 