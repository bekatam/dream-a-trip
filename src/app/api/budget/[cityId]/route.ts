import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../../models/UserModel"

// GET - получить сохраненный бюджет для города
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
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

    const budget = user.budgets?.get(params.cityId) || null
    
    return NextResponse.json({ budget })
  } catch (error) {
    console.error("Ошибка при получении бюджета:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// POST - сохранить бюджет для города
export async function POST(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { destinations, foodPrice, hotelPrice, totalPrice } = body

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Инициализируем Map бюджетов, если его нет
    if (!user.budgets) {
      user.budgets = new Map()
    }

    // Сохраняем бюджет для города
    user.budgets.set(params.cityId, {
      destinations: destinations || [],
      foodPrice: foodPrice || 0,
      hotelPrice: hotelPrice || 0,
      totalPrice: totalPrice || 0,
      lastUpdated: new Date()
    })

    await user.save()

    return NextResponse.json({ 
      message: "Бюджет сохранен",
      budget: user.budgets.get(params.cityId)
    })
  } catch (error) {
    console.error("Ошибка при сохранении бюджета:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// DELETE - удалить сохраненный бюджет для города
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
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

    // Удаляем бюджет для города
    if (user.budgets) {
      user.budgets.delete(params.cityId)
      await user.save()
    }

    return NextResponse.json({ 
      message: "Бюджет удален"
    })
  } catch (error) {
    console.error("Ошибка при удалении бюджета:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
