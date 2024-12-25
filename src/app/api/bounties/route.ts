import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { question, reward, latitude, longitude } = await req.json();

  const bounty = await prisma.bounty.create({
    data: {
      question,
      reward,
      latitude,
      longitude,
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