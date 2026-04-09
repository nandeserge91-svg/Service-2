import webpush from "web-push";
import { prisma } from "./prisma";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_MAILTO = process.env.VAPID_MAILTO ?? "mailto:admin@example.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.authKey },
        },
        JSON.stringify(payload),
        { TTL: 86400 },
      ),
    ),
  );

  const expired = results
    .map((r, i) => (r.status === "rejected" && isGone(r.reason) ? subs[i].id : null))
    .filter(Boolean) as string[];

  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expired } },
    });
  }
}

function isGone(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    ((err as { statusCode: number }).statusCode === 410 ||
      (err as { statusCode: number }).statusCode === 404)
  );
}
