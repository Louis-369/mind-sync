"use client";

import React, { ReactNode } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { LiveObject, LiveMap, LiveList } from "@liveblocks/client";
import { DEFAULT_PUBLIC_KEY, DEFAULT_SETTINGS } from "../../lib/constants";

interface LiveblocksWrapperProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function LiveblocksWrapper({ roomId, children, fallback }: LiveblocksWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" publicApiKey={apiKey}>
      <RoomProvider
        id={roomId}
        initialPresence={{
          playerId: "",
          playerName: "載入中...",
          isReady: false,
        }}
        initialStorage={{
          settings: new LiveObject({
            maxPlayers: DEFAULT_SETTINGS.maxPlayers,
            cardsPerPlayer: DEFAULT_SETTINGS.cardsPerPlayer,
            healthSystem: DEFAULT_SETTINGS.healthSystem,
            shuriken: DEFAULT_SETTINGS.shuriken,
            levelMode: DEFAULT_SETTINGS.levelMode,
            showCollisionName: DEFAULT_SETTINGS.showCollisionName,
          }),
          board: new LiveMap(),
          lockedPlayers: new LiveList([]),
          hands: new LiveMap(),
          status: "waiting",
          result: null,
          hostId: "",
          lives: 3,
          shurikens: 1,
          currentLevel: 1,
        }}
      >
        <ClientSideSuspense fallback={fallback || <LoadingFallback />}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-ukiyo-bg text-ukiyo-gold">
      <div className="w-12 h-12 border-4 border-ukiyo-gold border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-serif animate-pulse">天秤正在連線中，請稍候...</p>
    </div>
  );
}
