import { Router } from "express";
import { injectable, inject } from "tsyringe";
import { UtilityController } from "../../controllers/utility/utility-controller";

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
    this.router.get("/location", (req, res) => this.utilityController.getLocation(req, res));
  }
}
