import { injectable } from "tsyringe";
import { IGetLocationUsecase } from "../../interface/utility/get-location.usecase.interface";
import { logger } from "../../../../infrastructure/config/logger.config";

@injectable()
export class GetLocationUsecase implements IGetLocationUsecase {
  async execute(): Promise<{ country: string }> {
    try {
      const response = await fetch("https://ipwho.is/");
      const data = await response.json();

      if (data && data.success && data.country) {
        return { country: data.country };
      }

      //lookup succeeded but no country found:
      return { country: "" };
    } catch (error) {
      logger.error("Failed to detect location on backend:", { error });
      return { country: "" };
    }
  }
}
