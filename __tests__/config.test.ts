import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { RapunzelConfig } from "../src/config/config";
import { onAppStart } from "../src/lifecycle/onAppStart";
import { ViewNames } from "../src/components/navigators/interfaces";
import { LilithRepo } from "../src/store/interfaces";

let mockStoreState: any;

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => mockStoreState,
}));

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        warn: jest.fn(),
    },
}));

beforeEach(() => {
    mockStoreState = {
        config: [
            {
                debug: true,
                initialView: ViewNames.RapunzelMainFeed,
                repository: LilithRepo.NHentai,
            },
            jest.fn(),
        ],
    };
});

describe("RapunzelConfig.executeOnlyOnDebug", () => {
    test("executes when debug is true", () => {
        const executable = jest.fn((a: number, b: number) => a + b);
        const result = RapunzelConfig.executeOnlyOnDebug({
            executable,
            args: [1, 2],
        });

        expect(executable).toHaveBeenCalledWith(1, 2);
        expect(result).toBe(3);
    });

    test("skips execution when debug is false", () => {
        mockStoreState.config[0].debug = false;
        const executable = jest.fn();
        const result = RapunzelConfig.executeOnlyOnDebug({
            executable,
            args: [],
        });

        expect(executable).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });
});

describe("onAppStart", () => {
    test("sets initial view to webview when repo is NHentai", () => {
        mockStoreState.config[0].repository = LilithRepo.NHentai;
        onAppStart();
        expect(mockStoreState.config[0].initialView).toBe(
            ViewNames.RapunzelWebView,
        );
    });

    test("keeps initial view when repo is not NHentai", () => {
        mockStoreState.config[0].repository = LilithRepo.MangaDex;
        onAppStart();
        expect(mockStoreState.config[0].initialView).toBe(ViewNames.RapunzelMainFeed);
    });
});
