# Feature Specification: Rapid Flashcard Stream

**Feature Branch**: `001-rapid-flashcard-stream`

**Created**: 2026-11-05

**Updated**: 2026-11-06

**Status**: Ready for Planning

**Input**: User description: "Flashcard dosyası yüklenebilecek csv. formatında. Flashcard destesi oluşturulabilecek. Çok pratik şekilde flashcardlar hızı ayarlanır bir şekilde 50 ms - 3000ms ön ve arka yüz gösterilip hızlıca kelime öğrenmek hedeflenecek. Klavye kısayolları da desteklenecek. modern basit bir ui ve ux olacak. Hızlı akış (Rapid Stream) modundaki kart gösterim davranışını şu kurallarla güncelle: 1. Tekil Görünüm Kuralı (Single-Side Exclusivity): Akış ekranında kelime (Ön Yüz) ve anlamı (Arka Yüz) kesinlikle aynı anda veya alt alta gösterilmemelidir. Ekranda her an yalnızca tek bir metin alanı bulunmalıdır. 2. İki Fazlı Döngü (Two-Phase Cycle): Her bir flashcard iki ardışık fazda gösterilir (Faz 1 FRONT: İngilizce kelime frontDurationMs kadar, Faz 2 BACK: Türkçe anlam birebir aynı merkezde backDurationMs kadar). Faz geçişi tamamlandığında bir sonraki kartın Faz 1 FRONT adımına geçilir. 3. Görsel Ayrım: Ön Yüz ve Arka Yüz metin renkleri ve rozet tonları birbirinden farklı olmalıdır. 4. Doğrusal ve Hassas Süre Kontrolü: Hız ayar çubuğu (slider) 1 ms hassasiyetle (step=1) kesintisiz ayarlanabilmeli, buton yönleri süre (ms) odaklı ('-' süre düşürür, '+' süre artırır) çalışmalı ve doğrudan sayısal giriş kutusu (number input) bulunmalıdır. 5. Favorilerim Modu ve Filtreleme: Arayüzde 'Tüm Kartlar' ve 'Favorilerim' arasında filtre bulunmalı, 'Favorilerim' görünümünde akış başlatıldığında yalnızca favori kartlar gösterilmeli, favoriler boşken akış başlatılmak istendiğinde bilgilendirici uyarı verilmelidir. 6. Tek Kelimelik Anlam Kısıtı: Yüksek hızda okuma sırasında yatay göz hareketini (saccade) sıfırlamak için kartların arka yüzündeki Türkçe anlamlar tek bir kelimeden oluşmalı; manuel kart ekleme formunda ve varsayılan örnek destede '1 İngilizce Kelime = 1 Türkçe Kelime' standardı uygulanmalıdır."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rapid Two-Phase Flashcard Stream & Granular Duration Controls (Priority: P1)

As a language learner reviewing vocabulary,
I want to stream flashcards sequentially in a two-phase cycle (Front face followed by Back face at the exact same focal center) with single-side exclusivity and granular millisecond duration controls (1ms step slider, duration stepper buttons, and direct numeric input between 50ms and 3000ms),
So that I can test my recall on the word, verify the meaning without gaze shifts, and dial in the exact cognitive scanning interval suitable for my reading pace.

**Why this priority**: Sequential single-side presentation at a locked focal center is essential for high-speed vocabulary acquisition. Furthermore, cognitive recognition thresholds vary by tens of milliseconds; offering 1ms precision and direct numeric entry allows learners to tune speed with surgical precision.

**Independent Test**: Can be tested by starting playback on any deck with at least two cards: verify that only the front word appears at screen center for the configured duration, followed immediately by only the back meaning at the exact same coordinates for the back duration, then transitions immediately to the next card's front word. Verify that front and back never appear together. Verify that moving the slider by 1 unit updates the duration by 1ms, typing an exact value (e.g. 187ms) applies immediately, and pressing `-` decreases milliseconds while `+` increases milliseconds.

**Acceptance Scenarios**:

