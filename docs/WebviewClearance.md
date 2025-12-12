# Webview Clearance

## When to use
- 403s or forbidden responses while hitting the API.
- Cookies/user-agent suspected stale or invalid.
- Need to solve the challenge page to refresh session data.

## Flow
- Trigger `startWebviewClearance` in the loader to open the WebView.
- User solves the challenge; cookies/user-agent are captured.
- Return to the previous route once the session is valid.

## Tips
- Show a snack/notice telling the user to solve the challenge.
- Avoid spamming the WebView; only prompt on repeated 403s or explicit user action.
- Persist refreshed headers in storage for reuse on next startup.
