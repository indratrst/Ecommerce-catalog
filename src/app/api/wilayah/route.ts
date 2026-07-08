import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path"); // e.g., provinces.json, regencies/11.json

  if (!path)
    return NextResponse.json({ error: "No path provided" }, { status: 400 });

  const response = await fetch(`https://wilayah.id/api/${path}`);
  const data = await response.json();

  return NextResponse.json(data);
}
