# Supabase Realtime Setup Guide

## Bật Realtime cho Bảng `Bid`

Để hệ thống đấu giá hoạt động realtime, bạn cần bật **Replication** cho bảng `Bid` trên Supabase Dashboard.

### Các bước thực hiện:

1. **Đăng nhập Supabase Dashboard**
   - Truy cập: https://supabase.com/dashboard
   - Chọn project của bạn

2. **Vào Database Replication**
   - Sidebar → Database → Replication
   - Hoặc truy cập: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/replication`

3. **Enable Replication cho bảng `Bid`**
   - Tìm bảng `Bid` trong danh sách
   - Bật toggle **"Realtime"** hoặc **"Replication"**
   - Đảm bảo schema là `public`

4. **Kiểm tra cấu hình**
   - Sau khi bật, bảng `Bid` sẽ có icon realtime (⚡) hoặc status "Enabled"
   - Replication sẽ tự động broadcast các sự kiện INSERT, UPDATE, DELETE

### Lưu ý quan trọng:

- ⚠️ Bật Realtime có thể tăng chi phí nếu bạn dùng free tier và có nhiều updates
- ✅ Frontend đã được config sẵn để lắng nghe sự kiện INSERT trên bảng `Bid`
- 🔒 Supabase RLS (Row Level Security) vẫn áp dụng cho Realtime

### Kiểm tra hoạt động:

1. Mở 2 tab trình duyệt
2. Tab 1: Vào trang đấu giá và xem giá hiện tại
3. Tab 2: Đặt giá mới
4. Tab 1: Giá sẽ tự động cập nhật **không cần F5** với animation màu xanh

### Troubleshooting:

**Vấn đề:** Realtime không hoạt động
- Kiểm tra bảng `Bid` đã enable Replication chưa
- Kiểm tra browser console có lỗi kết nối Supabase không
- Verify NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_ANON_KEY trong `.env`

**Vấn đề:** Bị delay nhiều giây
- Supabase free tier có thể có delay 1-3s
- Upgrade lên paid plan để có latency thấp hơn

## Cấu trúc Code

### Frontend Subscription:
```typescript
// File: src/components/AuctionPage/AuctionDetailPage.tsx
const channel = supabase.channel(`auction-room-${auctionId}`);

channel.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'Bid',
    filter: auction.listingType === 'VEHICLE' 
      ? `vehicleId=eq.${auctionId}` 
      : `batteryId=eq.${auctionId}`
  },
  (payload) => {
    // Cập nhật UI khi có bid mới
  }
).subscribe();
```

### Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://rqvpqlewnxyeedymlwsp.supabase.co
NEXT_PUBLIC_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Tính năng đã implement:

✅ Realtime bid updates (không cần F5)
✅ Flash animation khi có bid mới (màu xanh)
✅ Auto-increment bid input sau mỗi bid mới
✅ Update bidding history realtime
✅ Support cả Vehicle và Battery auctions
✅ Proper cleanup khi component unmount

---

**Lưu ý cuối:** Sau khi enable Replication, có thể mất vài phút để Supabase áp dụng thay đổi. Refresh lại page nếu chưa thấy hoạt động ngay.
