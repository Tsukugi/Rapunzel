export const removeValuesInParenthesesAndBrackets = (input: string): string => {
    const regex = /\([^)]*\)|\[[^\]]*\]/g;
    const res = input.replace(regex, "").trim();
    return res;
};

export const isNumeric = (str: string | number) => {
    if (typeof str != "string") return false; // we only process strings!
    return (
        !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
};
