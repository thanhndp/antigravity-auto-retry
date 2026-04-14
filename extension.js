const vscode = require('vscode');

// ═══════════════════════════════════════════════════════
// Auto Retry v3.0 Script — được inject vào DevTools Console
// ═══════════════════════════════════════════════════════
const AUTO_RETRY_SCRIPT = `(() => {
    if (window.__autoRetryLoaded) return console.log('%c🔄 [Auto Retry] Already running!', 'color:#ff8a65;font-weight:bold');
    window.__autoRetryLoaded = true;

    let retryCount = 0;
    let isProcessing = false;
    const COOLDOWN = 1000;
    const SCAN_INTERVAL = 2500;
    const RETRY_RE = /\\b(retry|try.again|thử.lại|resend|resubmit)\\b/i;

    const BTN_SELECTORS = [
        'button',
        '[role="button"]',
        '.monaco-button',
        '.monaco-text-button',
        'a.monaco-button',
        '.notification-list-item-buttons-container .monaco-button',
        '.action-item a.action-label',
    ].join(', ');

    const log = (msg, type = 'info') => {
        const styles = {
            info:  'color:#4fc3f7;font-weight:bold',
            ok:    'color:#81c784;font-weight:bold',
            click: 'color:#ffb74d;font-weight:bold;font-size:13px',
        };
        console.log('%c🔄 [Auto Retry] ' + msg, styles[type] || styles.info);
    };

    function tryClick(root, label) {
        if (!root) return false;
        try {
            const buttons = root.querySelectorAll(BTN_SELECTORS);
            for (const btn of buttons) {
                const text  = (btn.textContent || '').trim();
                const aria  = btn.getAttribute('aria-label') || '';
                const title = btn.getAttribute('title') || '';
                const cls   = btn.className || '';
                const combined = [text, aria, title, cls].join(' ');

                if (RETRY_RE.test(combined)) {
                    if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') continue;
                    if (btn.offsetParent === null) continue;
                    btn.click();
                    retryCount++;
                    log('CLICKED #' + retryCount + ' ← [' + label + '] "' + text + '"', 'click');
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }

    function scan() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const toasts = document.querySelector('.notifications-toasts');
            if (toasts && tryClick(toasts, 'Toast')) {
                return void setTimeout(() => { isProcessing = false; }, COOLDOWN);
            }

            const dialog = document.querySelector('.monaco-dialog-box');
            if (dialog && tryClick(dialog, 'Dialog')) {
                return void setTimeout(() => { isProcessing = false; }, COOLDOWN);
            }

            if (tryClick(document.body, 'DOM')) {
                return void setTimeout(() => { isProcessing = false; }, COOLDOWN);
            }

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

    const obs = (el, label) => {
        if (!el) return;
        new MutationObserver(m => {
            if (m.some(x => x.addedNodes.length > 0)) setTimeout(scan, 150);
        }).observe(el, { childList: true, subtree: true });
        log('Observer → ' + label, 'ok');
    };

    obs(document.querySelector('.monaco-workbench'), 'Workbench');
    obs(document.querySelector('.notifications-toasts'), 'Notifications');

    setInterval(scan, SCAN_INTERVAL);
    scan();

    log('v3.0 Loaded! Interval=' + SCAN_INTERVAL + 'ms', 'ok');
    log('Patterns: Retry | Try Again | Thử lại | Resend', 'ok');
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
            // Copy script to clipboard
            await vscode.env.clipboard.writeText(AUTO_RETRY_SCRIPT);

            // Open DevTools
            await vscode.commands.executeCommand('workbench.action.toggleDevTools');

            // Show instructions
            await vscode.window.showInformationMessage(
                '🔄 Auto Retry v3.0 đã copy vào clipboard! Chuyển qua tab Console trong DevTools rồi Ctrl+V → Enter.',
                'OK'
            );

            // Update status bar
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
                '🔄 Auto Retry v3.0 script đã copy! Dán vào DevTools Console.'
            );
        })
    );

    // ── Auto-show on startup ──
    vscode.window.showInformationMessage(
        '🔄 Auto Retry v3.0 sẵn sàng! Nhấn Ctrl+Alt+R hoặc click nút trên Status Bar.',
    );
}

function deactivate() {
    if (statusBarItem) statusBarItem.dispose();
}

module.exports = { activate, deactivate };
