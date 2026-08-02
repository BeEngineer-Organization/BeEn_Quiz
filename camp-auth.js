// ============================================================
// 合宿クイズ パスワードゲート（camp.html 専用）
// ============================================================
//
// 合宿参加者だけがクイズページを開けるようにするための簡易認証。
// 合宿案内サイト（been_camp_2026）の staff/auth.js と同じ SHA-256 方式。
//
// ★★★ パスワードの変更方法 ★★★
//   1. ブラウザのコンソールで新しいパスワードのハッシュを作る
//        await crypto.subtle.digest('SHA-256', new TextEncoder().encode('新しいパスワード'))
//          .then(b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join(''))
//   2. 下の PASSWORD_HASH を差し替えて push する
//
// ★★★ 保護レベルについて ★★★
//   ハッシュ化しているので開発者ツールから平文は読めないが、
//   data/camp/unitXX.json を直接 URL で叩けば問題と答えは取得できる。
//   「参加者以外がうっかり開かない」ための鍵であり、機密の保護ではない。
// ============================================================
(function () {
  /** SHA-256 ハッシュ（現在の平文: been-camp-2026） */
  const PASSWORD_HASH = "67d1cd7952cc5c7541adfba6871fae47e4e412a5c49b202b3d5e00cd10b21e23";

  /** 認証状態の保持先キー。タブを閉じるまで有効 */
  const SESSION_KEY = "campQuizLoggedIn";

  const overlay = document.getElementById("campAuthOverlay");
  const app = document.getElementById("campApp");
  const input = document.getElementById("campPasswordInput");
  const button = document.getElementById("campPasswordBtn");
  const error = document.getElementById("campPasswordError");

  if (!overlay || !app || !input || !button || !error) return;

  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    unlock();
  } else {
    input.focus();
  }

  button.addEventListener("click", checkPassword);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
  });
  input.addEventListener("input", hideError);

  async function sha256(message) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function checkPassword() {
    const value = input.value.trim();
    if (!value) {
      showError("パスワードを入力してください。");
      return;
    }

    button.disabled = true;
    button.textContent = "確認中…";
    try {
      if ((await sha256(value)) === PASSWORD_HASH) {
        sessionStorage.setItem(SESSION_KEY, "true");
        unlock();
        return;
      }
      showError("パスワードが違います。しおりに書いてある合言葉を確認してね。");
    } catch {
      // crypto.subtle は https / localhost でのみ使える
      showError("認証処理に失敗しました。https のURLで開いているか確認してください。");
    } finally {
      button.disabled = false;
      button.textContent = "入室する";
    }
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    input.value = "";
    input.focus();
  }

  function hideError() {
    error.hidden = true;
  }

  function unlock() {
    overlay.hidden = true;
    app.hidden = false;
    // app.js は overlay の裏で既に初期化を終えているため、ここでは表示切替のみ行う
  }
})();
