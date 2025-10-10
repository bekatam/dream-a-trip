import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../models/UserModel"

// GET - получить все сохраненные бюджеты пользователя
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

    const budgets = user.budgets ? Object.fromEntries(user.budgets) : {}
    
    return NextResponse.json({ budgets })
  } catch (error) {
    console.error("Ошибка при получении бюджетов:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
