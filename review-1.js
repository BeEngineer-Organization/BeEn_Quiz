// ============================================================
// 1学期 復習ページ 専用スクリプト（review-1.html）
// ------------------------------------------------------------
// ・コースを選ぶと、そのコースの unit01〜12.json をまとめて1つの問題プールにする
// ・「問題数（10/20/30）」を選ぶと、確認テストの出題数と制限時間を上書きする
// ・app.js のグローバル関数（normalizeUnit / setUnit / setActiveTestParams）を利用する
//   ※ app.js の後に読み込むこと
// ============================================================
(function () {
  const CATALOG_URL = "data/catalog.json";
  const UNIT_MAX = 12; // 1学期 = 第1〜12回

  const courseSelect = document.getElementById("reviewCourseSelect");
  const group = document.getElementById("reviewCountGroup");
  const btnTest = document.getElementById("btnTest");
  const hint = document.getElementById("catalogHint");

  let poolReady = false;
  let countChosen = false;
  let loadToken = 0; // コース切り替え中の競合防止

  function updateTestBtn() {
    if (btnTest) btnTest.disabled = !(poolReady && countChosen);
  }

  function setHint(message, show) {
    if (!hint) return;
    hint.hidden = !show;
    hint.textContent = show ? message : "";
  }

  // コース一覧を読み込む（合宿コースは除外）
  async function loadCourses() {
    const res = await fetch(CATALOG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`${CATALOG_URL}（HTTP ${res.status}）`);
    const raw = await res.json();
    const courses = Array.isArray(raw.courses) ? raw.courses : [];
    for (const c of courses) {
      if (String(c.profile ?? "main") === "camp") continue; // 合宿は対象外
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      courseSelect.appendChild(opt);
    }
    setHint("", false);
  }

  // 選択コースの第1〜12回をまとめて1つのプールにする
  async function poolCourse(courseId, courseName) {
    poolReady = false;
    updateTestBtn();
    const token = ++loadToken;
    setHint("読み込み中です…", true);

    const allQuestions = [];
    for (let i = 1; i <= UNIT_MAX; i += 1) {
      const path = `data/${courseId}/unit${String(i).padStart(2, "0")}.json`;
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`${path}（HTTP ${res.status}）`);
      const raw = await res.json();
      const unit = normalizeUnit(raw); // app.js のグローバル関数（検証つき）
      for (const q of unit.questions) allQuestions.push(q);
    }
    if (token !== loadToken) return; // 途中で別コースに切り替わったら破棄
    if (allQuestions.length === 0) throw new Error("問題が見つかりませんでした。");

    setUnit({ unit_title: `${courseName} 1学期 復習（第1〜12回）`, questions: allQuestions });
    poolReady = true;
    setHint("", false);
    updateTestBtn();
  }

  // コース選択
  if (courseSelect) {
    courseSelect.addEventListener("change", () => {
      const id = courseSelect.value;
      if (!id) {
        poolReady = false;
        updateTestBtn();
        return;
      }
      const name = courseSelect.options[courseSelect.selectedIndex].textContent;
      poolCourse(id, name).catch((err) => {
        poolReady = false;
        updateTestBtn();
        setHint(`復習データの読み込みに失敗しました：${err && err.message ? err.message : err}`, true);
      });
    });
  }

  // 問題数セレクタ
  if (group) {
    group.addEventListener("click", (e) => {
      const btn = e.target instanceof Element ? e.target.closest(".review-count-btn") : null;
      if (!btn) return;
      const count = Number(btn.dataset.count);
      const minutes = Number(btn.dataset.min);
      if (!Number.isFinite(count) || !Number.isFinite(minutes)) return;

      setActiveTestParams(count, minutes * 60); // app.js のフック

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

  loadCourses().catch((err) => {
    setHint(`コース一覧の読み込みに失敗しました：${err && err.message ? err.message : err}（HTTP サーバー経由で開いているか確認してください）`, true);
  });
})();
