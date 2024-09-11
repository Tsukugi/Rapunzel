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

export const ListUtils = {
    getVirtualItemHalf,
    getEmptyVirtualList,
};
