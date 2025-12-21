import type { CefrStandardsConfig } from "../types";

export const a0StandardsConfig: CefrStandardsConfig = {
  level: "A0",
  title: "A0 — Foundations (Pre-A1)",
  version: "2025-01-01",
  identity:
    "Absolute beginner learners (often French L1) building the first anchor points in English. Focus on concrete, highly supported input/output, neurodiverse-friendly pacing, and success through recognition and short, rehearsed production.",
  successLooksLike: [
    "Can recognize and respond to the most common greetings and classroom routines when spoken slowly and supported by visuals/gestures.",
    "Can produce short, memorized phrases about self (name, age, origin) and basic needs when prompted.",
    "Can copy or type common words/letters with acceptable accuracy and spacing.",
    "Can ask for repetition/clarification with rehearsed stems and gestures.",
  ],
  boundaries: {
    inScope: [
      "Hyper-high-frequency words and classroom language with visual support.",
      "Fixed phrases and single-word production about self and immediate needs.",
      "Letter-sound awareness, name spelling, copying/typing basics.",
      "Slow, clear models; heavy scaffolding; multimodal cues.",
    ],
    outOfScope: [
      "Abstract topics, extended narratives, or inferential reading/listening.",
      "Open-ended grammar explanations or metalanguage beyond simple labels.",
      "Free-form writing paragraphs or sustained spontaneous speaking.",
    ],
    acceptableErrors: [
      "Pronunciation influenced by French phonology if intelligible with context/gesture.",
      "Omitting articles or verb endings when the key content word is present.",
      "Orthographic slips on silent letters as long as letter order is mostly correct.",
    ],
  },
  pillars: [
    {
      id: "reception",
      title: "Reception (Listening + Reading basics)",
      description: "Recognize and decode the most common sounds, words, and classroom routines with support.",
      items: [
        {
          id: "rec-greetings-routines",
          label: "Understands slow greetings and routines",
          detail: "Recognizes hello/bye/please/thank you, class start/stop cues, and simple instructions with gestures.",
          examples: ["Hello/Hi", "Stand up/Sit down", "Open your book", "Repeat, please"],
        },
        {
          id: "rec-personal-info",
          label: "Catches personal info when supported",
          detail: "Can pick out name/age/origin when accompanied by visuals or written prompt.",
        },
        {
          id: "rec-letter-sounds",
          label: "Identifies letters and common sounds",
          detail: "Can match letters to typical English sounds, noticing tricky ones for FR L1 (h, th, w).",
        },
        {
          id: "rec-phonics-words",
          label: "Recognizes ultra-high-frequency words",
          detail: "Can spot and say words like yes/no/OK/stop/go/please/thank you in print and audio.",
        },
        {
          id: "rec-visual-support",
          label: "Uses visuals to confirm meaning",
          detail: "Checks pictures/icons to confirm understanding of short phrases or labels.",
        },
        {
          id: "rec-spell-name",
          label: "Understands name spelling prompts",
          detail: "Understands “How do you spell…?” and can follow along when teacher spells a name.",
        },
      ],
    },
    {
      id: "production",
      title: "Production (Speaking + Writing basics)",
      description: "Produce short, rehearsed language about self and classroom needs.",
      items: [
        {
          id: "prod-greetings",
          label: "Says greetings and leave-takings",
          detail: "Produces hello/bye/please/thank you with intelligible pronunciation when cued.",
        },
        {
          id: "prod-personal-phrase",
          label: "Shares personal mini-phrases",
          detail: "Produces memorized lines: name, age, city/country, likes (food/hobby) with support.",
        },
        {
          id: "prod-basic-requests",
          label: "Uses simple requests",
          detail: "Can say one- to three-word needs: “water?”, “bathroom?”, “again?”, “help, please.”",
        },
        {
          id: "prod-spell-name",
          label: "Spells name aloud",
          detail: "Can spell first name with intelligible letters; accepts mild letter-sound slips.",
        },
        {
          id: "prod-writing-copy",
          label: "Copies/typing short words",
          detail: "Copies or types high-frequency words with basic spacing and case; accepts some typos.",
        },
        {
          id: "prod-phrase-frame",
          label: "Uses frames for answers",
          detail: "Fills in frames like “I am ___”, “My name is ___”, “I like ___” when prompted.",
        },
      ],
    },
    {
      id: "interaction",
      title: "Interaction (micro-interactions)",
      description: "Handle tiny exchanges with support, including repair moves.",
      items: [
        {
          id: "int-turn-taking",
          label: "Handles basic turn-taking",
          detail: "Can respond to name call, say yes/no/okay, and wait/continue when cued.",
        },
        {
          id: "int-request-repeat",
          label: "Asks for repetition/clarification",
          detail: "Uses rehearsed stems + gesture: “Again?”, “Slower, please”, “I don’t understand.”",
        },
        {
          id: "int-confirm-choice",
          label: "Chooses from options",
          detail: "Can choose item/answer when given 2–3 options orally or in print.",
        },
        {
          id: "int-classroom-help",
          label: "Requests classroom help",
          detail: "Says/points for basic needs: “pen?”, “paper?”, “Where?”, “What page?”",
        },
        {
          id: "int-closing",
          label: "Closes interactions politely",
          detail: "Uses thanks/bye after receiving help; can repeat a short goodbye formula.",
        },
      ],
    },
    {
      id: "mediation",
      title: "Mediation (FR ↔ EN bridging)",
      description: "Bridge meaning between French and English for highly familiar items.",
      items: [
        {
          id: "med-rough-meaning",
          label: "Gives rough French meaning",
          detail: "Can say or gesture a French equivalent for very familiar English words/phrases.",
        },
        {
          id: "med-relay-instruction",
          label: "Relays simple instruction",
          detail: "Can pass on a simple English instruction to a peer in French (e.g., “Open your book”).",
        },
        {
          id: "med-cognates",
          label: "Notices safe cognates",
          detail: "Identifies obvious cognates (music, café, taxi) and avoids false friends when flagged.",
        },
        {
          id: "med-visual-support",
          label: "Points to visuals to help others",
          detail: "Uses images/gestures to explain meaning to peers with minimal English.",
        },
      ],
    },
    {
      id: "mechanics",
      title: "Mechanics (orthographic + graphomotor)",
      description: "Build the physical and visual scaffolding for reading/writing and typing basics.",
      items: [
        {
          id: "mech-case-spacing",
          label: "Uses case and spacing",
          detail: "Writes with basic spacing and distinguishes uppercase/lowercase in names and simple words.",
        },
        {
          id: "mech-letter-formation",
          label: "Forms key letters legibly",
          detail: "Forms letters that are distinct for English (b/p/d, m/n, u/v, w).",
        },
        {
          id: "mech-punctuation-basic",
          label: "Uses basic punctuation",
          detail: "Can place a period/full stop and capitalize sentence starts in copy tasks.",
        },
        {
          id: "mech-typing",
          label: "Types short items accurately",
          detail: "Types names/common words with acceptable accuracy; knows space/enter/backspace.",
        },
        {
          id: "mech-letter-sound-check",
          label: "Links letters to sounds while writing",
          detail: "Says sounds quietly while writing to self-check (phoneme-grapheme awareness).",
        },
      ],
    },
    {
      id: "strategies",
      title: "Strategies (learning-to-learn)",
      description: "Repair, plan, and self-monitor with simple tools.",
      items: [
        {
          id: "str-ask-repeat",
          label: "Asks for support",
          detail: "Uses rehearsed stems to ask for repetition, slower speech, or a model.",
        },
        {
          id: "str-gesture-support",
          label: "Uses gestures and visuals",
          detail: "Points, gestures, or draws to support meaning when blocked.",
        },
        {
          id: "str-chunking",
          label: "Chunks words/phrases",
          detail: "Breaks words into syllables or phrases to say/write them more accurately.",
        },
        {
          id: "str-notebook",
          label: "Keeps a mini phrase bank",
          detail: "Maintains a small list of key phrases and models (paper or digital).",
        },
        {
          id: "str-self-check",
          label: "Self-checks key details",
          detail: "Checks name spelling, spacing, and key sounds (h/th/w) before submitting.",
        },
        {
          id: "str-emotion",
          label: "Signals overload/needs a break",
          detail: "Uses a simple signal or phrase to pause when overwhelmed and re-engage later.",
        },
      ],
    },
  ],
};
