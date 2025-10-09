import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToMongo from "../../../utils/connectMongo"
import UserModel from "../../../../../models/UserModel"

export async function POST(req: Request) {
	try {
		const { name, email, password } = await req.json()

		if (!name || !email || !password) {
			return NextResponse.json({ message: "Все поля обязательны" }, { status: 400 })
		}

		await connectToMongo()

		const existing = await UserModel.findOne({ email })
		if (existing) {
			return NextResponse.json({ message: "Пользователь уже существует" }, { status: 409 })
		}

		const hash = await bcrypt.hash(password, 10)
		const user = await UserModel.create({
			name,
			email,
			password: hash,
			provider: "credentials",
		})

		return NextResponse.json({ id: user._id, email: user.email, name: user.name }, { status: 201 })
	} catch (e) {
		return NextResponse.json({ message: "Ошибка регистрации" }, { status: 500 })
	}
}


