export const removeValuesInParenthesesAndBrackets = (input: string): string => {
    const regex = /\([^)]*\)|\[[^\]]*\]/g;
    const res = input.replace(regex, "").trim();
    return res;
};
