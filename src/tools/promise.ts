type PromiseType<T> = () => Promise<T>;

interface RecursivePromisesProps<T> {
    promises: PromiseType<T>[];
    numLevels?: number;
    onPromiseSettled?: (result: T) => Promise<void>;
}

const recursivePromiseChain = async <T>({
    promises,
    numLevels = promises.length,
    onPromiseSettled = async (result: T) => {
        await Promise.resolve(result);
    },
}: RecursivePromisesProps<T>): Promise<PromiseType<T>[]> => {
    if (numLevels <= 0) {
        return Promise.resolve(promises);
    }

    const newPromises: PromiseType<T>[] = [];
    const promiseChain = promises.reduce(
        (chain, promise) =>
            chain.then(async (results) => {
                const result = await promise();
                await onPromiseSettled(result);
                return [...results, () => Promise.resolve(result)];
            }),
        Promise.resolve([] as PromiseType<T>[]),
    );

    const results = await promiseChain;
    const nextLevelPromises = await recursivePromiseChain({
        promises: newPromises,
        numLevels: numLevels - 1,
        onPromiseSettled: onPromiseSettled,
    });
    return [...results, ...nextLevelPromises];
};

export const PromiseTools = { recursivePromiseChain };
