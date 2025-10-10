"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  Heart,
  Wallet,
  Calendar,
  TrendingUp,
  Globe,
  Settings,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
} from "lucide-react"
import { getData, type Destination } from "@/app/endpoints/axios"

export default function ProfilePage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  // Mock user data - in real app, this would come from auth context
  const user = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    avatar: "/diverse-user-avatars.png",
    memberSince: "Январь 2024",
  }

  // Mock favorites - in real app, this would be stored in database
  const [favorites, setFavorites] = useState<string[]>(["1", "2", "4"])

  // Mock expenses - in real app, this would come from database
  const expenses = [
    { id: 1, destination: "Сеул", amount: 51000, date: "2024-03-15", category: "Путешествие" },
    { id: 2, destination: "Париж", amount: 69000, date: "2024-02-20", category: "Путешествие" },
    { id: 3, destination: "Алматы", amount: 32000, date: "2024-01-10", category: "Путешествие" },
  ]

  // Mock travel plans
  const travelPlans = [
    {
      id: 1,
      destination: "Рим",
      country: "Италия",
      startDate: "2024-06-15",
      endDate: "2024-06-22",
      budget: 74000,
      status: "planned",
    },
    {
      id: 2,
      destination: "Париж",
      country: "Франция",
      startDate: "2024-08-01",
      endDate: "2024-08-08",
      budget: 69000,
      status: "planned",
    },
  ]

  // Calculate stats
  const stats = {
    totalTrips: expenses.length,
    totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    countriesVisited: new Set(expenses.map((exp) => exp.destination)).size,
    upcomingTrips: travelPlans.length,
  }

  useEffect(() => {
    const loadDestinations = async () => {
      const data = await getData()
      setDestinations(data)
      setLoading(false)
    }
    loadDestinations()
  }, [])

  const favoriteDestinations = destinations.filter((dest) => favorites.includes(dest._id))

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                  <p className="text-muted-foreground mb-2">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Участник с {user.memberSince}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Поездок
                  </div>
                  <p className="text-2xl font-bold">{stats.totalTrips}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Wallet className="h-4 w-4" />
                    Потрачено
                  </div>
                  <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} ₸</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Globe className="h-4 w-4" />
                    Стран
                  </div>
                  <p className="text-2xl font-bold">{stats.countriesVisited}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    Планируется
                  </div>
                  <p className="text-2xl font-bold">{stats.upcomingTrips}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Wallet className="h-4 w-4" />
              Расходы
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-2">
              <Calendar className="h-4 w-4" />
              Планы
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Избранные направления</h2>
                <p className="text-muted-foreground">Места, которые вы сохранили для будущих путешествий</p>
              </div>
              <Button asChild>
                <Link href="/list">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : favoriteDestinations.length === 0 ? (
              <Card className="p-12 text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет избранных направлений</h3>
                <p className="text-muted-foreground mb-6">Начните добавлять места, которые хотите посетить</p>
                <Button asChild>
                  <Link href="/list">Исследовать направления</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteDestinations.map((dest) => (
                  <Card key={dest._id} className="overflow-hidden group hover:shadow-lg transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={dest.image || "/placeholder.svg"}
                        alt={`${dest.city}, ${dest.country}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                        onClick={() => setFavorites(favorites.filter((id) => id !== dest._id))}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold mb-1">{dest.city}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3.5 w-3.5" />
                        {dest.country}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">От</p>
                          <p className="text-lg font-bold">{dest.price.toLocaleString()} ₸</p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/city/${dest._id}`}>
                            Подробнее
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">История расходов</h2>
                <p className="text-muted-foreground">Отслеживайте свои траты на путешествия</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Последние расходы</CardTitle>
                  <CardDescription>Ваши недавние траты на путешествия</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{expense.destination}</h4>
                            <p className="text-sm text-muted-foreground">{expense.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{expense.amount.toLocaleString()} ₸</p>
                          <Badge variant="secondary" className="text-xs">
                            {expense.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Статистика
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Всего потрачено</p>
                      <p className="text-3xl font-bold">{stats.totalSpent.toLocaleString()} ₸</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
                      <p className="text-2xl font-bold">
                        {Math.round(stats.totalSpent / stats.totalTrips).toLocaleString()} ₸
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Поездок в этом году</p>
                      <p className="text-2xl font-bold">{stats.totalTrips}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Совет по экономии</h4>
                    <p className="text-sm text-muted-foreground">
                      Бронируйте билеты за 2-3 месяца до поездки, чтобы сэкономить до 30%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Планы путешествий</h2>
                <p className="text-muted-foreground">Ваши предстоящие поездки</p>
              </div>
              <Button asChild>
                <Link href="/list">
                  <Plus className="h-4 w-4 mr-2" />
                  Новый план
                </Link>
              </Button>
            </div>

            {travelPlans.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет запланированных поездок</h3>
                <p className="text-muted-foreground mb-6">Начните планировать свое следующее приключение</p>
                <Button asChild>
                  <Link href="/list">Выбрать направление</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {travelPlans.map((plan) => (
                  <Card key={plan.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">{plan.destination}</CardTitle>
                          <CardDescription className="text-base mt-1">{plan.country}</CardDescription>
                        </div>
                        <Badge className="bg-success text-white">Запланировано</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Начало</p>
                          <p className="font-semibold">{new Date(plan.startDate).toLocaleDateString("ru-RU")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Окончание</p>
                          <p className="font-semibold">{new Date(plan.endDate).toLocaleDateString("ru-RU")}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-muted-foreground">Бюджет</p>
                          <p className="text-xl font-bold">{plan.budget.toLocaleString()} ₸</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Изменить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Настройки профиля</h2>
              <p className="text-muted-foreground">Управляйте своим аккаунтом и предпочтениями</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Личная информация</CardTitle>
                  <CardDescription>Обновите свои личные данные</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Имя</p>
                    <p className="text-muted-foreground">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Редактировать профиль
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Предпочтения</CardTitle>
                  <CardDescription>Настройте параметры путешествий</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Валюта</p>
                    <p className="text-muted-foreground">Тенге (₸)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Язык</p>
                    <p className="text-muted-foreground">Русский</p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Изменить настройки
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-destructive">Опасная зона</CardTitle>
                  <CardDescription>Необратимые действия с вашим аккаунтом</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full md:w-auto">
                    Удалить аккаунт
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