1. **Given** an active deck, **When** playback starts on a card, **Then** the screen enters Phase 1 (FRONT) and displays ONLY the English word centered on screen for `frontDurationMs`, while the back meaning remains completely hidden.
2. **Given** Phase 1 (FRONT) reaches expiration, **When** the front timer completes, **Then** the screen enters Phase 2 (BACK), the word disappears instantly, and ONLY the Turkish meaning appears at the identical optical center for `backDurationMs`.
3. **Given** Phase 2 (BACK) reaches expiration, **When** the back timer completes, **Then** the stream transitions instantly to the next card's Phase 1 (FRONT).
4. **Given** active playback, **When** viewing the screen, **Then** under no circumstances are word and meaning displayed simultaneously or stacked together (Single-Side Exclusivity).
5. **Given** transitions between Phase 1 (FRONT) and Phase 2 (BACK) and subsequent cards, **When** phases switch, **Then** transitions occur as instant cuts with zero 3D rotation, zero sliding animation, and zero geometric layout shift.
6. **Given** the duration controls, **When** the user drags the duration slider, **Then** the duration adjusts continuously with 1 millisecond increments (step = 1ms) between 50ms and 3000ms.
7. **Given** the duration stepper buttons, **When** the user clicks `-`, **Then** the millisecond duration decreases (faster card advance), and **When** the user clicks `+`, **Then** the millisecond duration increases (slower card advance).
8. **Given** the duration numeric input box, **When** the user types an explicit value (e.g., `187`), **Then** the stream speed updates immediately to that exact value, clamped between 50ms and 3000ms.
9. **Given** ongoing streaming, **When** the user pauses playback, **Then** the stream halts immediately on the current card and current phase without resetting progress.
10. **Given** a paused session, **When** the user manually steps forward or backward, **Then** the display navigates predictably between cards/phases while maintaining single-side exclusivity.

---

### User Story 2 - Keyboard-First Stream Operation (Priority: P2)

As a rapid vocabulary reviewer,
I want to execute all playback controls using dedicated keyboard shortcuts without touching the mouse,
So that I can maintain continuous visual concentration on the center of the screen.

**Why this priority**: Reaching for a mouse breaks cognitive momentum during high-speed review. Keyboard ergonomics is a foundational pillar for rapid scanning.

**Independent Test**: Can be tested during an active stream session purely by pressing `Space`, arrow keys, and control hotkeys, observing immediate state updates while keeping the mouse untouched.

**Acceptance Scenarios**:

1. **Given** the review screen is open, **When** the user presses the `Space` key, **Then** playback toggles between playing and paused states.
2. **Given** any playback state, **When** the user presses `Up Arrow` or `Down Arrow`, **Then** the stream duration increases or decreases by a pre-defined step (e.g., 10ms/50ms) within the 50ms - 3000ms boundaries.
3. **Given** any playback state, **When** the user presses `Right Arrow` or `Left Arrow`, **Then** the stream navigates to the next or previous card respectively.
4. **Given** any playback state, **When** the user presses `Enter` or `T`, **Then** the active card face toggles between FRONT and BACK.
5. **Given** focused playback, **When** standard browser interaction keys (such as scrolling on Space) could interfere, **Then** default browser scrolling is prevented in favor of flashcard controls.

---

### User Story 3 - Fault-Tolerant CSV File Import (Priority: P3)

As a user with existing vocabulary lists,
I want to upload a CSV file containing word-meaning pairs,
So that I can import my custom study material quickly even if the file contains formatting inconsistencies.

**Why this priority**: Users need to study their own targeted lists (e.g., YDS, TOEFL, GRE). The import flow must be resilient so users are not blocked by minor file syntax discrepancies.

**Independent Test**: Can be tested by uploading a valid CSV file as well as a CSV with intentional blank lines and malformed rows; valid cards are parsed into a deck, and an import summary report is displayed.

**Acceptance Scenarios**:

1. **Given** a properly formatted CSV file with term and definition columns, **When** the user uploads the file, **Then** all valid pairs are extracted, counted, and added to a target deck.
2. **Given** a CSV file containing missing delimiters or blank rows, **When** the user imports the file, **Then** valid rows are successfully imported while invalid rows are skipped without failing the entire operation.
3. **Given** an import with skipped rows, **When** processing completes, **Then** the user receives an import report detailing the number of successful cards and the row numbers with specific reasons for skipped entries.
4. **Given** a file with either comma (`,`) or semicolon (`;`) delimiters, **When** the user uploads it, **Then** the parser automatically recognizes the separator or respects the user's delimiter preference.

