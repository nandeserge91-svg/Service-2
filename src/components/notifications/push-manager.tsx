"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

export function PushManager() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC_KEY) return;
    setSupported(true);

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  async function toggle() {
    if (!supported) return;
    setLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setSubscribed(false);
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const json = sub.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });
        setSubscribed(true);
      }
    } catch (err) {
      console.error("[PushManager]", err);
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50"
      title={subscribed ? "Désactiver les notifications push" : "Activer les notifications push"}
    >
      {subscribed ? (
        <>
          <BellRing className="h-4 w-4 text-success-500" />
          <span className="hidden sm:inline text-gray-600">Push actif</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4 text-gray-400" />
          <span className="hidden sm:inline text-gray-600">Activer push</span>
        </>
      )}
    </button>
  );
}
