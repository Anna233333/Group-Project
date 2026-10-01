# Daily Canvas — Product Design

## Concept

Daily Canvas is a quiet, pointillist mood journal. A person writes one short sentence about how they feel and selects **Paint**. The app translates the sentence into a mood color and adds one impressionist-style dot to that month's shared canvas while preserving the entry's exact date.

Each sentence creates exactly one dot. Over time, individual moments form a personal color field: every month becomes a painting, and longer-term emotional patterns become visible without turning the experience into a clinical dashboard.

## Product principles

- **Expression first:** writing should feel like making a mark, not completing a survey.
- **One thought, one dot:** every submitted sentence has a single visual result.
- **Suggest, do not diagnose:** keyword analysis proposes a color; it never labels the person's mental health.
- **Private by default:** entries and mood data should remain on the device for the MVP.
- **Beautifully imperfect:** dots vary subtly in size, opacity, texture, and position while preserving the underlying data.

## Core experience

### Monthly canvas view

The main screen contains:

1. Today's date and a small greeting.
2. A large canvas containing every entry in the displayed month.
3. A sentence input with the prompt: **“How are you feeling?”**
4. A primary **Paint** button.
5. A compact month strip or calendar for moving between days.

When the person selects **Paint**:

1. Trim and validate the sentence.
2. Analyze its emotion keywords.
3. Collect every recognized non-neutral mood and its score. Use one color for one mood, or make a soft score-weighted gradient for several moods.
4. Save the original sentence, result, and timestamp.
5. Animate one dot onto the displayed month's shared canvas, dated to the selected calendar day.
6. Clear the input and show a brief confirmation such as **“A moment added.”**

Blank entries do nothing and show a gentle validation message. Rapid repeated clicks must not create duplicate dots.

### Calendar view

The calendar shows a miniature pointillist preview inside each day cell. Selecting a day chooses where the next entry will be recorded; it does not hide the other days from the shared monthly canvas. The sentence list covers the displayed month and includes each entry's date.

The default is to allow multiple entries per day because one sentence equals one emotional moment, rather than forcing an entire day into a single mood.

## Visual language

Each mark should resemble a small dab of paint rather than a perfect digital circle.

- Base size: 16–30 px, with deterministic variation.
- Shape: soft-edged circle with slight irregularity.
- Texture: two or three translucent layers in neighboring shades.
- Opacity: 75–90% so overlapping dots create new colors.
- Placement: distributed within the canvas with light jitter and collision tolerance.
- Animation: a 250–400 ms bloom or brush-dab effect.

Dot variation should be generated from the entry ID so the painting looks the same after every reload. Color remains the data signal; size and position are decorative and must not imply emotional intensity unless intensity is explicitly added later.

## Mood color system

| Mood family | Example keywords and phrases | Base color | Hex |
|---|---|---|---|
| Joy | happy, joyful, delighted, great, excited, cheerful, proud | Sunflower yellow | `#F2C94C` |
| Calm | calm, peaceful, relaxed, content, grounded, okay | Sage green | `#78A889` |
| Sadness | sad, down, blue, low, lonely, disappointed, heartbroken | Deep blue | `#4C78A8` |
| Anger | angry, mad, furious, irritated, annoyed, frustrated | Vermilion | `#D95D4F` |
| Anxiety | anxious, worried, nervous, uneasy, overwhelmed, stressed | Violet | `#8B6FB5` |
| Tiredness | tired, exhausted, drained, sleepy, burned out, burnt out | Slate | `#7C8491` |
| Love | loved, loving, affectionate, grateful, thankful, connected | Rose | `#D9829B` |
| Hope | hopeful, optimistic, inspired, encouraged, curious | Coral orange | `#F2995B` |
| Boredom | bored, boring, unstimulated, restless, nothing to do | Muted ochre | `#B79B72` |
| Neutral | fine, normal, unsure, numb, indifferent, mixed | Warm gray | `#AAA39A` |

Colors should be distinguishable in common forms of color-vision deficiency. Text labels and entry details provide a non-color-only interpretation.

When a sentence contains two or more recognized non-neutral moods, all of their colors appear in one soft gradient. Scores determine the approximate share of the dot, with a minimum visible share reserved for every component. Neutral is omitted from a mixture and remains the fallback only when no non-neutral mood is recognized. Built-in moods, Boredom, and user-created custom moods use the same rules.

## Keyword analysis

The MVP can use a transparent, deterministic keyword scorer rather than an external AI service.

### Processing