---

### User Story 4 - Deck Creation, Local Management & Favorites Stream Mode (Priority: P4)

As a student preparing multiple subjects,
I want to manage decks, mark difficult cards as favorites, and stream either the full deck or exclusively my favorites,
So that I can isolate and reinforce problematic vocabulary without distraction.

**Why this priority**: Learners struggle with a subset of difficult words. Isolating favorited words into an instant dedicated review stream provides high-impact repetition for weak areas.

**Independent Test**: Can be tested by bookmarking 3 cards in a 10-card deck, toggling the "Favorilerim" filter, launching the stream, and observing that only the 3 bookmarked cards are cycled. Verify that when no cards are favorited, attempting to stream favorites displays a clear informative notice.

**Acceptance Scenarios**:

1. **Given** the application dashboard, **When** the user enters a deck name and submits, **Then** a new empty deck is created and added to the deck list.
2. **Given** multiple existing decks, **When** the user selects a deck, **Then** the deck becomes active and its card count and details are displayed ready for review.
3. **Given** a deck view or streaming session, **When** the user toggles between "Tüm Kartlar" and "Favorilerim", **Then** the view filters the card list immediately according to the selection.
4. **Given** the user is in "Favorilerim" mode with at least one favorited card, **When** playback starts, **Then** the stream cycles exclusively through favorited cards, with total counter and progress reflecting the favorites count.
5. **Given** the user is in "Favorilerim" mode with zero favorited cards, **When** the user attempts to start stream playback, **Then** the system displays a clear informative warning (e.g. "Favorilere eklenmiş kart bulunmuyor") and halts playback without error.
6. **Given** active streaming, **When** the user presses `F` or clicks the star button, **Then** the active card's favorite status toggles immediately and persists locally.
7. **Given** a deck that is no longer needed, **When** the user chooses to delete it, **Then** the system prompts for confirmation and removes the deck and its cards upon confirmation.

---

### User Story 5 - Minimalist Modern Visual Experience & Single-Word Meaning Ergonomics (Priority: P5)

As a focused learner,
I want a clean, high-contrast interface where the active card face is instantly recognizable and the meaning is restricted to a single concise word,
So that my eye gaze stays locked on a single focal point with zero horizontal reading saccades.

**Why this priority**: Reading multi-word phrases or sentences at high speed forces horizontal eye movements (saccades), causing immediate ocular strain and destroying rapid scanning momentum. A strict single-word definition standard guarantees true instant recognition.

**Independent Test**: Can be tested by observing the pre-seeded default deck and manual card addition: verify that every card follows the "1 English Word = 1 Turkish Word" standard, and verify crisp white typography for Front/Word and distinct emerald/cyan typography for Back/Meaning with anchored badges.

**Acceptance Scenarios**:

1. **Given** the default sample vocabulary deck, **When** inspecting card definitions, **Then** 100% of the cards adhere to the Single-Word Meaning format ("1 İngilizce Kelime = 1 Türkçe Kelime").
2. **Given** manual card entry or editing, **When** a user enters card information, **Then** the system prompts for and validates a single-word meaning to uphold optical ergonomics.
3. **Given** Phase 1 (FRONT) is active, **When** viewing the focal center, **Then** the term text is displayed in crisp primary typography (White) with a subtle "KELİME" indicator badge.
4. **Given** Phase 2 (BACK) is active, **When** viewing the focal center, **Then** the single-word meaning is displayed in distinct secondary accent typography (Soft Emerald / Cyan) with a subtle "ANLAM" indicator badge.
5. **Given** rapid streaming at any speed, **When** transitions occur, **Then** the single word remains centered with zero horizontal layout shift or wrap jitter.

---

### Edge Cases

