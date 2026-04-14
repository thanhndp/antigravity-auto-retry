# Auto Retry for Antigravity

Tiện ích mở rộng (**Extension**) dành cho **Antigravity IDE** hoặc **VS Code**. 

## Tính năng

### v4.0 — Loop-Proof Edition ⚡
- **16 vùng cấm click** (UNSAFE_ANCESTORS): File explorer, tab bar, sidebar, editor, terminal, minimap, status bar, activity bar... → Loại bỏ hoàn toàn việc click nhầm vào UI elements không phải nút Retry.
- **Phát hiện filename**: Tự động block các nút có text chứa đuôi file (`.js`, `.ts`, `.py`, `.md`...) hoặc từ khóa `auto-retry`.
- **Giới hạn text**: Nút có text > 30 ký tự sẽ bị bỏ qua (không phải retry button).
- **Block logging**: Hiển thị rõ ràng trong Console nút nào bị chặn và tại sao.
- Chu kỳ quét: 2.5 giây + MutationObserver phản ứng tức thì.
- Hỗ trợ: Toast, Dialog, DOM chính, và Iframe/WebView.

### Patterns nhận diện
```
Retry | Try Again | Thử lại | Resend | Resubmit
```

## Cách sử dụng

Sau khi cài đặt xong tiện ích này:
1. Sử dụng tổ hợp phím **`Ctrl+Alt+R`** để kích hoạt (copy script + mở DevTools).
2. Trong DevTools Console, nhấn `Ctrl+V` → `Enter` để inject script.
3. Khi gặp lỗi có nút `Retry`, Extension sẽ tự động bắt và bấm.
4. Ngoài phím tắt, gọi lệnh **Auto Retry: Inject Script** hoặc **Auto Retry: Copy Script to Clipboard** từ Command Palette (`Ctrl+Shift+P`).

## Cài đặt

### Từ file `.vsix`
1. Tải về file `antigravity-auto-retry-4.0.0.vsix`
2. Mở Extensions (phím tắt: `Ctrl+Shift+X`)
3. Chọn menu `...` → `Install from VSIX...`
4. Chọn file `.vsix` vừa tải

### Từ Source Code
```bash
cd auto-retry-extension
npm install -g @vscode/vsce
vsce package
# → antigravity-auto-retry-4.0.0.vsix
```

## Changelog

| Version | Thay đổi |
|---------|----------|
| **4.0.0** | Loop-Proof: 16 UNSAFE zones, isSafeButton filter, filename detection, block logging |
| 3.0.0 | Extension format, Status Bar, Keybinding `Ctrl+Alt+R` |  
| 2.0.0 | Improved button selectors |
| 1.0.0 | Initial release |

## Repository

- GitHub: [thanhndp/antigravity-auto-retry](https://github.com/thanhndp/antigravity-auto-retry)
- Publisher: Sky-Line School
- License: MIT
