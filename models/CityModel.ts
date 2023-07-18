import { model, models } from "mongoose";
import { ICity } from "../interfaces/ICity";
import { citySchema } from "../schemas/citySchema";
export const cityModel = models.City || model<ICity>("City", citySchema);
