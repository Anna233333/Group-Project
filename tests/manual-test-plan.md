# Daily Canvas manual test plan

## Core flow

- Open `code/index.html`; confirm the current day is selected.
- Submit an empty input; confirm no dot is created and an inline message appears.
- Enter “I am feeling down” and select **Paint**; confirm exactly one blue dot appears.
- Enter “I feel calm after a long walk”; confirm a green Calm suggestion and one new dot.
- Enter an unknown phrase; confirm the suggestion is Neutral.
- Choose a different palette color before painting; confirm the dot uses the chosen color.
- Refresh the page; confirm all dots retain their positions and appearances.

## Calendar and entries

- Select another day in the same month, add a moment, and confirm both days’ dots share the monthly canvas.
- Confirm the monthly moment list shows the date for every entry.
- Navigate to another month and confirm its canvas contains only that month’s entries.
- Navigate to the previous and next months.
- Confirm dates with entries show miniature colored dots.
- Select a painted dot; confirm its matching sentence is revealed in the moment list.
- Select **Edit** beside a moment; confirm an editor opens inside that moment row while the Paint composer remains unchanged.
- Change the sentence and select **Save**; confirm the existing entry updates without creating another dot or changing its color, date, or position.
- Select **Edit**, then **Cancel**, and confirm the saved entry is unchanged.
- Remove an entry and select **Undo** within three seconds; verify the same dot returns with its original text, color, date, and position.
- Confirm the visible **Undo** button accepts pointer and keyboard input while the toast is open.
- Remove an entry without selecting **Undo**; verify the action becomes permanent after three seconds.
- Remove two entries quickly; verify only the most recently removed entry remains undoable.

## Language rules

- “I am very happy” maps to Joy.
- “I am not happy” does not map to Joy solely because of “happy.”
- “I feel burned out” maps to Tiredness.
- “I feel bored” maps to Boredom rather than Neutral.
- “There is nothing to do” maps to Boredom.
- “I feel happy and anxious” produces one yellow-violet gradient dot labeled “Joy + Anxiety,” not Neutral.
- “I feel very happy, anxious, and tired” includes all three colors, with Joy receiving a larger share.
- Equal-score moods remain equally represented in their gradient.
- A sentence containing Neutral and another recognized mood omits Neutral from the mixture.
- Explicit Neutral by itself remains Neutral.

## Personalization

- Add “jealous” with a custom green; confirm it appears in the palette and legend.
- Enter “I feel jealous”; confirm the new custom mood is suggested.
- Enter a sentence containing “jealous” and a built-in mood; confirm the custom color participates in one mixed dot.
- Refresh the page; confirm the custom mood and color remain available.
- Change the color of a built-in mood; confirm its palette swatch, legend, and its portion of existing mixed dots update.
- Try to add an existing keyword; confirm the app prevents the duplicate.

## Mixed-mood compatibility

- While a mixed suggestion is visible, manually select one palette mood and paint; confirm the saved dot is solid and uses only the chosen mood.
- Refresh after saving a mixed dot; confirm its colors, proportions, label, date, and position persist.
- Edit the sentence for a mixed dot; confirm its saved colors, label, date, and position do not change.
- Load an entry created by an earlier version without `moodComponents`; confirm it still renders as its original single-color dot.
- Confirm the canvas dot, calendar preview, suggestion swatch, and moment-list swatch all use the same gradient.

## Accessibility and layout

- Complete the write, color-select, paint, calendar, and remove flows using only a keyboard.
- Confirm focus indicators remain visible.
- Confirm each calendar date and paint dot has a useful screen-reader label.
- Confirm mixed labels and dot descriptions name every component in strongest-first order.
- Test at desktop, tablet, and narrow mobile widths.
- Enable reduced motion and confirm dot and scroll animations are suppressed.
