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

const mergeVirtualItems = <T>(
    value: VirtualItem<T>[],
    newValues: VirtualItem<T>[],
) => {
    const byId = new Map(value.map((item) => [item.id, item]));
    const order = value.map((item) => item.id);

    newValues.forEach((item) => {
        if (!byId.has(item.id)) order.push(item.id);
        byId.set(item.id, item);
    });

    return order.map((id) => byId.get(id) as VirtualItem<T>);
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
    mergeVirtualItems,
    assignUpdatedList,
    getVirtualItemHalf,
    getEmptyVirtualList,
    sortAsc,
    sortDesc,
};
