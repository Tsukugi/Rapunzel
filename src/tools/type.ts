export type TypeExecutor<T> = (key: string, value: T) => T;
export interface UseTypedExecutorProps<T> {
    string: TypeExecutor<string>;
    boolean: TypeExecutor<boolean>;
    number: TypeExecutor<number>;
    object: TypeExecutor<T>;
    array: TypeExecutor<T[]>;
}

const typedExecutor = <Type>(
    props: Partial<UseTypedExecutorProps<Type>>,
    value: Type,
): TypeExecutor<Type> => {
    let exec: TypeExecutor<Type> = (_key, value) => value;

    const { string, boolean, number, array, object } = props;

    switch (typeof value) {
        case "string":
            string && (exec = string as unknown as TypeExecutor<Type>);
            break;
        case "boolean":
            boolean && (exec = boolean as unknown as TypeExecutor<Type>);
            break;
        case "number":
            number && (exec = number as unknown as TypeExecutor<Type>);
            break;
        case "object":
            if (Array.isArray(value)) {
                array && (exec = array as unknown as TypeExecutor<Type>);
            } else {
                object && (exec = object as unknown as TypeExecutor<Type>);
            }
            break;
    }
    return exec;
};

export const TypeTools = { typedExecutor };
