# Auto Retry for Antigravity

Tiện ích mở rộng (**Extension**) dành cho **Antigravity IDE** hoặc **VS Code**. 

## Tính năng
- Tự động bấm nút **Retry** trên các thông báo lỗi (ví dụ: lỗi API, Rate Limit, hoặc "The request failed...").
- Bỏ qua các file có tên chứa từ khóa `retry` hoặc `auto-retry` để tránh việc bấm nhầm vào tab file đang mở (fix lỗi click nhầm file name).
- Chu kỳ quét liên tục 2.5 giây.

## Cách sử dụng

Sau khi cài đặt xong tiện ích này:
1. Bạn có thể sử dụng tổ hợp phím **`Ctrl+Alt+R`** để kích hoạt script (nếu IDE hỗ trợ WebView injection như Antigravity).
2. Khi gặp các cửa sổ lỗi có nút `Retry`, Extension sẽ tự động bắt lấy phần tử đó và bấm.
3. Ngoài phím tắt, bạn có thể gọi lệnh **Auto Retry: Inject Script** hoặc **Auto Retry: Copy Script to Clipboard** từ Command Palette (`Ctrl+Shift+P`).

## Cài đặt
- **Cho Antigravity / VS Code**: 
  1. Tải về file `.vsix`
  2. Tại cửa sổ Extensions (Phím tắt: `Ctrl+Shift+X`)
  3. Chọn dấu mục lục (Ba dấu chấm hoặc nút `...` ở góc thẻ Extensions) -> Chọn `Install from VSIX...`
  4. Lựa chọn file `antigravity-auto-retry-x.x.x.vsix` vừa tải.
