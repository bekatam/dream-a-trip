import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../models/UserModel"

// PUT - обновить профиль пользователя
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, avatar } = body

    // Валидация
    if (!name || !email) {
      return NextResponse.json({ error: "Имя и email обязательны" }, { status: 400 })
    }

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Обновляем данные пользователя
    user.name = name
    user.email = email
    if (avatar) {
      user.image = avatar
    }

    await user.save()

    return NextResponse.json({ 
      message: "Профиль обновлен",
      user: {
        name: user.name,
        email: user.email,
        image: user.image
      }
    })
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// GET - получить профиль пользователя
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        settings: user.settings || {
          currency: "KZT",
          language: "ru",
          notifications: true
        }
      }
    })
  } catch (error) {
    console.error("Ошибка при получении профиля:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
