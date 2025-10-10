"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Heart, Wallet, Calendar, Globe, Settings, Edit, Plus, ArrowRight, Trash2, TrendingUp } from "lucide-react"
import { getData } from "@/app/endpoints/axios"
import type { City } from "@/types"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [destinations, setDestinations] = useState<City[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [budgets, setBudgets] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [budgetsLoading, setBudgetsLoading] = useState(true)

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editSettingsOpen, setEditSettingsOpen] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
  })
  const [settingsForm, setSettingsForm] = useState({
    currency: "KZT",
    language: "ru",
    notifications: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Real user data from session
  const user = {
    name: session?.user?.name || "Пользователь",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "/diverse-user-avatars.png",
    memberSince: "Недавно", // TODO: Add createdAt to user session
  }

  // Calculate stats from real data
  const budgetEntries = Object.values(budgets)
  const totalBudgetSpent = budgetEntries.reduce((sum, budget) => sum + (budget.totalPrice || 0), 0)

  // Get unique countries from budgets
  const countriesFromBudgets = budgetEntries
    .map((budget, index) => {
      const cityId = Object.keys(budgets).find((key) => budgets[key] === budget)
      const city = destinations.find((dest) => dest._id === cityId)
      return city?.country
    })
    .filter(Boolean)

  const stats = {
    totalTrips: budgetEntries.length,
    totalSpent: totalBudgetSpent,
    countriesVisited: new Set(countriesFromBudgets).size,
    upcomingTrips: budgetEntries.length, // Use budgets as "upcoming trips"
  }

  // Load real data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load destinations
        const destinationsData = await getData()
        setDestinations(destinationsData)
        setLoading(false)

        // Load favorites
        const favoritesResponse = await fetch("/api/favorites")
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          setFavorites(favoritesData.favorites || [])
        }
        setFavoritesLoading(false)

        // Load budgets
        const budgetsResponse = await fetch("/api/budget")
        if (budgetsResponse.ok) {
          const budgetsData = await budgetsResponse.json()
          setBudgets(budgetsData.budgets || {})
        }
        setBudgetsLoading(false)

        // Load settings
        const settingsResponse = await fetch("/api/settings")
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          setSettingsForm(
            settingsData.settings || {
              currency: "KZT",
              language: "ru",
              notifications: true,
            },
          )
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setLoading(false)
        setFavoritesLoading(false)
        setBudgetsLoading(false)
      }
    }

    if (session) {
      loadData()
    }
  }, [session])

  // Initialize forms when session loads
  useEffect(() => {
    if (session?.user) {
      setProfileForm({
        name: session.user.name || "",
        email: session.user.email || "",
        avatar: session.user.image || "",
      })
    }
  }, [session])

  const favoriteDestinations = destinations.filter((dest) => favorites.includes(dest._id))

  // Function to remove from favorites
  const removeFromFavorites = async (cityId: string) => {
    try {
      const response = await fetch(`/api/favorites/${cityId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFavorites(favorites.filter((id) => id !== cityId))
      }
    } catch (error) {
      console.error("Ошибка при удалении из избранного:", error)
    }
  }

  // Function to update profile
  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        setEditProfileOpen(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
        // Refresh session or show success message
        window.location.reload() // Simple refresh for now
      } else {
        console.error("Ошибка при обновлении профиля")
      }
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to update settings
  const updateSettings = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsForm),
      })

      if (response.ok) {
        setEditSettingsOpen(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
        // Settings are already updated in local state
      } else {
        console.error("Ошибка при обновлении настроек")
      }
    } catch (error) {
      console.error("Ошибка при обновлении настроек:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Show loading while checking session
  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Изменения сохранены успешно!
          </div>
        </div>
      )}
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
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-2xl">Редактировать профиль</DialogTitle>
                      <DialogDescription className="text-base">
                        Внесите изменения в информацию о вашем профиле. Все поля обязательны для заполнения.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Имя
                        </Label>
                        <Input
                          id="name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="Введите ваше имя"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          placeholder="your@email.com"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar" className="text-sm font-medium">
                          URL аватара
                        </Label>
                        <Input
                          id="avatar"
                          value={profileForm.avatar}
                          onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                          className="h-11"
                        />
                        <p className="text-xs text-muted-foreground">
                          Вставьте ссылку на изображение для вашего аватара
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setEditProfileOpen(false)} disabled={isUpdating}>
                        Отмена
                      </Button>
                      <Button onClick={updateProfile} disabled={isUpdating} className="min-w-[120px]">
                        {isUpdating ? (
                          <span className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Сохранение...
                          </span>
                        ) : (
                          "Сохранить"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

            {favoritesLoading ? (
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
                        onClick={() => removeFromFavorites(dest._id)}
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
                  {budgetsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : budgetEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Нет данных о расходах</h3>
                      <p className="text-muted-foreground">Создайте бюджет для города, чтобы отслеживать расходы</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgetEntries.map((budget, index) => {
                        const cityId = Object.keys(budgets).find(key => budgets[key] === budget)
                        const city = destinations.find(dest => dest._id === cityId)
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{city?.city || "Неизвестный город"}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {budget.lastUpdated ? new Date(budget.lastUpdated).toLocaleDateString("ru-RU") : "Недавно"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{budget.totalPrice?.toLocaleString() || 0} ₸</p>
                              <Badge variant="secondary" className="text-xs">
                                Бюджет
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
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
                      <p className="text-sm text-muted-foreground mb-1">Средний бюджет</p>
                      <p className="text-2xl font-bold">
                        {stats.totalTrips > 0 ? Math.round(stats.totalSpent / stats.totalTrips).toLocaleString() : 0} ₸
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Создано бюджетов</p>
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

            {budgetsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : budgetEntries.length === 0 ? (
              <Card className="p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет запланированных поездок</h3>
                <p className="text-muted-foreground mb-6">Создайте бюджет для города, чтобы начать планирование</p>
                <Button asChild>
                  <Link href="/list">Выбрать направление</Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {budgetEntries.map((budget, index) => {
                  const cityId = Object.keys(budgets).find(key => budgets[key] === budget)
                  const city = destinations.find(dest => dest._id === cityId)
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-2xl">{city?.city || "Неизвестный город"}</CardTitle>
                            <CardDescription className="text-base mt-1">{city?.country || "Неизвестная страна"}</CardDescription>
                          </div>
                          <Badge className="bg-success text-white">Запланировано</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Создан</p>
                            <p className="font-semibold">
                              {budget.lastUpdated ? new Date(budget.lastUpdated).toLocaleDateString("ru-RU") : "Недавно"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Обновлен</p>
                            <p className="font-semibold">
                              {budget.lastUpdated ? new Date(budget.lastUpdated).toLocaleDateString("ru-RU") : "Недавно"}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Бюджет</p>
                            <p className="text-xl font-bold">{budget.totalPrice?.toLocaleString() || 0} ₸</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href={`/city/${cityId || ""}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Изменить
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive bg-transparent"
                            onClick={async () => {
                              if (!cityId) return
                              try {
                                const response = await fetch(`/api/budget/${cityId}`, {
                                  method: "DELETE",
                                })
                                if (response.ok) {
                                  const newBudgets = { ...budgets }
                                  delete newBudgets[cityId]
                                  setBudgets(newBudgets)
                                }
                              } catch (error) {
                                console.error("Ошибка при удалении бюджета:", error)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
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
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent"
                    onClick={() => setEditProfileOpen(true)}
                  >
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
                    <p className="text-muted-foreground">
                      {settingsForm.currency === "KZT"
                        ? "Тенге (₸)"
                        : settingsForm.currency === "USD"
                          ? "Доллар ($)"
                          : settingsForm.currency === "EUR"
                            ? "Евро (€)"
                            : settingsForm.currency === "RUB"
                              ? "Рубль (₽)"
                              : "Тенге (₸)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Язык</p>
                    <p className="text-muted-foreground">
                      {settingsForm.language === "ru"
                        ? "Русский"
                        : settingsForm.language === "en"
                          ? "English"
                          : settingsForm.language === "kk"
                            ? "Қазақша"
                            : "Русский"}
                    </p>
                  </div>
                  <Dialog open={editSettingsOpen} onOpenChange={setEditSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-transparent">
                        Изменить настройки
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                      <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl">Настройки путешествий</DialogTitle>
                        <DialogDescription className="text-base">
                          Настройте параметры для ваших путешествий и персонализируйте опыт использования.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="text-sm font-medium">
                            Валюта
                          </Label>
                          <Select
                            value={settingsForm.currency}
                            onValueChange={(value) => setSettingsForm({ ...settingsForm, currency: value })}
                          >
                            <SelectTrigger id="currency" className="h-11">
                              <SelectValue placeholder="Выберите валюту" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KZT">Тенге (₸)</SelectItem>
                              <SelectItem value="USD">Доллар ($)</SelectItem>
                              <SelectItem value="EUR">Евро (€)</SelectItem>
                              <SelectItem value="RUB">Рубль (₽)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Выберите валюту для отображения цен</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language" className="text-sm font-medium">
                            Язык интерфейса
                          </Label>
                          <Select
                            value={settingsForm.language}
                            onValueChange={(value) => setSettingsForm({ ...settingsForm, language: value })}
                          >
                            <SelectTrigger id="language" className="h-11">
                              <SelectValue placeholder="Выберите язык" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ru">Русский</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="kk">Қазақша</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Язык будет применен после сохранения</p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <Label className="text-sm font-medium">Уведомления</Label>
                          <div className="flex items-start space-x-3 rounded-lg border p-4">
                            <input
                              type="checkbox"
                              id="notifications"
                              checked={settingsForm.notifications}
                              onChange={(e) => setSettingsForm({ ...settingsForm, notifications: e.target.checked })}
                              className="mt-0.5 h-4 w-4 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                                Получать уведомления о новых предложениях
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Мы будем отправлять вам информацию о специальных предложениях и скидках
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditSettingsOpen(false)} disabled={isUpdating}>
                          Отмена
                        </Button>
                        <Button onClick={updateSettings} disabled={isUpdating} className="min-w-[120px]">
                          {isUpdating ? (
                            <span className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Сохранение...
                            </span>
                          ) : (
                            "Сохранить"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
