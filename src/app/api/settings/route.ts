import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../models/UserModel"

// PUT - обновить настройки пользователя
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { currency, language, notifications } = body

    // Валидация
    if (!currency || !language || typeof notifications !== "boolean") {
      return NextResponse.json({ error: "Все поля настроек обязательны" }, { status: 400 })
    }

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Обновляем настройки пользователя
    user.settings = {
      currency,
      language,
      notifications
    }

    await user.save()

    return NextResponse.json({ 
      message: "Настройки обновлены",
      settings: user.settings
    })
  } catch (error) {
    console.error("Ошибка при обновлении настроек:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// GET - получить настройки пользователя
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

    const settings = user.settings || {
      currency: "KZT",
      language: "ru",
      notifications: true
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Ошибка при получении настроек:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
