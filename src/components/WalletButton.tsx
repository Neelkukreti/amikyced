"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSignMessage, useAccount, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";
import { useEffect, useRef } from "react";

interface WalletButtonProps {
  onAuthSuccess: () => void;
}

export default function WalletButton({ onAuthSuccess }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const hasSignedRef = useRef<string | null>(null);
  const isSigningRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !address || hasSignedRef.current === address || isSigningRef.current) return;

    const signIn = async () => {
      isSigningRef.current = true;
      try {
        // Fetch nonce
        const nonceRes = await fetch("/api/auth/nonce");
        const { nonce } = await nonceRes.json();

        // Create SIWE message
        const message = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to KYCScan to track your scan usage.",
          uri: window.location.origin,
          version: "1",
          chainId: 1,
          nonce,
        });

        const messageStr = message.prepareMessage();
        const signature = await signMessageAsync({ message: messageStr });

        // Verify with backend
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageStr, signature }),
        });

        if (verifyRes.ok) {
          hasSignedRef.current = address;
          onAuthSuccess();
        } else {
          const errData = await verifyRes.json().catch(() => ({}));
          console.error("[WalletButton] verify failed:", errData);
          disconnect();
        }
      } catch (err) {
        console.error("[WalletButton] signIn error:", err);
        disconnect();
      } finally {
        isSigningRef.current = false;
      }
    };

    signIn();
  }, [isConnected, address, signMessageAsync, disconnect, onAuthSuccess]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              style={{
                border: "1px solid var(--edge-strong)",
                borderRadius: 7,
                background: "var(--surface-1)",
                padding: "7px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: "var(--secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--edge-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--secondary)"; }}
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <span style={{
              border: "1px solid rgba(0,232,150,0.2)",
              borderRadius: 7,
              background: "rgba(0,232,150,0.05)",
              padding: "5px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--safe)",
              letterSpacing: "0.06em",
            }}>
              {account.displayName}
            </span>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
