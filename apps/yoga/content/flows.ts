// Pio's class plans, typed up from the notebook.
// Shorthand expanded: HL = high lunge, W1/W2 = warrior I/II, t-top = tabletop,
// SC = striking cobra, d-dog = downward dog, f-fold = forward fold, vin = vinyasa.
//
// Structure:
//   pieces  – reusable building blocks (warm-ups, drills, ladders, core, closing words…)
//   classes – full class plans; each part is either a piece ({ use: "piece-id" }) or an inline step.
// Focus tags and peak poses connect related classes.

export type Tag = "optional" | "dynamic" | "peak" | "unsure";
export type Pose = { n: string; note?: string; tags?: Tag[] };
/** A group of poses. With `label` (e.g. "×3") it is drawn as a repeat bracket; with only `title` it is a sub-heading. */
export type Group = { group: Item[]; label?: string; title?: string };
export type Item = string | Pose | Group;

export type BlockType =
  | "arrive"
  | "warmup"
  | "sun"
  | "drill"
  | "flow"
  | "core"
  | "peak"
  | "release"
  | "cooldown"
  | "rest"
  | "closing";

export type Round = { items: Item[]; after?: string; note?: string };

export type Step =
  | { kind: "block"; type: BlockType; title?: string; items: Item[]; note?: string }
  | { kind: "ladder"; title: string; rounds: Round[]; note?: string }
  | { kind: "vinyasa"; note?: string }
  | { kind: "words"; lines: string[] };

export type PieceCategory = "warmup" | "sun" | "drill" | "standing" | "ladder" | "core" | "closing";

export type Piece = {
  id: string;
  category: PieceCategory;
  title: string;
  subtitle?: string;
  note?: string;
  steps: Step[];
};

export type Part = { use: string; note?: string } | Step;

export type ClassPlan = {
  slug: string;
  title: string;
  subtitle?: string;
  duration?: string;
  focus: string[];
  peaks: string[];
  note?: string;
  parts: Part[];
};

// --- helpers to keep the data readable -------------------------------------
const opt = (n: string, note?: string): Pose => ({ n, note, tags: ["optional"] });
const dyn = (n: string, note?: string): Pose => ({ n, note, tags: ["dynamic"] });
const peak = (n: string, note?: string): Pose => ({ n, note, tags: ["peak"] });
const unsure = (n: string, note?: string): Pose => ({ n, note, tags: ["unsure"] });
const g = (group: Item[], label?: string): Group => ({ group, label });
const sub = (title: string, group: Item[]): Group => ({ title, group });
const block = (type: BlockType, title: string | undefined, items: Item[], note?: string): Step => ({
  kind: "block",
  type,
  title,
  items,
  note,
});
const vin = (note?: string): Step => ({ kind: "vinyasa", note });
const ladder = (title: string, rounds: Round[], note?: string): Step => ({ kind: "ladder", title, rounds, note });
const use = (id: string, note?: string): Part => ({ use: id, note });

