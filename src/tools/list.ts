import { VirtualItem } from "../components/virtualList/interfaces";

/**
 * We filter even images so we have half of the elements but each will have both as [odd, even]
 */
const getVirtualItemHalf = <T>(list: any[]) =>
    new Array(Math.floor((list.length + 1) / 2)).fill(null).map(
        (_, index) =>
            ({
                id: `${index}`,
                index,
                value: _,
            } as VirtualItem<T>),
    );

const getEmptyVirtualList = (size: number) =>
    new Array(size).fill(null).map((_, index) => ({
        id: `${index}`,
        index,
        value: "",
    }));

const sortAsc = (arr: number[]) => {
    return arr.sort((a, b) => {
        return b - a;
    });
};
const sortDesc = (arr: number[]) => {
    return arr.sort((a, b) => {
        return a - b;
    });
};

const mergeUniqueValues = <T>(value: T[], newValues: T[]) => {
    // Create a Set from the current state to ensure uniqueness
    const currentSet = new Set(value);
    newValues.forEach((value) => currentSet.add(value));
    return Array.from(currentSet);
};

const assignUpdatedList = <T>(
    value: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    newValue: T[],
) => {
    setter(ListUtils.mergeUniqueValues(value, newValue));
};

export const ListUtils = {
    mergeUniqueValues,
    assignUpdatedList,
    getVirtualItemHalf,
    getEmptyVirtualList,
    sortAsc,
    sortDesc,
};
