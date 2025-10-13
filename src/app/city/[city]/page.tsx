"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { getData } from "@/app/endpoints/axios"
import axios from "axios"
import mongoose from "mongoose"
import { MapPin, Utensils, Hotel, Plus, X, Loader2, ArrowLeft, Heart, PlaneTakeoff, LandPlot } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Destination } from "@/types"

interface Item {
  city: string
  country: string
  price: number
  descr: string
  image: string
  destinations: Destination[]
  foodPrice: number
  hotelPrice: number
}

export default function CityPage() {
  const pathname = usePathname().substring(6)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [savedDestinations, setSavedDestinations] = useState<any[]>([])
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isPlanningTrip, setIsPlanningTrip] = useState(false)
  const [tripPlanned, setTripPlanned] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [items, setFilteredItems] = useState<Item[]>([
    {
      city: "",
      country: "",
      price: 0,
      descr: "",
      image: "",
      destinations: [
        {
          name: "",
          price: 0,
          link: "",
          isBlurred: false,
          _id: new mongoose.Types.ObjectId(),
        },
      ],
      foodPrice: 0,
      hotelPrice: 0,
    },
  ])

  useEffect(() => {
    const getDataAsync = async () => {
      const fetchedItems = await getData()
      const filtered = fetchedItems.filter((item: any) => item._id === pathname)
      setFilteredItems(filtered)

      // Fetch AI-generated data (description, places, prices)
      try {
        // prevent duplicate calls in React Strict Mode and when data already present
        const alreadyHasAiData =
          !!filtered[0] &&
          typeof filtered[0].descr === "string" &&
          filtered[0].descr.trim().length > 0 &&
          Array.isArray(filtered[0].destinations) &&
          filtered[0].destinations.length > 0

        // per-pathname guard
        const aiOnceKeyRef = aiOnceRef.current as any as { key?: string }
        if (alreadyHasAiData || aiOnceKeyRef.key === pathname) {
          setLoading(false)
          return
        }
        aiOnceKeyRef.key = pathname

        const aiRes = await axios.post("/api/describe", {
          selectedCity: filtered[0]?.city || "",
          cityId: filtered[0]?._id,
        })
        const { description, places, foodPrice, hotelPrice } = aiRes.data || {}

        const aiDestinations = Array.isArray(places)
          ? places.map((p: any) => ({
              name: p?.name || "",
              price: Number.parseInt(p?.price) || 0,
              link: p?.link || "",
              isBlurred: false,
              _id: new mongoose.Types.ObjectId(),
            }))
          : []

        setFilteredItems((prev) => [
          {
            ...prev[0],
            descr: typeof description === "string" ? description : prev[0]?.descr,
            destinations: [...(prev[0]?.destinations || []), ...aiDestinations],
            foodPrice: Number.isFinite(Number(foodPrice)) ? Number(foodPrice) : prev[0]?.foodPrice,
            hotelPrice: Number.isFinite(Number(hotelPrice)) ? Number(hotelPrice) : prev[0]?.hotelPrice,
          },
        ])
      } catch (e) {
        // Ignore AI errors, keep base data
      }

      setLoading(false)
    }
    getDataAsync()
  }, [pathname])

  // Check session and trigger data loading only once
  useEffect(() => {
    if (session?.user && !sessionChecked) {
      setSessionChecked(true)
    }
  }, [session, sessionChecked])

  // Check favorite status and load budget when session is available
  useEffect(() => {
    const checkFavoriteStatusAndLoadBudget = async () => {
      if (session?.user && sessionChecked) {
        try {
          // Проверяем статус избранного
          console.log("Проверяем избранное для города:", pathname)
          const favoriteResponse = await axios.get(`/api/favorites/${pathname}`)
          setIsFavorite(favoriteResponse.data.isFavorite)
          
          // Загружаем сохраненный бюджет
          await loadBudget()
        } catch (error) {
          console.error("Ошибка при загрузке данных пользователя:", error)
          // Если ошибка 404, возможно API endpoint не существует
          if (error && typeof error === 'object' && 'response' in error && 
              error.response && typeof error.response === 'object' && 
              'status' in error.response && error.response.status === 404) {
            console.log("API endpoint не найден, возможно сервер не перезапущен")
          }
        }
      }
    }
    checkFavoriteStatusAndLoadBudget()
  }, [sessionChecked, pathname])

  // one-time guard ref to avoid duplicate AI requests in dev Strict Mode
  const aiOnceRef = useRef<{ key?: string }>({})

  // Функция для объединения AI-данных с сохраненными состояниями
  const mergeAiDataWithSavedStates = (aiDestinations: any[], savedDestinations: any[]) => {
    return aiDestinations.map(aiDest => {
      // Ищем соответствующий сохраненный destination по имени
      const savedDest = savedDestinations.find(saved => 
        saved.name === aiDest.name && saved.link === aiDest.link
      )
      
      if (savedDest) {
        // Если найден сохраненный, используем его состояние isBlurred
        return {
          ...aiDest,
          _id: savedDest._id, // Используем сохраненный _id
          isBlurred: savedDest.isBlurred || false
        }
      }
      
      // Если не найден, используем AI-данные как есть
      return aiDest
    })
  }

  const handleBlurButton = (itemToBlur: string) => {
    setFilteredItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const updatedDestinations = item.destinations.map((destination) => {
          if (destination._id === itemToBlur && destination.link.trim() === "") {
            // Удаляем пользовательские расходы (без ссылки) - только локально
            return null
          } else if (destination._id === itemToBlur) {
            // Переключаем состояние isBlurred для рекомендованных мест - только локально
            return { ...destination, isBlurred: !destination.isBlurred }
          }
          return destination
        })

        const filteredDestinations = updatedDestinations.filter((destination) => destination !== null) as Destination[]

        return { ...item, destinations: filteredDestinations }
      })
      return updatedItems
    })
    
    // Отмечаем, что есть несохраненные изменения
    setHasUnsavedChanges(true)
  }

  useEffect(() => {
    const totalPrice = items[0].destinations
      .filter((destination) => !destination.isBlurred)
      .reduce((acc, destination) => acc + destination.price, 0)
    setFilteredItems((prevItems) => [
      {
        ...prevItems[0],
        price: totalPrice + prevItems[0].foodPrice + prevItems[0].hotelPrice,
      },
    ])
  }, [items[0].destinations])

  const [shopName, setShopName] = useState("")
  const [shopPrice, setShopPrice] = useState(0)

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const newDestination = {
      name: shopName,
      price: shopPrice,
      link: "",
      isBlurred: false,
      _id: new mongoose.Types.ObjectId(),
    }

    setFilteredItems((prevItems) => [
      {
        ...prevItems[0],
        destinations: [...prevItems[0].destinations, newDestination],
      },
    ])

    setShopName("")
    setShopPrice(0)
    
    // Отмечаем, что есть несохраненные изменения
    setHasUnsavedChanges(true)
  }

  const handleToggleFavorite = async () => {
    if (!session?.user) return
    
    try {
      if (isFavorite) {
        // Удалить из избранного
        await axios.delete(`/api/favorites/${pathname}`)
        setIsFavorite(false)
      } else {
        // Добавить в избранное
        await axios.post(`/api/favorites/${pathname}`)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error("Ошибка при работе с избранным:", error)
    }
  }

  const handlePlanTrip = async () => {
    if (!session?.user || isPlanningTrip) return
    
    setIsPlanningTrip(true)
    
    try {
      // Сохраняем бюджет с текущими данными
      await saveBudget()
      
      // Показываем успешное состояние
      setTripPlanned(true)
      setHasUnsavedChanges(false) // Сбрасываем флаг несохраненных изменений
    } catch (error) {
      console.error("Ошибка при планировании поездки:", error)
      // В случае ошибки можно показать toast или другое уведомление
    } finally {
      setIsPlanningTrip(false)
    }
  }

  const saveBudget = async () => {
    if (!session?.user) return
    
    try {
      const budgetData = {
        destinations: items[0].destinations.map(dest => ({
          ...dest,
          _id: dest._id.toString() // Преобразуем ObjectId в строку для сохранения
        })),
        foodPrice: items[0].foodPrice,
        hotelPrice: items[0].hotelPrice,
        totalPrice: items[0].price
      }
      
      await axios.post(`/api/budget/${pathname}`, budgetData)
    } catch (error) {
      console.error("Ошибка при сохранении бюджета:", error)
    }
  }

  const loadBudget = async () => {
    if (!session?.user) return
    
    try {
      console.log("Загружаем бюджет для города:", pathname)
      const response = await axios.get(`/api/budget/${pathname}`)
      const budget = response.data.budget
      
      if (budget) {
        // Преобразуем строковые _id обратно в ObjectId и восстанавливаем состояние isBlurred
        const restoredDestinations = budget.destinations.map((dest: any) => ({
          ...dest,
          _id: new mongoose.Types.ObjectId(dest._id),
          isBlurred: dest.isBlurred || false // Восстанавливаем состояние отключения
        }))
        
        // Сохраняем destinations для использования при загрузке AI-данных
        setSavedDestinations(restoredDestinations)
        
        setFilteredItems((prevItems) => [{
          ...prevItems[0],
          destinations: restoredDestinations,
          foodPrice: budget.foodPrice,
          hotelPrice: budget.hotelPrice,
          price: budget.totalPrice
        }])
        setHasUnsavedChanges(false) // Сбрасываем флаг при загрузке данных
      }
    } catch (error) {
      console.error("Ошибка при загрузке бюджета:", error)
      // Если API недоступен, просто продолжаем без загрузки сохраненного бюджета
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Загрузка информации о городе...</p>
        </div>
      </div>
    )
  }

  const item = items[0]

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={`${item.city}, ${item.country}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-12">
            <Link href="/list">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к списку
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{item.country}</span>
            </div>
            <div className="flex items-center gap-4 mb-4 justify-between">
              <h1 className="text-5xl font-bold text-white">{item.city}</h1>
              {session?.user && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={`backdrop-blur-sm border transition-all duration-200 px-4 py-2 ${
                    isFavorite 
                      ? "bg-red-500 text-white border-red-400 hover:bg-red-600 shadow-lg shadow-red-500/25" 
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
                  }`}
                >
                  {isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                  <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-white/80 text-lg">Общая стоимость:</span>
              <span className="text-4xl font-bold text-white">{item.price.toLocaleString()} ₸</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card>
              <CardHeader>
                <CardTitle>О городе</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{item.descr}</p>
              </CardContent>
            </Card>

            {/* Recommended Places Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Рекомендуемые места
                </CardTitle>
                <CardDescription>Популярные достопримечательности и развлечения. Нажмите на X, чтобы исключить из расчета бюджета</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.destinations.filter(dest => dest.link.trim() !== "").map((destination, index) => (
                    <div
                      key={index}
                      className={`flex items-start justify-between p-4 rounded-lg border bg-card transition-all ${
                        destination.isBlurred ? "opacity-40" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Badge variant="secondary" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <div>
                            <h4 className="font-medium">{destination.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{destination.price.toLocaleString()} ₸</p>
                            {destination.link.trim() !== "" && (
                              <a
                                href={destination.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                Подробнее →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlurButton(destination._id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {item.destinations.filter(dest => dest.link.trim() !== "").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p>Рекомендуемые места загружаются...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Expenses Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Мои расходы
                </CardTitle>
                <CardDescription>Добавленные вами расходы и планируемые покупки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Expenses */}
                <div className="space-y-3">
                  {item.destinations.filter(dest => dest.link.trim() === "").map((destination, index) => (
                    <div
                      key={index}
                      className={`flex items-start justify-between p-4 rounded-lg border bg-card transition-all ${
                        destination.isBlurred ? "opacity-40" : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <div>
                            <h4 className="font-medium">{destination.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{destination.price.toLocaleString()} ₸</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlurButton(destination._id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {item.destinations.filter(dest => dest.link.trim() === "").length === 0 && (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <svg className="h-8 w-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm">Пока нет добавленных расходов</p>
                    </div>
                  )}
                </div>

                {/* Add New Expense Form */}
                {session?.user ? (
                  <div className="pt-4 border-t">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shop_name">Назначение</Label>
                          <Input
                            type="text"
                            id="shop_name"
                            placeholder="Купить сувениры для мамы..."
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="shop_price">Цена (₸)</Label>
                          <Input
                            type="number"
                            id="shop_price"
                            placeholder="1000"
                            value={shopPrice || ""}
                            onChange={(e) => setShopPrice(Number.parseInt(e.target.value) || 0)}
                            min={0}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить расход
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-medium">Требуется авторизация</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Для добавления собственных расходов необходимо войти в аккаунт
                      </p>
                      <Button asChild className="w-full md:w-auto">
                        <Link href="/signin">Войти в аккаунт</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Разбивка бюджета</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Utensils className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Питание в день</p>
                      <p className="text-xl font-semibold">{item.foodPrice.toLocaleString()} ₸</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Hotel className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Проживание за ночь</p>
                      <p className="text-xl font-semibold">{item.hotelPrice.toLocaleString()} ₸</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <svg className="h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Рекомендуемые места</p>
                      <p className="text-xl font-semibold">
                        {item.destinations
                          .filter(dest => dest.link.trim() !== "" && !dest.isBlurred)
                          .reduce((sum, dest) => sum + dest.price, 0)
                          .toLocaleString()} ₸
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <svg className="h-5 w-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Мои расходы</p>
                      <p className="text-xl font-semibold">
                        {item.destinations
                          .filter(dest => dest.link.trim() === "" && !dest.isBlurred)
                          .reduce((sum, dest) => sum + dest.price, 0)
                          .toLocaleString()} ₸
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Итоговая стоимость</p>
                      <p className="text-3xl font-bold text-primary">{item.price.toLocaleString()} ₸</p>
                    </div>
                    {session?.user && (
                      <Button 
                        onClick={tripPlanned ? () => window.location.href = '/profile' : handlePlanTrip}
                        className="w-full bg-primary hover:bg-primary/90"
                        size="lg"
                        disabled={isPlanningTrip}
                      >
                        {isPlanningTrip ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Планируем поездку...
                          </>
                        ) : tripPlanned ? (
                          <>
                            <LandPlot className="h-4 w-4 mr-2" />
                            Перейти в запланированные поездки
                          </>
                        ) : (
                          <>
                            <PlaneTakeoff className="h-4 w-4 mr-2" />
                            {hasUnsavedChanges ? "Запланировать поездку (есть изменения)" : "Запланировать поездку"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
