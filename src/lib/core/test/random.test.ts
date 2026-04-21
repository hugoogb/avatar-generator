import { describe, expect, it } from "vitest";
import { createRandom } from "@avatar-generator/core";

describe("createRandom", () => {
    it("returns the same sequence for the same seed", () => {
        const a = createRandom("Hugo GB");
        const b = createRandom("Hugo GB");

        const sequenceA = [a.next(), a.next(), a.next(), a.next(), a.next()];
        const sequenceB = [b.next(), b.next(), b.next(), b.next(), b.next()];

        expect(sequenceA).toEqual(sequenceB);
    });

    it("returns a different sequence for different seeds", () => {
        const a = createRandom("seed-one");
        const b = createRandom("seed-two");

        expect(a.next()).not.toBe(b.next());
    });

    it("advances the sequence across calls", () => {
        const r = createRandom("advance");
        const first = r.next();
        const second = r.next();

        expect(first).not.toBe(second);
    });

    describe("next", () => {
        it("returns numbers in [0, 1)", () => {
            const r = createRandom("range");
            for (let i = 0; i < 200; i++) {
                const n = r.next();
                expect(n).toBeGreaterThanOrEqual(0);
                expect(n).toBeLessThan(1);
            }
        });
    });

    describe("int", () => {
        it("returns integers within [min, max)", () => {
            const r = createRandom("int-range");
            for (let i = 0; i < 100; i++) {
                const n = r.int(5, 10);
                expect(Number.isInteger(n)).toBe(true);
                expect(n).toBeGreaterThanOrEqual(5);
                expect(n).toBeLessThan(10);
            }
        });
    });

    describe("pick", () => {
        it("returns an element from the array", () => {
            const r = createRandom("pick");
            const arr = ["a", "b", "c", "d"];
            for (let i = 0; i < 50; i++) {
                expect(arr).toContain(r.pick(arr));
            }
        });

        it("throws on empty array", () => {
            const r = createRandom("pick-empty");
            expect(() => r.pick([])).toThrow(/empty array/i);
        });

        it("is deterministic", () => {
            const a = createRandom("same");
            const b = createRandom("same");
            const arr = ["a", "b", "c", "d"];
            expect(a.pick(arr)).toBe(b.pick(arr));
        });
    });

    describe("bool", () => {
        it("returns true or false", () => {
            const r = createRandom("bool");
            for (let i = 0; i < 20; i++) {
                expect(typeof r.bool()).toBe("boolean");
            }
        });

        it("respects probability 0 (always false)", () => {
            const r = createRandom("bool-zero");
            for (let i = 0; i < 20; i++) {
                expect(r.bool(0)).toBe(false);
            }
        });

        it("respects probability 1 (always true)", () => {
            const r = createRandom("bool-one");
            for (let i = 0; i < 20; i++) {
                expect(r.bool(1)).toBe(true);
            }
        });
    });

    describe("shuffle", () => {
        it("returns an array with the same elements", () => {
            const r = createRandom("shuffle");
            const original = [1, 2, 3, 4, 5];
            const shuffled = r.shuffle([...original]);
            expect(shuffled.sort()).toEqual(original.sort());
        });

        it("is deterministic for a given seed", () => {
            const a = createRandom("shuffle-same");
            const b = createRandom("shuffle-same");
            expect(a.shuffle([1, 2, 3, 4, 5])).toEqual(b.shuffle([1, 2, 3, 4, 5]));
        });
    });
});