// --- building blocks ---------------------------------------------------------
export const pieces: Piece[] = [
  {
    id: "joint-warmup",
    category: "warmup",
    title: "Joint warm-up",
    subtitle: "Top to bottom, neck to feet",
    steps: [block("warmup", undefined, ["Neck: bend, twist", "Arms & shoulders", "Wrists", "Hips & glutes", "Feet"])],
  },
  {
    id: "feet-warmup",
    category: "warmup",
    title: "Feet warm-up",
    subtitle: "Ball of the foot, heel raises, dorsi plank",
    steps: [
      block("warmup", undefined, [
        "Feel the foot on the ball of the foot: rotations",
        "Heel raises, both legs",
        { n: "Single heel raises", note: "10 each side" },
        { n: "Stretch the midfoot", note: "1 min, easy" },
        "Foot dorsi plank",
        g(["Heel raises rotating on the ball of the foot", "Foot rotations lying down"]),
      ]),
    ],
  },
  {
    id: "tabletop-series",
    category: "warmup",
    title: "Tabletop series",
    subtitle: "Spine, hips and twists on all fours",
    note: "Merged from three classes. Pick what fits the day.",
    steps: [
      block("warmup", undefined, [
        "Cat–cow",
        "Hip circles",
        "Tiger → tiger push-up",
        "Open to the side",
        g(["Easy twist", "Thread the needle"], "×3–5"),
        "Counter-twist",
        "Leg Pilates → glutes",
      ]),
    ],
  },
  {
    id: "sun-salutations",
    category: "sun",
    title: "Sun salutations",
    subtitle: "With add-ons you like to use",
    steps: [
      block("sun", undefined, [
        "Sun salutations",
        sub("Add-ons", [
          opt("Striking cobra"),
          opt("Reverse tabletop (crab) from downward dog"),
          opt("Malasana mobility → garland"),
        ]),
      ]),
    ],
  },
  {
    id: "chaturanga-drill",
    category: "drill",
    title: "Chaturanga drill",
    subtitle: "Yoga push-ups",
    steps: [
      block(
        "drill",
        undefined,
        ["Yoga push-ups", opt("→ reverse tabletop → half camel")],
        "Find the body-gliding feeling, then chaturanga technique.",
      ),
    ],
  },
  {
    id: "core-boats",
    category: "core",
    title: "Core: boats & side plank",
    steps: [
      block("core", undefined, [
        g([{ n: "Boat, high & low", note: "lower boat, pulses" }, "Raise"], "×3"),
        "Side plank: open, then bind",
        opt("Reverse tabletop block"),
      ]),
    ],
  },
  {
    id: "flow-1",
    category: "standing",
    title: "Flow 1",
    subtitle: "Lunges to warrior II to malasana",
    steps: [
      block("flow", undefined, [
        "High lunge, cactus arms",
        "Low lunge twist",
        "High lunge",
        "Warrior II",
        "Reverse warrior",
        "Side angle",
        "Skandasana",
        "Malasana",
      ]),
    ],
  },
  {
    id: "flow-2",
    category: "standing",
    title: "Flow 2",
    subtitle: "Pyramid to warrior III",
    steps: [
      block("flow", undefined, ["Pyramid", "Revolved pyramid", "Warrior III", "Skandasana", unsure("High lunge")]),
      block("core", undefined, ["Core"]),
    ],
  },
  {
    id: "shoulder-ladder",
    category: "ladder",
    title: "Shoulder ladder",
    subtitle: "Chair, chaturanga, locust, camel",
    steps: [
      ladder(
        "Shoulder ladder",
        [
          {
            items: ["Urdhva hastasana", "Chair", "Twisted chair", "Chaturanga", "Half locust", "Locust"],
            after: "Core block: boats (or a reverse tabletop block)",
          },
          {
            items: [
              "Urdhva hastasana",
              "Chair",
              "Twisted chair",
              "Chaturanga",
              "Locust",
              "Half camel",
              "Seated / Shiva twist",
              "Seated side bend",
            ],
            after: "Vinyasa",
          },
          {
            items: [
              "Urdhva hastasana",
              "Chair",
              "Twisted chair",
              "Chaturanga",
              "Locust",
              "Half camel",
              opt("Camel"),
              "Seated neck side stretch",
              "Seated / Shiva twist",
              opt("Reverse tabletop"),
            ],
          },
        ],
        "v2: you can add reverse tabletop to each vinyasa.",
      ),
    ],
  },
  {
    id: "warrior-ladder",
    category: "ladder",
    title: "W-flow",
    subtitle: "Warrior ladder up to dancer",
    steps: [
      ladder("W-flow", [
        {
          items: [
            "High lunge",
            "High lunge, back heel down",
            "Warrior I → humble warrior",
            "Pyramid",
            g(["Warrior II", "Reverse warrior", "Extended side angle"], "loop"),
            "Straight leg in front / to the side",
            "Standing quad stretch",
          ],
          after: "Vinyasa with striking cobra",
        },
        {
          items: ["High lunge", "Twisted high lunge", "Warrior II → reverse warrior → side angle", "Triangle", "Tree pose"],
          after: "Vinyasa → half camel, camel → puppy",
        },
        {
          items: [
            "High lunge",
            "Twisted high lunge",
            unsure("Warrior II / Warrior I", "written “W2 1”"),
            "Triangle",
            "Skandasana",
            "Yogi squat",
            "Pistol squat up",
            peak("Dancer"),
          ],
        },
      ]),
    ],
  },
  {
    id: "backbend-ladder",
    category: "ladder",
    title: "Backbend ladder",
    subtitle: "Striking cobra up to wheel",
    steps: [
      ladder("Backbend ladder", [
        { items: ["Striking cobra", "Half locust", "Bridge"], after: "Core flow + child's pose" },
        { items: ["Striking cobra", "Half locust", "Locust", "Half camel", "Bridge"] },
        {
          items: ["Striking cobra", "Half locust", "Locust → bow", "Half camel", "Camel", "Bridge", peak("Wheel")],
        },
      ]),
    ],
  },
  {
    id: "knee-ladder",
    category: "ladder",
    title: "Knee flow",
    subtitle: "Low lunge, splits prep, crane",
    steps: [
      ladder(
        "Knee flow",
        [
          {
            items: [
              "Low lunge: untuck the back foot, raise the hands, open the hip to the side",
              dyn("Half hanumanasana"),
              dyn("Open to the side"),
              g([dyn("Twisted low lunge"), "Grab the leg"]),
              "Gate pose",
            ],
          },
          { items: ["Lizard", "Pigeon"] },
          { items: ["Malasana", "Skandasana", peak("Crane")] },
        ],
        "Each round is its own stage rather than a build-up.",
      ),
    ],
  },
  {
    id: "closing-words",
    category: "closing",
    title: "Closing words",
    steps: [
      {
        kind: "words",
        lines: [
          "You can be grateful for showing up for yourself.",
          "You chose your wellbeing today. It's only [time], and we're done.",
          "Some days will be easier and some days will be harder, but I hope you can keep choosing yourself every day.",
        ],
      },
    ],
  },
];

