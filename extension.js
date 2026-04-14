const vscode = require('vscode');

// ═══════════════════════════════════════════════════════
// Auto Retry v4.1 Script — Safe-Only Edition
// CHỈ click trong vùng an toàn (Toast, Dialog, Chat WebView)
// KHÔNG BAO GIỜ quét toàn bộ DOM
// ═══════════════════════════════════════════════════════
const AUTO_RETRY_SCRIPT = `(() => {
    if (window.__autoRetryLoaded) return console.log('%c🔄 [Auto Retry] Already running!', 'color:#ff8a65;font-weight:bold');
    window.__autoRetryLoaded = true;

    let retryCount = 0;
    let isProcessing = false;
    const COOLDOWN = 2000;
    const SCAN_INTERVAL = 3000;
    const MAX_CLICKS_PER_MIN = 10;
    const RETRY_RE = /\\\\b(retry|try.again|thử.lại|resend|resubmit)\\\\b/i;

    // ── Anti-loop: Track recent clicks ──
    const recentClicks = [];

    const BTN_SELECTORS = [
        'button',
        '[role="button"]',
        '.monaco-button',
        '.monaco-text-button',
        'a.monaco-button',
        '.notification-list-item-buttons-container .monaco-button',
        '.action-item a.action-label',
    ].join(', ');

    // ── CHỈ quét bên trong các container AN TOÀN này ──
    const SAFE_CONTAINERS = [
        '.notifications-toasts',
        '.monaco-dialog-box',
        '.notification-toast-container',
    ];

    const log = (msg, type = 'info') => {
        const styles = {
            info:  'color:#4fc3f7;font-weight:bold',
            ok:    'color:#81c784;font-weight:bold',
            click: 'color:#ffb74d;font-weight:bold;font-size:13px',
            block: 'color:#ef5350;font-weight:bold',
            warn:  'color:#fff176;font-weight:bold',
        };
        console.log('%c🔄 [Auto Retry] ' + msg, styles[type] || styles.info);
    };

    function isRateLimited() {
        const now = Date.now();
        // Clean old entries (older than 60s)
        while (recentClicks.length > 0 && now - recentClicks[0] > 60000) {
            recentClicks.shift();
        }
        if (recentClicks.length >= MAX_CLICKS_PER_MIN) {
            log('RATE LIMITED: ' + recentClicks.length + ' clicks in last 60s (max ' + MAX_CLICKS_PER_MIN + ')', 'warn');
            return true;
        }
        return false;
    }

    function isSafeButton(btn) {
        const text  = (btn.textContent || '').trim();
        const aria  = btn.getAttribute('aria-label') || '';
        const title = btn.getAttribute('title') || '';
        const combined = [text, aria, title].join(' ').toLowerCase();

        // Block filenames
        if (/\\\\.(js|ts|py|md|json|css|html|vue|jsx|tsx)\\\\b/.test(combined)) return false;
        if (combined.includes('auto-retry') || combined.includes('auto retry')) return false;

        // Block long text (real retry buttons are short)
        if (text.length > 25) return false;

        // Block empty text
        if (text.length === 0 && !aria) return false;

        // Block disabled/hidden
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return false;
        if (btn.offsetParent === null) return false;

        // Block git branch indicators
        if (combined.includes('branch') || combined.includes('checkout')) return false;
        if (/^main\\\\*?$/.test(text) || /^master\\\\*?$/.test(text) || /^develop\\\\*?$/.test(text)) return false;

        return true;
    }

    function tryClick(root, label) {
        if (!root || isRateLimited()) return false;
        try {
            const buttons = root.querySelectorAll(BTN_SELECTORS);
            for (const btn of buttons) {
                const text  = (btn.textContent || '').trim();
                const aria  = btn.getAttribute('aria-label') || '';
                const title = btn.getAttribute('title') || '';
                const cls   = btn.className || '';
                const combined = [text, aria, title, cls].join(' ');

                if (!RETRY_RE.test(combined)) continue;
                if (!isSafeButton(btn)) {
                    log('BLOCKED "' + text + '" in [' + label + ']', 'block');
                    continue;
                }

                btn.click();
                retryCount++;
                recentClicks.push(Date.now());
                log('CLICKED #' + retryCount + ' ← [' + label + '] "' + text + '"', 'click');
                return true;
            }
        } catch (e) {}
        return false;
    }

    function scan() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            // ONLY scan safe containers — NO full DOM scan
            for (const sel of SAFE_CONTAINERS) {
                const el = document.querySelector(sel);
                if (el && tryClick(el, sel)) {
                    return void setTimeout(() => { isProcessing = false; }, COOLDOWN);
                }
            }

            // Scan iframes (Chat WebView) — with try/catch for cross-origin
            for (const wv of document.querySelectorAll('iframe, webview')) {
                try {
                    const doc = wv.contentDocument || wv.contentWindow?.document;
                    if (doc && tryClick(doc, 'Iframe')) {
                        return void setTimeout(() => { isProcessing = false; }, COOLDOWN);
                    }
                } catch (e) {}
            }
        } catch (e) {}

        isProcessing = false;
    }

    // MutationObserver for instant reaction
    const obs = (el, label) => {
        if (!el) return;
        new MutationObserver(m => {
            if (m.some(x => x.addedNodes.length > 0)) setTimeout(scan, 200);
        }).observe(el, { childList: true, subtree: true });
        log('Observer → ' + label, 'ok');
    };

    // Only observe safe areas
    obs(document.querySelector('.notifications-toasts'), 'Notifications');

    setInterval(scan, SCAN_INTERVAL);

    log('v4.1 Safe-Only Loaded! Interval=' + SCAN_INTERVAL + 'ms', 'ok');
    log('Patterns: Retry | Try Again | Thử lại | Resend | Resubmit', 'ok');
    log('Safety: SAFE-ONLY mode — only scanning Toast/Dialog/Iframe', 'ok');
    log('Rate limit: max ' + MAX_CLICKS_PER_MIN + ' clicks/min', 'ok');
})();`;

