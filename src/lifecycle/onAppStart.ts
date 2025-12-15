import { RapunzelLog } from '../config/log';
import { RapunzelStorage } from '../storage/rapunzelStorage';
import { LibraryUtils } from '../tools/library';
import { useRapunzelStore, LilithRepo, ViewNames } from '../store';

export const onAppStart = () => {
  RapunzelLog.warn('[OnAppStart]');
  const {
    config: [config],
    library: [library],
    latest: [latest],
    trending: [trending],
  } = useRapunzelStore();

  const hydrate = async () => {
    const storedConfig = await RapunzelStorage.loadConfig();
    Object.assign(config, { ...config, ...storedConfig });

    const storedLibrary = await RapunzelStorage.loadLibrary();
    const { saved, rendered } = LibraryUtils.buildLibraryState(
      storedLibrary,
      config,
    );
    library.saved = saved;
    library.rendered = rendered;

    const storedFeed = await RapunzelStorage.loadFeed();
    if (storedFeed.latest) {
      Object.assign(latest, storedFeed.latest);
    }
    if (storedFeed.trending) {
      Object.assign(trending, storedFeed.trending);
    }

    if (config.repository === LilithRepo.NHentai) {
      config.initialView = ViewNames.RapunzelWebView;
    }
  };

  hydrate().catch((error) => RapunzelLog.warn('[onAppStart] hydrate failed', error));
};
