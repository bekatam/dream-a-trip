import mongoose, { Model } from "mongoose"
import type { IUser } from "../interfaces/IUser"
import UserSchema from "../schemas/userSchema"

const modelName = "User"
const UserModel: Model<IUser> = (mongoose.models[modelName] as Model<IUser>) || mongoose.model<IUser>(modelName, UserSchema)

export default UserModel


