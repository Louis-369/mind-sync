import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PUBLIC_KEY } from "../../../lib/constants";

// 取得 Liveblocks Secret Key (若未設定則使用備用 Key)
const secretKey =
  process.env.LIVEBLOCKS_SECRET_KEY ||
  process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ||
  DEFAULT_PUBLIC_KEY;

const liveblocks = new Liveblocks({
  secret: secretKey,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room } = body;

    // 建立隨機匿名用戶 Session
    const userId = `user-${Math.random().toString(36).substring(2, 9)}`;
    const session = liveblocks.prepareSession(userId);

    // 若指定房間，授權完整讀寫權限
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
