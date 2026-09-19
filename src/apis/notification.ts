import { request } from "@/configs/requests";
import type {
  NotificationItem,
  NotificationsResponseProps,
} from "@/types/notification";

export const getNotifications = async (shopId: string) => {
  return await request<NotificationsResponseProps>(
    `webapp/notification/list/${shopId}`,
  );
};

// Reads the unverified response shape defensively (plain array or paginated
// `results`, several possible field names).
export const normalizeNotifications = (
  data?: NotificationsResponseProps,
): NotificationItem[] => {
  const list = Array.isArray(data) ? data : (data?.results ?? []);

  return list.map((item, index) => ({
    id: String(item.id ?? index),
    title: item.title ?? item.name ?? "",
    body: item.body ?? item.message ?? item.text ?? item.description ?? "",
    date: item.created_at ?? item.datetime ?? item.date ?? null,
  }));
};
