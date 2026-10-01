# Daily Canvas — Learning Notes

> Draft: These notes summarize the main coding and design ideas I learned while building and revising Daily Canvas.

## 1. Organizing a web project

I learned to separate a website into files with different responsibilities:

- `index.html` contains the page structure and accessible controls.
- `styles.css` controls typography, colors, spacing, responsive layouts, and animations.
- `app.js` contains the mood analysis, saved data, and interactive behavior.
- `docs/` holds design decisions and learning notes.
- `tests/` holds the manual checklist used to verify the application.

This structure makes the project easier to understand and change because presentation, behavior, documentation, and testing are not mixed together.

## 2. Turning user input into program data

The mood sentence begins as text entered into a form. JavaScript listens for the form's `submit` event, prevents the browser's default page reload, validates the sentence, and turns it into an entry object.

An entry stores information such as:

- A unique ID
- The original sentence
- Its creation time and selected date
- Detected mood components and colors
- A stable visual seed for dot placement

One important product rule is **one sentence equals one dot**, even when the sentence contains several feelings.

## 3. Keyword analysis and scoring

Daily Canvas uses transparent keyword matching rather than an external artificial-intelligence service. The analyzer:

1. Converts text to lowercase and removes punctuation.
2. Checks mood phrases and individual words.
3. Ignores a match when a nearby word negates it, such as “not happy.”
4. Gives extra weight to intensity words such as “very” and “really.”
5. Records every matched non-neutral mood and sorts them by score.

For example, “I feel very happy, anxious, and tired” contains Joy, Anxiety, and Tiredness. Joy receives a higher score because “very” intensifies “happy.”

I also learned that vocabulary choices are design decisions. When “bored” originally became Neutral, I decided Boredom needed its own category, keywords, and color.

## 4. Conditional logic and fallback behavior

The analyzer uses conditions to decide what should happen:

- No recognized non-neutral mood → use Neutral.
- One recognized mood → use one solid color.
- Two or more recognized moods → use one multicolor gradient.
- A manually selected palette mood → override the analysis with one solid color.

Neutral is a fallback, not a way to erase other recognized emotions. If a sentence includes both “neutral” and “happy,” Joy remains and Neutral is omitted.

## 5. Arrays, objects, and mood components

A mixed dot is represented by an array of mood-component objects. Each component stores its mood identifier, score, color, and matched terms.

```js
[
  { mood: "joy", score: 1.5, color: "#F2C94C", matchedTerms: ["happy"] },
  { mood: "anxiety", score: 1, color: "#8B6FB5", matchedTerms: ["anxious"] },
]
```

This taught me that an interface can still create one visual object while the underlying data contains several parts.

## 6. Score-weighted CSS gradients

For a mixed mood, JavaScript converts component scores into proportional color shares. Every mood receives a minimum visible share, and stronger moods receive more space. JavaScript then produces a CSS `linear-gradient(...)` value.

The same generated gradient is reused for:

- The large canvas dot
- The suggestion swatch
- The moment-list swatch
- The calendar preview

Reusing one calculation keeps all four representations consistent.

## 7. Manual overrides and user control

The analyzer suggests colors, but the user remains in control. Selecting one palette mood before painting replaces an automatic mixture with a solid dot.

This reflects an important design principle: the program can suggest an interpretation without claiming to diagnose how someone feels.

We also discussed a possible future **Customize mix** feature. It could provide one color picker for each detected mood so a person can replace the suggested gradient colors. This idea has not been implemented yet.

## 8. DOM manipulation and event listeners

JavaScript changes the page after it loads by creating elements, updating text, applying CSS custom properties, and listening for actions such as:

- Typing in the sentence field
- Selecting a palette mood
- Submitting the Paint form
- Choosing a calendar date
- Editing or removing an entry
- Selecting Undo

This is how the application updates without loading a new page after every action.

## 9. One shared monthly canvas

I changed the original experience so every entry in a month appears on one canvas, like pieces joining into a pointillist puzzle. The calendar chooses the date for the next entry but does not filter the canvas down to one day.

The calendar currently uses a Monday-to-Sunday layout. The weekday headings stay fixed while numbered dates shift according to the month.

## 10. Deterministic dot placement

