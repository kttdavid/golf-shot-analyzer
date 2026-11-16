# Golf Shot Data Interpreter: notes for Claude Code

Owner: a PGA of America golf professional. The app must reflect sound golf instruction, accurate ball-flight physics and evidence-based diagnosis.

## Philosophy (do not break)
Intention → Performance → Possible Root Causes → Development.
- Say WHAT to improve, never HOW. No drills, grip, wrist, position or mechanical advice anywhere (page text and AI prompts).
- Max 2 development priorities; zero is valid. If performance meets the goal, say maintain.
- Never invent the player's intention. Missing data is "not shown", never a made-up value.
- Confidence: Measured / Supported / Unconfirmed. Do not confuse declared skill level with confidence.
- Do not show a cause for a ball-flight problem when club data is missing; do not give a pattern/consistency verdict when ball data is missing (see `availRules()` in index.html).

## Architecture
- `public/index.html` is one file (~1 MB): UI, rules, prompts, and an injected bilingual script (EN / 繁體中文). Keep it self-contained.
- AI calls go through `claude.use('sample')` → `sample.json(prompt,{images,modelTier})`. In Claude that is the real runtime; elsewhere `public/claude-shim.js` provides the same interface and posts to `api/analyze.js`.
- Analysis code (JS, no AI): `analyze()`, `bridge()`, `drawDisp2()`, `flightCards2()`, `drawBridge()`, `drawCons5()`, `hSteady()`, `availInfo()`. The AI only writes the plain-language report (`PROMPT`, `RULES2`, `availRules()`).
- Active draw path is `drawFlight()` → `drawAvail()`, `drawDisp2()`, `flightCards2()`, `drawBridge()`, `drawCons5()`. Older `drawCons`, `drawCons2`, `drawCons3`, `drawFlightOld` are dead code; edit the active ones.

## Rules agreed with the owner
- Rating = measured / limit: ≤0.6 Excellent, ≤1 Good, ≤1.5 Fair, else Needs work. Uses the biggest deviation from the player's own average (±), not SD.
- Tier order [Beginner, 20+, 10–19, 0–9, Tour] in `TIER`. Apex steadiness limit is absolute in yards: 20+ ±9, 10–19 ±5, 0–9 ±4, Tour ±2 (second number = "varies a little" limit).
- Carry distance: at least 7 of 10 shots within ±5% of the player's average carry.
- Landing card is split into Direction and Distance. With carry but no side distance, only the Distance block is shown.
- When the player picks a club type and the screenshot shows another type, the player's pick wins (GC Quad defaults to a driver icon). "Mixed clubs" reads the club from the screenshot.
- The "What we read" card appears only when data is missing, too few shots, or ball/club data come from different shots.

## Chinese (繁體中文) rules
- Natural Taiwanese coach Chinese, not word-for-word translation. Short factual sentences. No metaphors or hype.
- Banned wording: 高度控制, 距離控制, 方向控制, 控球, 掌握, 拿捏, 抓到, 穩下來, 穩住, 練穩, 只差, 僅差, 相差, 差不多.
- Steadiness is always "穩定度 ±X". Improvement goals = lowering the variation, with numbers.
- Agreed terms: 桿面角度, 桿頭路徑, 桿面與路徑夾角 (face to path), 入射角, 動態仰角, 桿頭速度, 倒旋角, 擊球點位置, 揮桿方向, 最低點位置, 揮桿平面, 揮桿半徑, 揮桿幾何數據 (swing geometry), 發射方向, 發射角, 轉速, 旋轉軸, 飛行距離, 最高點, 落地角, 球路弧度, 落點分散, 擊球效率, 球速, 左右偏差, 彈道高度, 固定問題, 穩定度問題, 拐彎 (curve verb: 拐彎一點 / 拐彎很多).
- Shape names (Draw, Fade, Slice, Hook, Push, Pull) stay in English.

## Editing the translation
Sources are in `dev-tools/i18n/`: `i18n_a.js` (base dictionary), `i18n_b.js` (overrides, rules, engine, AI style note `ZHNOTE`), `glz.js` (glossary). After editing, run `python3 dev-tools/i18n/inject.py` to rewrite the injected script in `public/index.html`. Dynamic sentences (with numbers) need a regex rule in `RULES` in `i18n_b.js`; static sentences need an exact entry. When English text in `index.html` changes, the exact-string key in the dictionary must change too, or the Chinese version silently shows English. `ZHNOTE` is inside a single-quoted JS string: never use a plain apostrophe in it.

## Tests
`dev-tools/tests/` (Playwright; Chromium must be installed): `audit.js` (14 scenarios), `audit3.js` (incomplete-data scenarios), `audit3z.js` (same, Chinese leftover-English check), `tz.js "English sentence"` (shows the Chinese translation). Run from that folder, for example `node audit.js`. They print `ERRORS: none` when the page has no script errors.

## Pending
- Reference table for launch angle, spin rate and landing angle (mid-trajectory reference) is not in the knowledge base yet.
- Real non-Trackman screenshots, left-handed players and HEIC have not been tested.
- Privacy note for the public site.
