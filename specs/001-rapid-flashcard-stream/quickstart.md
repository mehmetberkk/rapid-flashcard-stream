# Quickstart Validation Guide: Rapid Flashcard Stream

**Feature**: `001-rapid-flashcard-stream`
**Date**: 2026-11-05 (Updated: 2026-11-06)

This guide provides step-by-step procedures to run, validate, and verify the Rapid Flashcard Stream desktop application end-to-end.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Installed: v24.22.1)
- **npm**: v9.0.0 or higher (Installed: v12.2.1)
- **OS**: Windows 10 / 11

---

## 2. Setup & Installation

From the repository root (`c:\berk onemli\projeler\yds-app`):

```bash
# Install all development and runtime dependencies
npm install

# Run headless unit tests (TimingEngine and CsvParser contracts)
npm run test

# Launch in local development mode (Vite + Electron window)
npm run dev
```

---

## 3. Building the Windows `.exe`

To package the standalone Windows `.exe` executable:

```bash
npm run package
```

The resulting standalone executable will be generated at:
`dist-release/win-unpacked/Rapid Flashcard Stream.exe`.

---

## 4. End-to-End Validation Scenarios

### Scenario A: CSV Import with Error Handling
1. Launch the application (`npm run dev` or run the compiled `.exe`).
2. Click **"Deste Oluştur / İçe Aktar"** (Create Deck / Import).
3. Select or drag-and-drop a sample CSV file containing valid pairs and 1 intentional malformed row (e.g. `apple,elma\nbad_row_without_delimiter\nbanana,muz`).
4. **Expected Outcome**:
   - The system creates a new deck with 2 valid cards.
   - An **Import Report** dialog appears showing: `2 kart yüklendi, 1 satır atlandı`.
   - The report indicates Line 2 was skipped with the reason `"Missing delimiter"`.

### Scenario B: Two-Phase Cycle & Single-Side Exclusivity
1. Open any deck and click **"Akışı Başlat"** or press `Space`.
2. **Phase 1 (FRONT)**:
   - Observe only the English word (`card.word` / `card.front`) displayed in crisp white at the optical center with the "KELİME" badge.
   - Turkish meaning is completely absent from the screen.
3. **Phase 2 (BACK)**:
   - Upon timer expiration (`frontDurationMs`), the word instantly disappears and the Turkish meaning (`card.meaning` / `card.back`) appears at the exact same focal coordinates in soft emerald/cyan with the "ANLAM" badge for `backDurationMs`.
   - Word and meaning are NEVER rendered simultaneously.
4. **Card Advance**:
   - Upon completion of Phase 2, the engine advances to `currentIndex + 1` and resets to Phase 1 (`FRONT`).

### Scenario C: Granular Duration Control (1ms Step, Input Sync, Stepper Direction)
1. In the streaming view, observe the speed control panel.
2. Drag the slider: verify smooth 1ms step adjustments between 50ms and 2000ms.
3. Click `-` button: verify the millisecond value decreases (faster flow).
4. Click `+` button: verify the millisecond value increases (slower flow).
5. Click the numeric input box, type `187`, and press Enter / click away:
   - Verify slider and engine update immediately to 187ms.

### Scenario D: Favorites Mode & Derived Deck Isolation
1. In a deck, click the Star icon on 2 specific cards (or press `F` during stream).
2. Toggle the filter from "Tüm Kartlar" to "Favorilerim".
3. **Expected Outcome**:
   - Total card counter updates to `2`.
   - Launch stream: only the 2 favorited cards cycle in the two-phase loop.
4. Switch to a deck with 0 favorited cards, toggle "Favorilerim", and attempt to start playback:
   - Verify a clear informative warning is presented ("Favorilere eklenmiş kart bulunmuyor") and playback does not crash or execute.

### Scenario E: Single-Word Meaning Ergonomics
1. Inspect the pre-seeded default deck cards ("YDS Sık Çıkan Kelimeler").
2. **Expected Outcome**:
   - Every Turkish meaning is strictly a single word (e.g. `abandon -> terk`, `accurate -> doğru`).
   - Zero horizontal ocular saccades during rapid stream playback.