- **Empty Deck Playback**: If a user attempts to start playback on a deck with zero cards, the system must disable the start control and display a helpful prompt to add or import cards.
- **Empty Favorites Playback**: If a user attempts to stream with the "Favorilerim" filter active when 0 cards are marked as favorite, the system must display an informative notice and prevent stream execution.
- **Out-of-Bounds Manual Speed Input**: If a user manually types a value below 50ms into the numeric input, it must automatically clamp to 50ms. If a user types above 3000ms, it must automatically clamp to 3000ms. Non-numeric characters must be ignored.
- **Single-Card Deck / Single-Favorite Deck**: If a deck (or filtered favorites list) contains only one card, the stream must cycle Phase 1 (FRONT) -> Phase 2 (BACK) and loop smoothly according to loop settings without index or state errors.
- **Ultra-Fast Stream Boundaries (50ms)**: When set to 50ms per phase (20 phase transitions per second), the system must maintain timer accuracy without lagging, skipping unaccounted phases/cards, or freezing the UI.
- **Large CSV Import**: When a user imports a CSV containing 5,000+ words, the import process must provide immediate visual feedback (e.g., progress status) and not freeze the user interface.
- **Non-Latin or Special Characters**: When cards contain accents, Turkish characters (ç, ğ, ı, ö, ş, ü), or punctuation, the text must render cleanly without encoding corruption in both front and back phases.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to upload vocabulary files in CSV (and TSV) format.
- **FR-002**: System MUST automatically detect common CSV separators (comma `,`, semicolon `;`, tab `\t`) or allow manual delimiter selection.
- **FR-003**: System MUST validate uploaded CSV lines, import all valid rows, and skip malformed or empty rows without halting the entire import.
- **FR-004**: System MUST produce an import summary showing total rows processed, successfully added cards, and specific row numbers with error descriptions for failed rows.
- **FR-005**: System MUST allow users to create, rename, and delete custom flashcard decks.
- **FR-006**: System MUST persist all decks, cards, and user preferences locally on the user's device without requiring network connectivity or external user authentication.
- **FR-007**: System MUST provide a continuous stream playback mode executing a Two-Phase Cycle for each card:
  - **Phase 1 (FRONT)**: Displays exclusively the front text (English word) for the configured `frontDurationMs`.
  - **Phase 2 (BACK)**: Displays exclusively the back text (Turkish meaning) at the identical optical center for the configured `backDurationMs`.
  - **Card Advance**: Upon completion of Phase 2, the system advances to Phase 1 of the subsequent card.
- **FR-008**: System MUST enforce Single-Side Exclusivity — front text (word) and back text (meaning) MUST NEVER be rendered simultaneously or stacked together on the screen. Exactly one text field occupies the central focal area at any moment.
- **FR-009**: System MUST position both front and back text fields at the exact same central optical focal point on the display so that user gaze remains stationary throughout rapid scanning with zero layout shift.
- **FR-010**: System MUST execute all phase and card transitions using an instant cut (zero 3D flip, zero slide, zero blur animations) to prevent visual fatigue and disorientation during high-speed review.
- **FR-011**: System MUST support stream controls via keyboard shortcuts:
  - `Space`: Toggle play and pause.
  - `Up Arrow`: Increase stream duration (longer display).
  - `Down Arrow`: Decrease stream duration (faster display).
  - `Right Arrow`: Advance to next card.
  - `Left Arrow`: Return to previous card.
  - `Enter` or `T`: Toggle active face between FRONT and BACK.
  - `F`: Toggle favorite status on current card.
  - `Escape`: Exit stream back to dashboard.
- **FR-012**: System MUST allow manual stepping through cards and phases when the stream is paused.
- **FR-013**: System MUST provide granular duration controls:
  - Linear slider with 1 millisecond resolution (`step=1`) covering the full 50ms – 3000ms range.
  - Duration-oriented stepper buttons: `-` button MUST decrease millisecond duration (speeding up card delivery) and `+` button MUST increase millisecond duration (slowing down card delivery).
  - Direct numeric input field allowing users to type exact millisecond values (clamped between 50ms and 3000ms).
