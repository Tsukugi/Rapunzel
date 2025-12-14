import { ViewNames } from '../store/types';
import { RapunzelLog } from '../config/log';
import { LilithRepo } from '../store/types';
import { useRapunzelStore } from '../store';

export const onAppStart = () => {
  RapunzelLog.warn('[OnAppStart]');
  const {
    config: [config],
  } = useRapunzelStore();

  if (config.repository === LilithRepo.NHentai) {
    config.initialView = ViewNames.RapunzelWebView;
  }
};