// --- classes -----------------------------------------------------------------
export const classes: ClassPlan[] = [
  {
    slug: "easy-shoulder-opening",
    title: "Easy shoulder opening",
    subtitle: "Chaturanga, locust and camel",
    focus: ["Shoulders", "Backbends", "Chaturanga"],
    peaks: ["Camel"],
    note: "Combines your v1 and v2 pages.",
    parts: [
      block("warmup", "Neck & shoulders", [
        sub("Neck", ["Side bends", "Seated twist"]),
        sub("Arms & shoulders", ["Rotator cuff: 90° elbow up & down, hold", "Wing rotations", "Circles"]),
        "Wrists",
      ]),
      use("tabletop-series"),
      use("chaturanga-drill"),
      use("sun-salutations", "Striking cobra and reverse tabletop add-ons fit this class."),
      use("shoulder-ladder"),
      block("release", "Seated shoulder & neck release", [
        "Rotate the arms in opposite directions",
        "Reach out towards the palm, look at it, hold",
        "Slowly turn the neck the other way, hold",
        "Seated side bend",
        "Seated grounding with cupped fingers: side neck stretches",
        opt("Reverse tabletop → seated twist, palm touching behind", "v2"),
      ]),
      block("cooldown", undefined, [
        { n: "Seated neck stretch", note: "sit on your hand or on the sacrum" },
        "Seated side bend",
        "Pec stretch",
        { n: "Fish pose", note: "if it's the group's first time doing fish" },
        "Seated forward fold",
        "Supine twist",
      ]),
      use("closing-words"),
    ],
  },

  {
    slug: "feet-to-wheel",
    title: "Feet to wheel",
    subtitle: "Untitled in the notebook: feet, warriors, backbends, knees",
    focus: ["Feet", "Standing", "Backbends", "Hips", "Core"],
    peaks: ["Dancer", "Wheel", "Crane"],
    note:
      "Your last photo batch as one class, in teaching order: standing → core → backbends → hips → cool-down. In the notebook, core and backbends came before the W-flow. It's long, so treat the later ladders as options.",
    parts: [
      use("feet-warmup"),
      block("warmup", "Arms", ["Palms & wrists", "Shoulder rotation"]),
      use("tabletop-series"),
      block("warmup", "Mobility", ["Knee up", "Straighten the leg in front", "Leg behind and around", "Malasana", "Wild thing"]),
      block("drill", "Foot change", ["Warrior II", "Warrior I", "High lunge"]),
      use("sun-salutations"),
      use("warrior-ladder"),
      use("core-boats"),
      use("backbend-ladder"),
      use("knee-ladder", "Lizard and pigeon here replace them in the cool-down."),
      block("cooldown", undefined, [
        "Child's pose",
        "Knee to chest",
        "Seated forward fold → twisted",
        "Seated wide-angle fold twist",
        "Deer pose",
        "Happy baby",
        "Supine twist",
        opt("IT band stretch"),
      ]),
      use("closing-words"),
    ],
  },

  {
    slug: "easier-warrior-flow",
    title: "Easier warrior flow",
    subtitle: "To dancer and wheel (not too easy)",
    focus: ["Standing", "Hips", "Balance", "Backbends"],
    peaks: ["Dancer", "Wheel"],
    parts: [
      use("joint-warmup"),
      use("sun-salutations", "Use the malasana mobility → garland add-on."),
      use("chaturanga-drill", "With reverse tabletop → half camel."),
      block("flow", "1 · Lunges & warrior", [
        "High lunge, cactus arms",
        "Low lunge twist",
        "High lunge",
        "Warrior II",
        "Reverse side angle",
      ]),
      block("flow", "2 · Wide legs", [
        "Wide-legged forward fold: grab the toes, open the shoulders",
        "Skandasana",
        "Malasana / garland",
      ]),
      block("flow", "3 · Balance", [
        "Standing leg forward, holding",
        "Leg to the side",
        "Leg forward, no hold",
        unsure("Dancing Shiva", "your note has a question mark"),
        peak("Dancer"),
      ]),
      block("peak", undefined, ["Knee to chest → bridge → wheel"]),
      block("cooldown", undefined, ["Lizard", "Pigeon", "Seated wide-legged side bend", "Twist"]),
      block("rest", undefined, ["Savasana"]),
      use("closing-words"),
    ],
  },

  {
    slug: "grounding-and-releasing",
    title: "Grounding and releasing",
    subtitle: "Hips, then triangle to crow",
    focus: ["Grounding", "Hips", "Arm balance"],
    peaks: ["Crow"],
    note: "The order of the middle boxes on this page is my best guess.",
    parts: [
      block("arrive", undefined, ["Meditation → breathwork → side stretch → twist"]),
      use("joint-warmup"),
      use("sun-salutations"),
      block("release", undefined, ["Easy sit with grounded palms: neck stretch"]),
      block("flow", "1 · Standing", [
        "Tadasana",
        "High lunge",
        "Low lunge → twist",
        "Warrior II → reverse → side angle",
        "Skandasana",
        "Malasana",
      ]),
      vin(),
      block("flow", "2 · Legs", ["Leg in front / to the side", unsure("Child's pose + kick-ups"), "Pistol squat down → malasana"]),
      block("flow", "3 · Hips", ["Garland", "Lizard", "Pigeon", opt("Pigeon, grab the back leg")]),
      vin(),
      block("peak", "4 · Arm balance", ["Triangle", "Wrist prep", peak("Crow")]),
      use("chaturanga-drill"),
      block("cooldown", undefined, [
        "Easy sit, grounded: neck stretch",
        "Side stretch",
        "Twist",
        "Viparita karani with shaking",
      ]),
      use("closing-words"),
    ],
  },

  {
    slug: "dynamic-twists",
    title: "Dynamic twists",
    subtitle: "Spirals, swings and side-to-side twists",
    focus: ["Twists", "Dynamic", "Feet", "Core"],
    peaks: [],
    parts: [
      block("arrive", undefined, ["Breathwork"]),
      block("warmup", "Feet", [
        "Roll the ball of the foot in warrior I or high lunge",
        "Raises",
        "Stretch",
        "Raises with rolling",
        "Stretch",
      ]),
      block("warmup", "Wrists & shoulders", ["Wrists: open, close, rotate", "Shoulder rolls"]),
      use("tabletop-series"),
      block("flow", "Dynamic part 1", [
        dyn("Seated side bends"),
        dyn("Seated twists"),
        dyn("Small arm spiral in front"),
        dyn("Bigger spiral"),
        dyn("Momentum swings in high lunge"),
        dyn("Step"),
        dyn("Punch"),
      ]),
      vin("low cobra hold / crocodile rest"),
      block("flow", "Warrior flow", [
        "Lunge",
        { n: "Warrior II → straight leg, hands above", note: "inhale" },
        "Reverse warrior",
        "Side angle",
        "Low lunge",
        "Easy twist",
        "Twist over the knee",
        "Touch the foot: side stretch",
      ]),
      vin(),
      block("flow", "Warrior flow again", [unsure("…but the twist is", "your notes stop here")]),
      use("core-boats"),
      vin(),
      block("flow", "Dynamic part 2", [dyn("Side-to-side twist")]),
      vin(),
      block("cooldown", undefined, ["Bind", "Shiva twist", "Supine twist"]),
      use("closing-words"),
    ],
  },

  {
    slug: "malasana-warrior-jumps",
    title: "Malasana & warrior jumps",
    subtitle: "Untitled in the notebook",
    duration: "75 min",
    focus: ["Dynamic", "Hips", "Standing"],
    peaks: [],
    parts: [
      block("arrive", undefined, ["Welcome, injuries, adjustments, breathwork"]),
      use("joint-warmup"),
      block("warmup", "Warm-up extras", ["Hips & glutes: malasana, lift the toes → squat up", "Core: froggy in-and-outs → boat"]),
      use("sun-salutations"),
      block("flow", "Standing", ["Mountain → lunge back → malasana", opt("→ wild thing")]),
      vin("walk to the top of the mat: cat walk, small steps"),
      block("drill", "Technique drill", [unsure("Warrior II jumps"), dyn("Warrior II → reverse → side angle")]),
      block("drill", "Malasana drill", ["Malasana → toes up", "Squat up", "Squat down", "Wild thing", "Fallen star"]),
      ladder(
        "Flow",
        [
          {
            items: [
              "Downward dog",
              "Three-legged dog",
              "Scorpion tail",
              "High lunge",
              "Low lunge",
              "Twist in low lunge",
            ],
            after: "Vinyasa",
          },
          {
            items: [
              "Downward dog",
              "Three-legged dog",
              "Scorpion tail",
              "High lunge",
              "Warrior II",
              "Reverse warrior",
              "Side angle",
              "Triangle",
            ],
          },
        ],
        "Round 2 starts with “D-dog …” in your notes; I filled in the start of round 1.",
      ),
      use("closing-words"),
    ],
  },

  {
    slug: "hamstrings",
    title: "Hamstrings",
    subtitle: "Walking pattern, eka pada and dancer",
    duration: "75 min",
    focus: ["Hamstrings", "Hips", "Balance"],
    peaks: ["Dancer"],
    parts: [
      block("arrive", undefined, ["Welcome, adjustments", "Breathwork / meditation"]),
      block("warmup", undefined, [
        "Neck",
        "Arms, shoulders, wrists, side bend, twist",
        "Hips: tabletop flow",
        "Glute bridges → seated forward fold",
        "Feet: feet stretch, figure 4",
      ]),
      block("drill", "Walking pattern", [dyn("Warm-up"), dyn("High lunge, bodyweight")]),
      block(
        "flow",
        "Main",
        ["Cactus high lunge", "Eka pada flow", peak("Dancer"), "Pistol squat down", "Baby grasshopper", "Lizard"],
        "Your alternative to skandasana → lizard → pigeon, which you crossed out.",
      ),
      block("cooldown", undefined, ["Wide-legged side bend", "Wide-legged fold", "Pigeon", "IT band stretch", "Supine eagle twist"]),
      use("closing-words"),
    ],
  },
];

