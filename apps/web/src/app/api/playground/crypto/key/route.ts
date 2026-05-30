import { NextResponse } from "next/server";
import crypto from "crypto";
import { getMasterSecret, encryptKeyToken } from "@/lib/crypto-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Generate a temporary 256-bit symmetric key (32 bytes)
    const rawKey = crypto.randomBytes(32);
    
    // Get master key and encrypt rawKey to create keyToken
    const masterSecret = getMasterSecret();
    const keyToken = encryptKeyToken(rawKey, masterSecret);
    
    return NextResponse.json({
      rawKey: rawKey.toString("base64"),
      keyToken: keyToken,
    });
  } catch (err: any) {
    console.error("Crypto Handshake Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate dynamic dynamic transit key." },
      { status: 500 }
    );
  }
}
