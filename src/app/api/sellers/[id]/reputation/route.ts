import { NextRequest, NextResponse } from "next/server";
import { getSellerReputation } from "@/lib/review-actions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const reputation = await getSellerReputation(id);
  return NextResponse.json(reputation);
}
