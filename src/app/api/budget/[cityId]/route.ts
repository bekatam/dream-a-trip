import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../../models/UserModel"

// GET - получить сохраненный бюджет для города
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    const budget = user.budgets?.get(cityId) || null
    
    return NextResponse.json({ budget })
  } catch (error) {
    console.error("Ошибка при получении бюджета:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// POST - сохранить бюджет для города
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { destinations, foodPrice, hotelPrice, totalPrice, tripDate, defaultFoodPrice, defaultHotelPrice } = body

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Инициализируем Map бюджетов, если его нет
    if (!user.budgets) {
      user.budgets = new Map()
    }

    // Текущий бюджет, если существует
    const existing = (user.budgets.get(cityId) as any) || {}

    // Вычисляем значения с учетом дефолтов
    const nextFoodPrice = foodPrice ?? existing.foodPrice ?? 0
    const nextHotelPrice = hotelPrice ?? existing.hotelPrice ?? 0
    const nextDefaultFood =
      defaultFoodPrice ?? existing.defaultFoodPrice ?? (existing.defaultFoodPrice === undefined ? nextFoodPrice : existing.defaultFoodPrice)
    const nextDefaultHotel =
      defaultHotelPrice ?? existing.defaultHotelPrice ?? (existing.defaultHotelPrice === undefined ? nextHotelPrice : existing.defaultHotelPrice)

    // Сохраняем/обновляем бюджет для города
    user.budgets.set(cityId, {
      destinations: destinations ?? existing.destinations ?? [],
      foodPrice: nextFoodPrice,
      hotelPrice: nextHotelPrice,
      totalPrice: totalPrice ?? existing.totalPrice ?? 0,
      tripDate: tripDate ?? existing.tripDate ?? null,
      defaultFoodPrice: nextDefaultFood,
      defaultHotelPrice: nextDefaultHotel,
      lastUpdated: new Date()
    })

    await user.save()

    return NextResponse.json({ 
      message: "Бюджет сохранен",
      budget: user.budgets.get(cityId)
    })
  } catch (error) {
    console.error("Ошибка при сохранении бюджета:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// DELETE - удалить сохраненный бюджет для города
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
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
      user.budgets.delete(cityId)
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
