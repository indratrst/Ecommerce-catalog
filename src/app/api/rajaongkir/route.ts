// app/api/rajaongkir/route.ts
import { NextRequest, NextResponse } from "next/server";

const RAJAONGKIR_BASE = "https://rajaongkir.komerce.id/api/v1";
const API_KEY = process.env.RAJAONGKIR_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  if (!search) {
    return NextResponse.json(
      { meta: { code: 400, message: "Search query required" }, data: null },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${RAJAONGKIR_BASE}/destination/domestic-destination?search=${encodeURIComponent(search)}&limit=15`,
      {
        headers: {
          key: API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    // Check if response is OK
    if (!response.ok) {
      console.error(
        "RajaOngkir response error:",
        response.status,
        response.statusText,
      );
      const text = await response.text();
      console.error("Response body:", text.substring(0, 200));
      return NextResponse.json(
        {
          meta: {
            code: response.status,
            message: "RajaOngkir API error",
          },
          data: null,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("RajaOngkir API Error:", error);
    return NextResponse.json(
      { meta: { code: 500, message: "Internal server error" }, data: null },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { meta: { code: 500, message: "API key missing" }, data: null },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    // Validate
    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        { meta: { code: 400, message: "Missing required fields" }, data: null },
        { status: 400 },
      );
    }

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("origin", origin);
    formData.append("destination", destination);
    formData.append("weight", weight.toString());
    formData.append("courier", courier);

    // Call RajaOngkir API
    const response = await fetch(`${RAJAONGKIR_BASE}/calculate/domestic-cost`, {
      method: "POST",
      headers: {
        key: API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RajaOngkir response error:", errorText);
      return NextResponse.json(
        {
          meta: {
            code: response.status,
            message: "RajaOngkir API error",
          },
          data: null,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json(
      { meta: { code: 500, message: "Internal server error" }, data: null },
      { status: 500 },
    );
  }
}
