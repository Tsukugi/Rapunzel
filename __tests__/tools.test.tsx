import { describe, expect, test } from "@jest/globals";
import {
    removeValuesInParenthesesAndBrackets,
    isNumeric,
} from "../src/tools/string";
describe("Tools", () => {
    test("String", () => {
        const test =
            "[some author(some tags)](another tags) title (final tags)";

        const res = removeValuesInParenthesesAndBrackets(test);

        expect(res).toEqual("title");
    });

    test("isNumeric", () => {
        expect(isNumeric("123")).toBe(true);
        expect(isNumeric("12.5")).toBe(true);
        expect(isNumeric("12a")).toBe(false);
        expect(isNumeric(42)).toBe(false);
    });
});
