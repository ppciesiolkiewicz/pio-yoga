import { describe, expect, it } from "vitest";
import {
  allBuckets,
  assign,
  bucketFor,
  controlBucket,
  defineExperiments,
  parseAssignment,
  parseBucket,
  pickVariant,
  serializeAssignment,
  type ExperimentDef,
} from "../src/experiments";

const hero: ExperimentDef = {
  variants: { control: "boring-bits", "easy-mode": "easy-mode" },
  weights: [50, 50],
  markets: ["en", "pl"],
};
const one = defineExperiments({ hero });
const two = defineExperiments({
  hero,
  design: { variants: { control: "dark-precision", editorial: "editorial" }, weights: [50, 50], markets: ["en"] },
});
const none = defineExperiments({});
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe("defineExperiments", () => {
  const bad = (def: Partial<ExperimentDef>, name = "x") => () =>
    defineExperiments({ [name]: { ...hero, ...def } as ExperimentDef });
  it("requires control as the first variant", () =>
    expect(bad({ variants: { a: "", control: "" } })).toThrow(/first variant must be "control"/));
  it("requires weights for every variant", () => expect(bad({ weights: [100] })).toThrow(/one weight per variant/));
  it("requires weights to sum to 100", () => expect(bad({ weights: [50, 40] })).toThrow(/sum to 100/));
  it("rejects negative or fractional weights", () => expect(bad({ weights: [110, -10] })).toThrow(/whole numbers/));
  it("rejects keys that are not lowercase-kebab", () => {
    expect(bad({}, "Hero")).toThrow(/key/);
    expect(bad({ variants: { control: "", "Easy Mode": "" } })).toThrow(/key/);
  });
  it("rejects unknown markets", () => expect(bad({ markets: ["de" as never] })).toThrow(/market/));
  it("returns the definitions unchanged", () => expect(one.hero).toBe(hero));
});

describe("pickVariant", () => {
  it("maps random 0..1 onto cumulative weights", () => {
    expect(pickVariant(hero, () => 0)).toBe("control");
    expect(pickVariant(hero, () => 0.4999)).toBe("control");
    expect(pickVariant(hero, () => 0.5)).toBe("easy-mode");
    expect(pickVariant(hero, () => 0.9999)).toBe("easy-mode");
  });
  it("never picks a weight-0 variant", () => {
    const ended = { ...hero, weights: [100, 0] };
    expect(pickVariant(ended, () => 0.9999)).toBe("control");
  });
  it("splits roughly 50/50 over many draws", () => {
    let s = 42;
    const lcg = () => ((s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
    let control = 0;
    for (let i = 0; i < 10_000; i++) if (pickVariant(hero, lcg) === "control") control++;
    expect(control).toBeGreaterThan(4800);
    expect(control).toBeLessThan(5200);
  });
});

describe("parseAssignment / serializeAssignment", () => {
  it("round-trips with sorted names", () => {
    expect(serializeAssignment({ hero: "control", design: "editorial" })).toBe("design:editorial|hero:control");
    expect(parseAssignment("design:editorial|hero:control")).toEqual({ design: "editorial", hero: "control" });
  });
  it("ignores garbage", () => {
    expect(parseAssignment(undefined)).toEqual({});
    expect(parseAssignment("%%%|hero|:x|Hero:control|hero:easy-mode")).toEqual({ hero: "easy-mode" });
  });
});

describe("assign", () => {
  it("assigns new visitors and reports a change", () =>
    expect(assign(one, undefined, () => 0.9)).toEqual({ assignment: { hero: "easy-mode" }, changed: true }));
  it("keeps a valid assignment", () =>
    expect(assign(one, "hero:control", () => 0.9)).toEqual({ assignment: { hero: "control" }, changed: false }));
  it("reassigns an unknown variant", () =>
    expect(assign(one, "hero:gone", () => 0.1)).toEqual({ assignment: { hero: "control" }, changed: true }));
  it("reassigns a variant whose weight dropped to 0", () => {
    const ended = defineExperiments({ hero: { ...hero, weights: [100, 0] } });
    expect(assign(ended, "hero:easy-mode", () => 0.9)).toEqual({ assignment: { hero: "control" }, changed: true });
  });
  it("drops experiments removed from config", () =>
    expect(assign(one, "old:control|hero:control", () => 0.9)).toEqual({
      assignment: { hero: "control" },
      changed: true,
    }));
  it("is a no-op with no experiments and no cookie", () =>
    expect(assign(none, undefined, () => 0.5)).toEqual({ assignment: {}, changed: false }));
  it("uses one random draw per new experiment", () =>
    expect(assign(two, undefined, seq(0.9, 0.1)).assignment).toEqual({ design: "editorial", hero: "control" }));
});

describe("buckets", () => {
  it("joins effective variants in sorted experiment order", () =>
    expect(bucketFor(two, { design: "editorial", hero: "easy-mode" }, "en")).toBe("editorial.easy-mode"));
  it("uses control where an experiment is not active in the market", () =>
    expect(bucketFor(two, { design: "editorial", hero: "easy-mode" }, "pl")).toBe("control.easy-mode"));
  it("uses control for missing assignments", () => expect(bucketFor(one, {}, "en")).toBe("control"));
  it("controlBucket", () => {
    expect(controlBucket(one)).toBe("control");
    expect(controlBucket(two)).toBe("control.control");
    expect(controlBucket(none)).toBe("default");
  });
  it("allBuckets lists every combination of live variants plus control", () => {
    expect(allBuckets(one)).toEqual(["control", "easy-mode"]);
    expect(allBuckets(two)).toEqual(["control.control", "control.easy-mode", "editorial.control", "editorial.easy-mode"]);
    expect(allBuckets(none)).toEqual(["default"]);
    const ended = defineExperiments({ hero: { ...hero, weights: [0, 100] } });
    expect(allBuckets(ended)).toEqual(["control", "easy-mode"]);
    const done = defineExperiments({ hero: { ...hero, weights: [100, 0] } });
    expect(allBuckets(done)).toEqual(["control"]);
  });
  it("parseBucket reverses bucketFor and rejects unknown buckets", () => {
    expect(parseBucket(two, "editorial.easy-mode")).toEqual({ design: "editorial", hero: "easy-mode" });
    expect(parseBucket(one, "nope")).toBeNull();
    expect(parseBucket(two, "control")).toBeNull();
    expect(parseBucket(none, "default")).toEqual({});
  });
});
