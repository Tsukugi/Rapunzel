export const DateUtils = {
  getEpoch: (value?: number | string | Date): number => {
    return Math.floor((value ? new Date(value) : new Date()).getTime() / 1000);
  },
  getDateFromEpoch: (epoch: number) => {
    return new Date(epoch * 1000);
  },
};