/** Poses to keep practising (personal list, not a class). */
export const practiceList: string[] = [
  "Triangle + reverse triangle",
  "Pincha",
  "Handstand",
  "Crow",
  "Crane",
  "Side crow",
  "Backbend poses",
  "Hamstrings → pigeon",
  "Reverse tabletop",
  "Supta virasana → hero pose",
  "Malasana",
  "Skandasana",
  "Low lunge",
];

// --- connections -------------------------------------------------------------
export function isUse(part: Part): part is { use: string; note?: string } {
  return "use" in part;
}

export function getPiece(id: string): Piece {
  const piece = pieces.find((p) => p.id === id);
  if (!piece) throw new Error(`Unknown building block: ${id}`);
  return piece;
}

/** Classes that use a building block. */
export function usedIn(pieceId: string): ClassPlan[] {
  return classes.filter((c) => c.parts.some((p) => isUse(p) && p.use === pieceId));
}

function pieceIds(c: ClassPlan) {
  // Blocks nearly every class uses don't say much about how two classes relate.
  const common = ["closing-words", "sun-salutations"];
  return c.parts.filter(isUse).map((p) => p.use).filter((id) => !common.includes(id));
}

/** Related classes ranked by shared peaks, building blocks and focus. */
export function related(c: ClassPlan, limit = 3) {
  return classes
    .filter((o) => o.slug !== c.slug)
    .map((o) => {
      const peaks = o.peaks.filter((p) => c.peaks.includes(p));
      const focus = o.focus.filter((f) => c.focus.includes(f));
      const blocks = pieceIds(o).filter((id) => pieceIds(c).includes(id));
      const score = peaks.length * 3 + blocks.length * 2 + focus.length;
      const reasons = [...peaks.map((p) => `peak: ${p}`), ...focus, ...blocks.map((id) => getPiece(id).title)];
      return { cls: o, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function indexBy(key: (c: ClassPlan) => string[]) {
  const map = new Map<string, ClassPlan[]>();
  for (const c of classes) for (const k of key(c)) map.set(k, [...(map.get(k) ?? []), c]);
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

export const byFocus = () => indexBy((c) => c.focus);
export const byPeak = () => indexBy((c) => c.peaks);
