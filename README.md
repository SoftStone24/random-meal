# Random Meal

Hôm nay ăn gì? Quay ngẫu nhiên một món. Chỉ random: đặt món hay giao hàng do người dùng tự xử lý.
Trang tĩnh, không backend, không API key. Bộ lọc và danh sách "không ăn" lưu trong localStorage.

## Chạy

```bash
npm install
npm run dev   # http://localhost:3000
```

## Dữ liệu món

- Nguồn: `scripts/dishes-source.txt` (soạn tay, từng dòng `tên | dạng | nguyên liệu | bữa | *`).
- Build: `node scripts/build-dishes.mjs` kiểm tra thẻ, bỏ trùng tên, ghi `app/data/dishes.json`. Sửa danh sách thì chạy lại.
- `scripts/fetch-world-dishes.mjs`: lấy món nổi tiếng từ Wikidata để tham khảo khi duyệt thêm món quốc tế (không chạy lúc build app).
- Mỗi món có: vùng/nguồn gốc, dạng món, nguyên liệu, bữa, cờ `hiếm` (xác suất quay thấp hơn).

## Bộ lọc

- Chip 3 trạng thái: bấm 1 lần "chỉ lấy", 2 lần "loại bỏ", 3 lần bỏ chọn.
- Trong cùng nhóm là "hoặc", giữa các nhóm là "và"; "loại bỏ" luôn thắng.
- Món nước ngoài mặc định ẩn, bật bằng công tắc "Cả món nước ngoài".
- "Không ăn món này" loại hẳn một món; tránh 5 món vừa quay.
- Logic lọc ở `app/lib/filters.js` (hàm thuần).