1. Convert the sentence to lowercase.
2. Normalize punctuation and common contractions.
3. Match full phrases before individual words.
4. Detect simple negation within the three words before a match, such as “not happy.”
5. Add a score for each matched mood family.
6. Give emphasis words such as “very,” “really,” and “extremely” a small weight boost.
7. Sort all matched non-neutral families by score, strongest first.
8. If one family matches, use its solid color. If several match, normalize their scores into gradient shares and reserve a minimum visible share for each family.
9. If no non-neutral family matches, use **Neutral** and allow the person to adjust the color.

Example:

> “I am feeling down and a little lonely today.”

“Down” and “lonely” both score for Sadness, so the app paints a deep blue dot. “I feel very happy, anxious, and tired” creates one yellow-violet-slate gradient; the intensified Joy component receives more space.

### Important behavior

- Phrase matching takes priority: “burned out” maps to Tiredness before “out” is ignored.
- Negated emotion words do not count toward that family: “I am not sad” should not become Sadness solely because it contains “sad.”
- Mixed sentences include every recognized non-neutral mood, ordered strongest first, and display a label such as **“Joy + Anxiety + Tiredness.”**
- The interface should say **“Suggested color”** or **“Suggested colors”**, not **“Detected emotion.”**
- Choosing a palette mood manually replaces the automatic mixture with one solid color without changing the original words.
- Editing a saved sentence does not recalculate its paint, date, or position.
- Recoloring a palette mood updates that component inside existing mixed dots.

## Dot placement

Use seeded pseudo-random placement based on the entry ID and canvas dimensions.

1. Generate a candidate x/y coordinate with safe padding around the canvas edge.
2. Prefer open space, but allow limited overlap to create a painted composition.
3. Try several candidates and choose the one with the greatest distance from nearby dot centers.
4. As the day fills, gradually accept more overlap instead of shrinking dots indefinitely.

The same saved entry should always produce the same location, size, rotation, and texture seed.

## Data model

```ts
type MoodFamily =
  | "joy"
  | "calm"
  | "sadness"
  | "anger"
  | "anxiety"
  | "tiredness"
  | "love"
  | "hope"
  | "boredom"
  | "neutral"
  | `custom:${string}`;

interface MoodEntry {
  id: string;
  text: string;
  createdAt: string;
  localDate: string; // YYYY-MM-DD in the user's local timezone
  suggestedMood: MoodFamily;
  selectedMood: MoodFamily;
  color: string;
  matchedTerms: string[];
  moodComponents?: Array<{
    mood: MoodFamily;
    score: number;
    color: string;
    matchedTerms: string[];
  }>;
  visualSeed: number;
}
```

`moodComponents` is optional so entries saved by earlier versions remain valid single-color dots. Store entries locally for the MVP. Provide export and permanent-delete controls before adding accounts or synchronization.

## Accessibility and care

- The input, button, calendar, dots, and entry list must be keyboard accessible.
- Each dot needs an accessible label such as “Sadness entry, September 22 at 3:10 PM” or “Mixed Joy + Anxiety entry.”
- Offer reduced motion and a high-contrast mode.
- Do not rely on color alone; expose the mood name in details and screen-reader labels.
- Avoid streaks, scores, warnings, or language that judges a person's emotional pattern.
- If crisis-related phrases are ever handled, use a separately reviewed safety flow rather than treating them as ordinary mood keywords.

## MVP scope

### Include

- Write one sentence and create one dot.
- Keyword-based mood suggestion with the nine color families above.
- Score-weighted multicolor dots for sentences containing several recognized moods.
- Manual color override.
- Daily canvas and month calendar.
- Entry detail list with edit and delete.
- Local persistence.
- Locally persisted custom mood words, phrases, and palette colors.
- Responsive layout, keyboard support, and reduced motion.

### Defer

- Accounts and cloud synchronization.
- Sharing or social features.
- AI-generated interpretations or advice.
- Trends, statistics, and sentiment scores.
- Reminders and image export.

## Success criteria

- Selecting **Paint** for a valid sentence produces exactly one persisted dot.
- “I am feeling down” produces a blue Sadness suggestion.
- “I feel happy and anxious” produces one yellow-violet gradient dot rather than Neutral.
- A saved dot survives refresh with the same appearance and position.
- Multiple entries on one day remain individually selectable.
- A person can correct an inaccurate suggestion in one action.
- The experience works without a network connection.

## Open design questions

- Should the sentence list be visible by default, or remain hidden to keep the canvas contemplative?
- Should past dates accept new entries, or should entries always use their actual creation time?
- Should manual palette customization preserve mood labels or replace the mood system entirely?
