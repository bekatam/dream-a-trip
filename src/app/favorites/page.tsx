"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Heart, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getData } from "@/app/endpoints/axios"

interface FavoriteCity {
  _id: string
  city: string
  country: string
  price: number
  image: string
  descr: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      if (session?.user) {
        try {
          // Получаем список ID избранных городов
          const response = await fetch("/api/favorites")
          const data = await response.json()
          setFavoriteIds(data.favorites || [])

          // Получаем данные всех городов
          const allCities = await getData()
          
          // Фильтруем только избранные города
          const favorites = allCities.filter((city: any) => 
            data.favorites?.includes(city._id)
          )
          
          setFavoriteCities(favorites)
        } catch (error) {
          console.error("Ошибка при загрузке избранных:", error)
        }
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [session])

  const handleRemoveFavorite = async (cityId: string) => {
    try {
      await fetch(`/api/favorites/${cityId}`, { method: "DELETE" })
      setFavoriteCities(prev => prev.filter(city => city._id !== cityId))
      setFavoriteIds(prev => prev.filter(id => id !== cityId))
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Избранные города</h1>
            <p className="text-muted-foreground text-lg">
              Войдите в аккаунт, чтобы просматривать избранные города
            </p>
            <Button asChild>
              <Link href="/signin">Войти в аккаунт</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Загрузка избранных городов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/list">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к списку
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Избранные города</h1>
          <p className="text-muted-foreground">
            Ваши сохраненные города для путешествий
          </p>
        </div>

        {favoriteCities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет избранных городов</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте города в избранное, чтобы они появились здесь
              </p>
              <Button asChild>
                <Link href="/list">Посмотреть города</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCities.map((city) => (
              <Card key={city._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={city.image || "/placeholder.svg"}
                    alt={`${city.city}, ${city.country}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(city._id)}
                      className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    >
                      <Heart className="h-4 w-4 fill-current text-red-400" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{city.country}</span>
                  </div>
                  <CardTitle className="text-xl">{city.city}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {city.descr || "Описание города будет добавлено в ближайшее время"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {city.price.toLocaleString()} ₸
                    </Badge>
                    <Button asChild size="sm">
                      <Link href={`/city/${city._id}`}>Подробнее</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}