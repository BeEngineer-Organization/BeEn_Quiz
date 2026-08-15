// ============================================================
// Cコース 1学期 復習ページ 専用スクリプト（review-c1.html）
// ------------------------------------------------------------
// ・data/C/unit01〜12.json をまとめて 1 つの問題プールにする
// ・「問題数（10/20/30）」を選ぶと、確認テストの出題数と制限時間を上書きする
// ・app.js のグローバル関数（normalizeUnit / setUnit / setActiveTestParams）を利用する
//   ※ app.js の後に読み込むこと
// ============================================================
(function () {
  const COURSE_DIR = "data/C/";
  const UNIT_MAX = 12;

  const btnTest = document.getElementById("btnTest");
  const group = document.getElementById("reviewCountGroup");
  const hint = document.getElementById("catalogHint");

  let poolReady = false;
  let countChosen = false;

  function updateTestBtn() {
    if (btnTest) btnTest.disabled = !(poolReady && countChosen);
  }

  function showError(message) {
    if (!hint) return;
    hint.hidden = false;
    hint.textContent = message;
  }

  // 1) 第1〜12回のクイズをまとめて 1 つのプールにする
  async function buildPool() {
    const allQuestions = [];
    for (let i = 1; i <= UNIT_MAX; i += 1) {
      const path = `${COURSE_DIR}unit${String(i).padStart(2, "0")}.json`;
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`${path}（HTTP ${res.status}）`);
      const raw = await res.json();
      // app.js の normalizeUnit で検証しつつ取り込む
      const unit = normalizeUnit(raw);
      for (const q of unit.questions) allQuestions.push(q);
    }
    if (allQuestions.length === 0) throw new Error("問題が見つかりませんでした。");

    // app.js に「現在の単元」としてプールを渡す
    setUnit({ unit_title: "Cコース 1学期 復習（第1〜12回）", questions: allQuestions });

    poolReady = true;
    if (hint) {
      hint.hidden = true;
      hint.textContent = "";
    }
    updateTestBtn();
  }

  // 2) 問題数セレクタ
  if (group) {
    group.addEventListener("click", (e) => {
      const btn = e.target instanceof Element ? e.target.closest(".review-count-btn") : null;
      if (!btn) return;
      const count = Number(btn.dataset.count);
      const minutes = Number(btn.dataset.min);
      if (!Number.isFinite(count) || !Number.isFinite(minutes)) return;

      // 確認テストの出題数・制限時間を上書き（app.js のフック）
      setActiveTestParams(count, minutes * 60);

      group.querySelectorAll(".review-count-btn").forEach((b) => {
        b.classList.remove("selected");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("selected");
      btn.setAttribute("aria-pressed", "true");

      countChosen = true;
      updateTestBtn();
    });
  }

  buildPool().catch((err) => {
    const detail = err && err.message ? err.message : String(err);
    showError(`復習データの読み込みに失敗しました：${detail}（HTTP サーバー経由で開いているか確認してください）`);
  });
})();
