# 合宿クイズ（camp.html）の単元データ

このフォルダの JSON は **camp.html からのみ** 表示されます。
通常の index.html には出ません（`data/catalog.json` の `"profile": "camp"` で振り分け）。

## 単元を追加する手順

1. `data/camp/unitXX.json` を作る。形式は他のコースと同じ:

   ```json
   {
     "unit_title": "単元名",
     "questions": [
       {
         "id": 1,
         "type": "分類ラベル",
         "question": "問題文。コードは <pre><code>…</code></pre> で書ける",
         "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
         "answer": 0,
         "commentary": "解説"
       }
     ]
   }
   ```

   - `options` は **必ず4つ**。`answer` は 0〜3（0始まり）。
   - `<pre>` の中で `<` を使うときは `&lt;` と書く。
   - 確認テストは10問を出題するので、10問以上あると望ましい。

2. `data/catalog.json` の `"id": "CAMP2026"` のコースに単元を追加する:

   ```json
   { "id": "CAMP2026-u3", "title": "オリジナルの AI を作る", "jsonPath": "data/camp/unit03.json" }
   ```

   分野（`fields`）ごとにグループ表示されるので、既存の分野に足すか新しい分野を作る。

3. push すると GitHub Pages に反映される（数分かかる）。

## パスワードの変更

`camp-auth.js` の先頭コメントを参照。
