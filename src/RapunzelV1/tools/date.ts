const getEpoch = (value?: number | string | Date): number => {
    return Math.floor((value ? new Date(value) : new Date()).getTime() / 1000);
};

const getDateFromEpoch = (epoch: number) => {
    return new Date(epoch * 1000);
};

export const DateUtils = {
    getEpoch,
    getDateFromEpoch,
};
