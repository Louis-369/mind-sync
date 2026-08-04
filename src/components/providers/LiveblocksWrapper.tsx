"use client";

import React, { ReactNode, Component } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { LiveObject, LiveMap, LiveList } from "@liveblocks/client";
import { DEFAULT_PUBLIC_KEY, DEFAULT_SETTINGS } from "../../lib/constants";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";

interface LiveblocksWrapperProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class LiveblocksErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Liveblocks Connection Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-ukiyo-bg">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-ukiyo-vermillion/40 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-ukiyo-vermillion/20 border border-ukiyo-vermillion/40 flex items-center justify-center text-ukiyo-vermillion">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ukiyo-foam">牌席連線未回應</h2>
            <p className="text-xs md:text-sm text-ukiyo-mist font-serif leading-relaxed">
              牌席連線暫時無法建立（可能已達免費最高連線人數上限或網路中斷）。請重新嘗試連線。
            </p>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="gap-2 font-serif mt-2"
            >
              <RefreshCw className="w-4 h-4" /> 重新連線
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function LiveblocksWrapper({ roomId, children, fallback }: LiveblocksWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
  const hasSecretKey = Boolean(
    process.env.LIVEBLOCKS_SECRET_KEY && process.env.LIVEBLOCKS_SECRET_KEY.startsWith("sk_")
  );

  const providerProps = hasSecretKey
    ? { authEndpoint: "/api/liveblocks-auth" }
    : { publicApiKey: apiKey };

  return (
    <LiveblocksErrorBoundary>
      <LiveblocksProvider {...(providerProps as any)}>
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
              showCollisionName: DEFAULT_SETTINGS.showCollisionName,
            }),
            board: new LiveMap(),
            lockedPlayers: new LiveList([]),
            playerJoinOrder: new LiveList([]),
            handCounts: new LiveMap(),
            dealTimestamp: 0,
            status: "waiting",
            result: null,
            hostId: "",
          }}
        >
          <ClientSideSuspense fallback={fallback || <LoadingFallback />}>
            {() => children}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </LiveblocksErrorBoundary>
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