- **FR-014**: System MUST display progress indicators (current card index, active phase, and total card count in the active filtered deck).
- **FR-015**: System MUST support a loop mode toggle (automatically restart from the first card when reaching the end of the deck or pause on completion).
- **FR-016**: System MUST visually differentiate Front and Back phases at the focal point using distinct high-contrast typography colors and subtle status indicators (e.g., Crisp White for FRONT/word; Soft Emerald/Cyan for BACK/meaning) so learners immediately recognize card side without shifting focal gaze.
- **FR-017**: System MUST provide a filter toggle between "Tüm Kartlar" (All Cards) and "Favorilerim" (Favorites) across deck views and stream review.
- **FR-018**: When "Favorilerim" mode is active, the system MUST stream exclusively favorited cards and recalculate playback progress indicators based on the favorited subset.
- **FR-019**: System MUST prevent stream execution and display an informative notice if the user triggers playback in "Favorilerim" mode when zero cards are favorited.
- **FR-020**: System MUST uphold Single-Word Meaning ergonomics (1 English Word = 1 Turkish Word) in pre-seeded sample decks and guide/validate manual card creation to eliminate horizontal eye saccades during high-speed review.

### Key Entities

- **Deck**: Represents a named collection of flashcards. Attributes include unique identifier, name, creation timestamp, and last reviewed timestamp.
- **Card**: Represents an individual flashcard belonging to a deck. Attributes include unique identifier, front text (term/word), back text (single-word definition/meaning), order index, `isFavorite` boolean flag, and creation timestamp.
- **ImportReport**: Represents the outcome of a file import session. Attributes include source file name, total line count, imported count, skipped count, and a list of specific failure diagnostics (line number, error reason).
- **PlaybackSession**: Represents the current active stream state. Attributes include active deck reference, current card index, current active phase (`FRONT` or `BACK`), phase duration settings (`frontDurationMs`, `backDurationMs` within 50ms - 3000ms with 1ms granularity), filter mode (`'ALL' | 'FAVORITES'`), playback state (idle, playing, paused), and loop preference.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can import a 1,000-word CSV file and start streaming cards within 5 seconds of file selection.
- **SC-002**: Stream transitions between Phase 1 (FRONT) and Phase 2 (BACK) execute deterministically at the configured millisecond duration across the full 50ms – 3000ms range without noticeable timing drift or UI stutter.
- **SC-003**: 100% of core stream actions (play, pause, step forward, step backward, duration adjustment, face toggle, favorite toggle) can be performed entirely via keyboard without mouse interaction.
- **SC-004**: During a 5-minute continuous rapid scanning session, user eye gaze remains stationary within a central 300x200 pixel focal area on standard desktop viewports, with zero visual layout shift between Front and Back phases.
- **SC-005**: 100% compliance with Single-Side Exclusivity: at no point during automated playback or manual stepping do Front (term) and Back (meaning) texts appear simultaneously on screen.
- **SC-006**: Users can set stream duration to any exact millisecond value (e.g. 187ms) with 1ms granularity using the slider, steppers, or direct numeric typing.
- **SC-007**: When switching to "Favorilerim" mode, the stream cycles 100% exclusively through favorited cards; if 0 cards are favorited, playback is prevented with a clear user notice.
- **SC-008**: 100% of default pre-seeded vocabulary cards and newly validated entries have single-word meanings, ensuring zero horizontal saccades.
- **SC-009**: All user data (decks, cards, favorite states, duration settings) is retained across application restarts with zero data loss.

## Assumptions

- Users will access the application primarily via desktop/laptop environments with physical keyboard access.
- Flashcard CSV files will typically have at least two columns representing the front (term) and back (meaning/definition), with optional column headers.
- The default phase duration on initial launch will be set to a comfortable scanning baseline (e.g., 500ms for front, 500ms for back), adjustable down to 50ms for hyper-rapid recognition and up to 3000ms with 1ms granularity.
- The single-word meaning constraint is primarily designed for high-speed scanning ergonomic optimization; existing multi-word cards from external imports will still render cleanly centered without crashing.
- No remote server or account creation is required for the application; all operations are local-first.
- Hardware keyboard input will take precedence during review, while on-screen buttons remain available for touch and mouse interaction.
