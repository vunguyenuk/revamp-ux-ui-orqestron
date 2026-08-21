# Orqestron UX/UI Revamp

Phiên bản được tách ngày 21/08/2026, ghi lại toàn bộ thay đổi của transaction workspace và PDF form editor.

## Các thay đổi chính

### Transactions

- Thống nhất toàn bộ thuật ngữ thành **Transaction**; loại bỏ các cách gọi Deal và Project trong giao diện.
- Làm lại màn hình Transactions theo dạng phase board.
- Sửa nút **Close** trong transaction detail để quay về màn hình Transactions đang active.
- Đồng bộ typography, icon, spacing và header giữa Workspace, Assistant và Details / Parties.

### Transaction detail workspace

- Làm lại bố cục PDF workspace gồm page thumbnails, PDF canvas, contextual panel và mode rail.
- Page thumbnails dùng đúng tỷ lệ giấy 8.5:11, kích thước gọn như giao diện tham khảo.
- Bổ sung Download, Sign, zoom và continuous page scrolling.
- Bỏ các block trạng thái dư thừa; chỉ hiện cảnh báo khi thật sự cần xử lý.

### Forms và PDF fields

- Hỗ trợ các form AD, BRBC và PRBS với field overlay theo từng trang.
- Click trực tiếp vào field để mở popup nhập dữ liệu tương ứng.
- Checkbox hiển thị dấu tick đúng trạng thái.
- Sửa khả năng click field ở các trang cuối.
- Chuẩn hóa DRE License, tên người ký, ngày tháng và các suggestion theo ngữ cảnh field.
- Tăng độ rõ của dữ liệu được điền trên PDF.
- Chuẩn hóa title case cho linked values, ví dụ Los Angeles, Orange và Ventura.
- Bổ sung provenance badge:
  - From Transaction Details
  - Updated by AI
  - Synced across 3 forms
- Linked values dùng font 13px/500 để gọn nhưng vẫn dễ đọc.

### Details / Parties

- Bổ sung panel Details / Parties bên phải.
- Form có thể chỉnh sửa trực tiếp.
- Chia dữ liệu thành các accordion:
  - Parties
  - Property Information
  - Listing Information
  - Purchase Information
  - Commission
- Hiển thị chính xác field xuất hiện ở form nào và page nào.
- Click badge vị trí để mở đúng form, cuộn tới đúng page và focus đúng PDF field.
- Dữ liệu trong Details / Parties tự động đồng bộ sang các PDF field đã liên kết.

### Cross-form conflict check

- Kiểm tra mismatch giữa Transaction Details và field trong AD, BRBC, PRBS.
- Conflict engine chạy ngầm; trạng thái thành công không chiếm diện tích giao diện.
- Chỉ hiển thị cảnh báo khi có dữ liệu khác nhau.
- Cảnh báo cho biết giá trị mong đợi, giá trị hiện có, form và page xảy ra lỗi.
- Click cảnh báo để điều hướng trực tiếp đến field cần xử lý.
- Kiến trúc sẵn sàng mở rộng cho các rule Purchase Price, Close Date, Offer Date và buyer/seller consistency khi RPA/ABA được thêm vào transaction packet.

### Assistant

- Làm lại Assistant panel theo cùng design system với Workspace.
- Bổ sung AI chat, quick actions và voice input interaction.
- Giữ context theo form và page đang active.

### Forms library và UI cleanup

- Sửa search interaction trong form library.
- Loại bỏ checkbox filter và nhãn Form Library không cần thiết.
- Sắp xếp icon cùng hàng với tên form.
- Loại bỏ block Orqestron Assistant không còn sử dụng trong Forms panel.
- Dọn các đoạn CSS/UI không còn được render sau khi tinh gọn giao diện.

## Chạy local

Yêu cầu Node.js và npm.

```bash
npm install
npm run dev
```

Mở [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Kiểm tra production

```bash
npm run lint
npm run build
npm run start
```

## Xuất bản standalone

```bash
npm run build
npm run export:standalone
```

Lệnh export cập nhật `index.html` để có thể mở hoặc triển khai như một bản standalone.

## Cấu trúc quan trọng

- `app/page.tsx`: transaction detail, PDF editor, Details / Parties và linked field logic.
- `app/pdf-field-data.ts`: tọa độ và định nghĩa field cho AD, BRBC, PRBS.
- `app/orqestron-editor.css`: style chính của transaction workspace.
- `app/transactions/`: màn hình Transactions.
- `public/forms/`: PDF source và highlighted PDF.
- `public/form-pages/`: ảnh từng trang PDF.
- `public/form-thumbnails/`: thumbnail của page rail.
- `scripts/export-standalone-index.mjs`: tạo bản `index.html` standalone.