let statusBarItem;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // ── Status Bar Item ──
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.text = '$(sync~spin) Auto Retry';
    statusBarItem.tooltip = 'Click: Copy script + Mở DevTools\nCtrl+Alt+R: Phím tắt';
    statusBarItem.command = 'autoRetry.inject';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // ── Command: Inject (Copy + Open DevTools) ──
    context.subscriptions.push(
        vscode.commands.registerCommand('autoRetry.inject', async () => {
            await vscode.env.clipboard.writeText(AUTO_RETRY_SCRIPT);
            await vscode.commands.executeCommand('workbench.action.toggleDevTools');
            await vscode.window.showInformationMessage(
                '🔄 Auto Retry v4.1 đã copy vào clipboard! Chuyển qua tab Console trong DevTools rồi Ctrl+V → Enter.',
                'OK'
            );
            statusBarItem.text = '$(check) Auto Retry Ready';
            setTimeout(() => {
                statusBarItem.text = '$(sync~spin) Auto Retry';
            }, 5000);
        })
    );

    // ── Command: Copy Only ──
    context.subscriptions.push(
        vscode.commands.registerCommand('autoRetry.copyScript', async () => {
            await vscode.env.clipboard.writeText(AUTO_RETRY_SCRIPT);
            vscode.window.showInformationMessage(
                '🔄 Auto Retry v4.1 script đã copy! Dán vào DevTools Console.'
            );
        })
    );

    // ── Auto-show on startup ──
    vscode.window.showInformationMessage(
        '🔄 Auto Retry v4.1 (Safe-Only) sẵn sàng! Nhấn Ctrl+Alt+R hoặc click nút trên Status Bar.',
    );
}

function deactivate() {
    if (statusBarItem) statusBarItem.dispose();
}

module.exports = { activate, deactivate };
