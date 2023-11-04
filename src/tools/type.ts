export type TypeExecutor<T> = (...args: any[]) => T;
export interface UseTypedExecutorProps<T extends unknown> {
    string: TypeExecutor<string>;
    boolean: TypeExecutor<boolean>;
    number: TypeExecutor<number>;
    object: TypeExecutor<Record<keyof T, T>>;
    array: TypeExecutor<T[]>;
}

const useTypedExecutor = <Type>(
    props: Partial<UseTypedExecutorProps<Type>>,
    value: Type,
): TypeExecutor<Type> => {
    let exec = ((...args: any[]) => {}) as TypeExecutor<any>;

    const { string, boolean, number, array, object } = props;

    switch (typeof value) {
        case "string":
            string && (exec = string);
            break;
        case "boolean":
            boolean && (exec = boolean);
            break;
        case "number":
            number && (exec = number);
            break;
        case "object":
            if (Array.isArray(value)) array && (exec = array);
            else object && (exec = object);
            break;
    }
    return exec;
};

export const TypeTools = { useTypedExecutor };
