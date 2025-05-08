export default interface NotificationRecipient {
  id: number;
  userId: number; // ID của người nhận
  notificationId: number; // Gắn với thông báo nào
  isRead: boolean; // Trạng thái đã đọc
}
