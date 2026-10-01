# Group Project — Daily Canvas

This group project contains Daily Canvas, a private, browser-based pointillist mood journal. Write one sentence, choose **Paint**, and the app turns that moment into one paint dot. A sentence with several recognized feelings becomes one soft, multicolor dot, while every entry in a month joins the same evolving pointillist composition and retains its original date.

## Links

- **GitHub repository:** <https://github.com/Anna233333/Group-Project>
- **Live website:** <https://anna233333.github.io/Group-Project/>

## Project documentation

Development reflections, important prompts, and key computational ideas are documented in [`docs/learning-notes.md`](docs/learning-notes.md). Feature checks and testing iterations are recorded in [`tests/manual-test-plan.md`](tests/manual-test-plan.md).

## Reflections

Inspired by my teaching experience, I wanted to build a mood journal that tracks my mood throughout the day and translates words into impressionist artwork. Hence, my core interaction was to “Build a pointillist mood canvas for anyone who wants to visually track their daily feelings. When someone types an emotion sentence and clicks ‘Paint,’ it should place a single corresponding impressionist-style colored dot onto a canvas/calendar to represent that emotion (one sentence entry = one dot). Could you also use simple keyword analysis to map emotions to corresponding mood colors (e.g., I am feeling down may be a blue dot)?”

Codex created a simple calendar that lets me input a sentence (with a 240-character limit), and it shows isolated daily dots on the canvas, even though I expected the dots to accumulate monthly on the canvas. The original design was documented in the Design.md file. I asked Codex to change the isolated drawings to one evolving painting per month. During testing, I also noticed that some moods, like “boredom,” were classified as “neutral” by the system, so I added “bored” as its own dot color. I also prompted AI to add “the option to add your own word and choose your own color palette,” which let users customize their moods and colors. I also added the “Edit” and “Remove” features that allow users to edit their sentence after selecting “Paint.” With the “Remove” feature, I added a 3-second undo to prevent accidental deletion. When adding the “Edit,” “Remove,” and “Personalize Mood” features, I considered whether these buttons would undermine my intention of creating the “in-the-moment” vibe where users could capture their spontaneous feelings in the present moment throughout the day. However, from a usability standpoint, lacking these features may not account for typos or accidental misclicks. Ultimately, I balanced the tension between capturing the authentic moment and user comfort by adding the features, but users can only edit the written text, while the dot’s original color, date, and canvas position remain unchanged. Although working with AI allows me to ask Codex to help me implement these design elements, it also requires my perspective on how I feel the iterations would impact users and whether there is a gap between what I intend to create and the user's agency. Also, I wanted to mention that Codex created a calendar interface that defaults to Monday to Sunday rather than the traditional Sunday to Saturday layout in US calendars. Despite the unexpected layout, I decided to keep this weekly structure because I thought that having Saturday and Sunday together can offer an emotional reflection over the weekend. Also, I personally feel that Monday is the start of school/work.

Working with Codex bridged the gap in my lack of computational coding skills, but I was responsible for my decisions, evaluating how the website aligns with my intentions and my understanding of usability. While AI helped a lot with setting up the website, committing to GitHub, generating the computational code, and handling the behind-the-scenes work, I was primarily responsible for evaluating the user experience and whether it aligned with my original intentions. For example, when testing with multi-emotion inputs, such as feeling happy and sad in one sentence, I realized the initial algorithm canceled out the extreme feelings and marked it as a “neutral” dot. After reviewing this during office hours with Professor Li, I prompted AI to produce an option for soft multigradient colors with two or more moods. When I tested this in plan mode, AI offered options, such as whether the dot should contain equal amounts of color or be solid. These choices made me realize that, as the designer, I had the agency to choose what my pointillist canvas looks like and how it represents emotional complexities. In the end, I liked the idea of a multi-color gradient, where stronger or repeated feelings receive more visual space. The dots appear in randomized positions and sizes and correspond to the emotional color.

Despite these improvements, there are still design limitations and questions I need to keep thinking about.

- Currently, if I manually select a color from the color palette under Paint, it overwrites a multicolor dot with a single solid color (e.g., angry and sad produce a red-blue gradient, but I can overwrite it if I choose blue or another dot). It also doesn’t allow users to customize the individual components of the gradient when the sentence is multicolor.
- Furthermore, when multiple colors sit near each other on the monthly canvas, clicking one of the dots takes the user to the general region of entries (at the bottom of the page), creating spatial ambiguity because the user cannot match the dot to the specific entry.
- Lastly, the Daily Canvas automatically assigns the label "neutral" if the algorithm doesn’t recognize the input in the sentence or fails to categorize it as an emotion (e.g., when it categorizes "bored" as “neutral”). However, during my testing phase, I wondered what "neutral" represented. Was it a calm state, feeling nothing, or simply a lack of the required vocabulary? Likewise, if I write negations (e.g., “I am not happy”), or double negatives (e.g., “I am not not happy”), the algorithm codes it as “neutral” instead of “sad” or contextual shifts to happy. AI is really good at computations and data analysis (e.g., categorizing joy, happy, and enthusiastic into a color), but when it comes to meaning or even double negatives, I am primarily responsible for the human meaning behind it and building intentional designs to process linguistic meanings. For example, I need to determine how much visual space joy should occupy, whether “I guess I am sad” is the same visually as “I am sad,” and that “bored” is not “neutral.”

Ultimately, I realized that designing a tool that considers and categorizes human emotions requires unpacking and understanding the nuanced meanings behind simple color labels.

## Run it

No build step or dependencies are required.

1. Open `code/index.html` in a modern browser, or serve the project locally:

   ```sh
   cd code
   python3 -m http.server 8000
   ```

2. Visit `http://localhost:8000`.

Entries are stored in the browser's local storage and do not leave the device.

## Project structure

```text
Group Project/
├── README.md
├── .gitignore
├── code/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── docs/
│   ├── Design.md
│   └── learning-notes.md
└── tests/
    └── manual-test-plan.md
```

## Features

- One sentence creates exactly one impressionist-style dot.
- Transparent keyword analysis suggests built-in or custom mood colors.
- Multiple feelings produce one score-weighted gradient dot; stronger or repeated feelings receive more space while every recognized mood stays visible.
- Suggested colors can be overridden with one solid palette color before painting.
- Add personal mood words or phrases and assign custom colors.
- Recolor the built-in mood palette; preferences persist locally.
- One combined pointillist canvas per month, with a calendar for choosing entry dates.
- Deterministic dot placement: paintings remain stable after refresh.
- Local persistence, inline editing, deletion with a three-second undo, keyboard support, and reduced-motion support.

Neutral is used only when no non-neutral feeling is recognized. Mixed labels such as **Joy + Anxiety + Tiredness** remain visible in the moment list and accessible dot descriptions, so color is never the only signal. Editing an entry's words preserves its original paint, date, and position.

## Privacy

Daily Canvas is intentionally local-first. Clearing browser storage removes saved entries. It is a reflective art tool, not a diagnostic or mental-health assessment.
