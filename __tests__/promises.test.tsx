import "react-native";
// Note: import explicitly to use the types shiped with jest.
import { test, describe, jest, expect } from "@jest/globals";
import { PromiseTools } from "../src/tools/promise";

describe("Promises helper functions", () => {
    test("Recursive promises", async () => {
        const promisesArray: (() => Promise<string>)[] = new Array(10)
            .fill(null)
            .map((_, index) => () => Promise.resolve("Promise " + index));

        let testIndex = 0;

        console.time();
        const total = await PromiseTools.recursivePromiseChain({
            promises: promisesArray,
            onPromiseSettled: async (result) => {
                console.timeLog();
                await new Promise<void>((res) => setTimeout(() => res(), 10));
                expect(result).toEqual(`Promise ${testIndex}`);
                testIndex++;
            },
        });

        expect(total.length).toEqual(promisesArray.length);

        const promises = await Promise.all(total);

        console.timeEnd();

        promises.forEach(async (promise, index) => {
            promise().then((result) =>
                expect(result).toEqual(`Promise ${index}`),
            );
        });
    });
});
