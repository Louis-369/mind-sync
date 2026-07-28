import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room } = body;

    const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;

    // 校驗是否設有 sk_ 開頭的 Liveblocks 伺服器端密鑰
    if (!secretKey || !secretKey.startsWith("sk_")) {
      return NextResponse.json(
        { error: "未設定 LIVEBLOCKS_SECRET_KEY (需為 sk_ 開頭)" },
        { status: 401 }
      );
    }

    const liveblocks = new Liveblocks({ secret: secretKey });
    const userId = `user-${Math.random().toString(36).substring(2, 9)}`;
    const session = liveblocks.prepareSession(userId);

    if (room) {
      session.allow(room, session.FULL_ACCESS);
    }

    const { status, body: responseBody } = await session.authorize();
    return new NextResponse(responseBody, { status });
  } catch (error) {
    console.error("Liveblocks 伺服器端 Token 授權失敗:", error);
    return NextResponse.json(
      { error: "伺服器授權失敗，請檢查金鑰設定" },
      { status: 500 }
    );
  }
}
