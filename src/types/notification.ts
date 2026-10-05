export type NotificationProps = {
  id?: number | string;
  title?: string | null;
  name?: string | null;
  body?: string | null;
  message?: string | null;
  text?: string | null;
  description?: string | null;
  created_at?: string | null;
  datetime?: string | null;
  date?: string | null;
};

export type NotificationsResponseProps =
  | NotificationProps[]
  | { results?: NotificationProps[] };

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  date: string | null;
};