Each entry receives a `visualSeed` based on its ID. A seeded pseudo-random function uses that value to generate the dot's position, size, and rotation.

This produces two useful results:

- The painting looks organic rather than forming a rigid grid.
- Each dot returns to the same position after a refresh.

The placement algorithm tries several positions and chooses the one farthest from existing dot centers. It does not completely prevent overlap. As more sentences are added, overlap becomes increasingly likely and helps create a denser pointillist image.

## 11. Local storage and privacy

The browser's `localStorage` saves entries, palette changes, and custom moods as JSON. The app reads this data when the page loads and writes it again after changes.

This makes the journal local-first:

- Entries survive refreshes.
- No account or database is required.
- The writing is not sent to a server by the application.
- Clearing browser storage removes the saved journal from that browser.

I also learned about backward compatibility. Older entries do not contain `moodComponents`, so the rendering code treats them as single-color entries instead of rejecting them.

## 12. Editing without changing the artwork

I decided that the Edit control should change only the sentence. It should not change the saved dot's color, gradient, date, position, or mood label.

This separates the entry's editable text from its preserved visual history. It also prevents a small wording correction from unexpectedly repainting the monthly canvas.

## 13. Removing, undoing, and timers

When a moment is removed, the app temporarily remembers the entry and its array position. A three-second `setTimeout` controls the Undo period.

If Undo is selected in time, the entry is inserted back into its original position. If the timer finishes, the temporary removal data is discarded.

This feature taught me that an Undo action requires preserving enough state to reverse the original operation.

## 14. Custom moods and palette persistence

The personalization feature allows someone to add a mood word or phrase and choose its color. The app creates a unique custom mood key and includes that mood in keyword analysis, the palette, the legend, and mixed gradients.

When an existing mood is recolored, the new color must also replace that mood's color inside previously saved mixed entries. Otherwise, the same mood would appear inconsistently across old and new dots.

## 15. Accessibility

Color alone should not communicate meaning. Daily Canvas also provides:

- Written mood labels such as “Joy + Anxiety”
- Accessible labels for canvas dots and controls
- Keyboard-operable buttons and forms
- Visible focus indicators
- Reduced-motion behavior

For mixed dots, the accessible description names every component rather than saying only “multicolor dot.”

## 16. Testing and debugging

The manual test plan is not a history of the project. It is a repeatable checklist for confirming that important behavior still works after code changes.

Testing includes:

- Blank and unknown input
- Single and mixed moods
- Negation and intensity words
- Manual color overrides
- Custom moods and palette changes
- Refresh persistence and legacy entries
- Edit, remove, and Undo behavior
- Keyboard navigation and screen-reader descriptions

When Undo or GitHub Pages did not behave as expected, debugging meant comparing the expected result with the program's actual state, identifying the cause, changing the smallest relevant part, and testing again.

## 17. Git, GitHub, and deployment

Git records versions of the project as commits. GitHub stores the public repository, while a GitHub Actions workflow publishes the contents of `code/` to GitHub Pages.

I learned the difference between:

- **Commit:** record a version locally.
- **Push:** send local commits to GitHub.
- **Deploy:** publish the website files so visitors can use them.

I also learned that deployment configuration matters. When GitHub Pages used its legacy Jekyll source, it converted `README.md` into the homepage. Switching Pages back to the GitHub Actions workflow restored `code/index.html` as the actual website.

## 18. Important design decisions I made

- One sentence always creates exactly one dot.
- All entries for a month share one evolving canvas.
- Mood analysis remains understandable and keyword-based.
- Boredom is its own mood rather than Neutral.
- Multiple recognized moods produce one score-weighted gradient.
- Neutral appears only when no non-neutral mood is recognized.
- A manual palette selection creates one solid-color override.
- Editing text preserves the original paint.
- Removing an entry has a three-second Undo period.
- People can add custom mood vocabulary and colors.
- Journal data stays in the browser for privacy.
- Mood names remain visible so the app does not rely on color alone.

## Ideas discussed but not implemented

- Choosing replacement colors for each part of a mixed dot
- Changing gradient proportions manually
- Switching the calendar to Sunday-to-Saturday
- Accounts or cloud synchronization
- Image export and reminders
