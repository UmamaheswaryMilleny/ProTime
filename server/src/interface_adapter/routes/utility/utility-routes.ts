import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { UtilityController } from "../../controllers/utility/utility-controller";
import { ROUTES } from "../../../shared/constants/constants.routes";

@injectable()
export class UtilityRoutes {
  public router: Router;

  constructor(
    @inject(UtilityController)
    private readonly utilityController: UtilityController
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(ROUTES.UTILITY.LOCATION, (req, res, next) => this.utilityController.getLocation(req, res, next));
  }
}
