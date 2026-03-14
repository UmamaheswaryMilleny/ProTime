import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import type { IGetLocationUsecase } from "../../../application/usecase/interface/utility/get-location.usecase.interface";
import { ResponseHelper } from "../../helpers/response.helper";
import { HTTP_STATUS } from "../../../shared/constants/constants";

@injectable()
export class UtilityController {
  constructor(
    @inject("IGetLocationUsecase")
    private readonly getLocationUsecase: IGetLocationUsecase
  ) {}

  async getLocation(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getLocationUsecase.execute();
      ResponseHelper.success(res, HTTP_STATUS.OK, 'Location fetched successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
