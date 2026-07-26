import { ImageSourcePropType } from "react-native";
import { LilithRepo } from "../../store/interfaces";

const repositoryMascots: Record<LilithRepo, ImageSourcePropType> = {
    [LilithRepo.NHentai]: require("../../../assets/mascots/nhentai.png"),
    [LilithRepo.MangaDex]: require("../../../assets/mascots/mangadex.png"),
    [LilithRepo.EHentai]: require("../../../assets/mascots/ehentai.png"),
};

export const getRepositoryMascot = (
    repository: LilithRepo,
): ImageSourcePropType => repositoryMascots[repository];
