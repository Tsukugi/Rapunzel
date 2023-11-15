import { describe, expect, test } from "@jest/globals";
import { removeValuesInParenthesesAndBrackets } from "../src/tools/string";
describe("Tools", () => {
    test("String", () => {
        const test =
            "[some author(some tags)](another tags) title (final tags)";

        const res = removeValuesInParenthesesAndBrackets(test);

        expect(res).toEqual("title");
    });
});
