import { describe, expect, test } from "@jest/globals";
import { LilithRepo } from "../src/store/interfaces";
import { getRepositoryMascot } from "../src/components/navigators/repositoryMascots";

const repositories = Object.values(LilithRepo) as LilithRepo[];

describe("repository mascots", () => {
    test.each(repositories)(
        "provides a mascot for %s",
        (repository: LilithRepo) => {
            expect(getRepositoryMascot(repository)).toBeDefined();
        },
    );

    test("uses a distinct bundled mascot for each repository", () => {
        const mascots = repositories.map(getRepositoryMascot);

        expect(new Set(mascots).size).toBe(repositories.length);
    });
});
