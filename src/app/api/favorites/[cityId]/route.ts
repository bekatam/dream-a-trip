import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectToMongo from "@/app/utils/connectMongo"
import UserModel from "../../../../../models/UserModel"

// GET - проверить, добавлен ли город в избранное
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

    const isFavorite = user.favorites?.includes(cityId) || false
    
    return NextResponse.json({ isFavorite })
  } catch (error) {
    console.error("Ошибка при проверке избранного:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// POST - добавить город в избранное
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

    await connectToMongo()
    const user = await UserModel.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 })
    }

    // Инициализируем массив избранного, если его нет
    if (!user.favorites) {
      user.favorites = []
    }

    // Проверяем, не добавлен ли уже этот город
    if (!user.favorites.includes(cityId)) {
      user.favorites.push(cityId)
      await user.save()
    }

    return NextResponse.json({ 
      message: "Город добавлен в избранное",
      isFavorite: true 
    })
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

// DELETE - удалить город из избранного
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

    // Удаляем город из избранного
    if (user.favorites) {
      user.favorites = user.favorites.filter((id: string) => id !== cityId)
      await user.save()
    }

    return NextResponse.json({ 
      message: "Город удален из избранного",
      isFavorite: false 
    })
  } catch (error) {
    console.error("Ошибка при удалении из избранного:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}