"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, SlidersHorizontal, MapPin, Calendar, Dices } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { getData } from "@/app/endpoints/axios"
import { type City } from "@/types"

export default function TravelList() {
  const router = useRouter()
  const [days, setDays] = useState(1)
  const [budget, setBudget] = useState(0)
  const [items, setItems] = useState<City[]>([])
  const [selectedOption, setSelectedOption] = useState("default")
  const [search, setSearch] = useState("")
  const [filteredItems, setFilteredItems] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [affordable, setAffordable] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)

  useEffect(() => {
    const getDataAsync = async () => {
      const data = await getData()
      setItems(data)
      setFilteredItems(data)
      setLoading(false)
    }
    getDataAsync()
  }, [])

  useEffect(() => {
    let filtered = search
      ? items.filter((item) => (item.city + item.country).toLowerCase().includes(search.toLowerCase()))
      : items

    if (affordable && budget > 0) {
      filtered = filtered.filter((item) => (item.foodPrice + item.hotelPrice) * days * 0.9 <= budget)
    }

    // Apply sorting
    if (selectedOption === "asc") {
      filtered = [...filtered].sort((a, b) => a.foodPrice + a.hotelPrice - (b.foodPrice + b.hotelPrice))
    } else if (selectedOption === "desc") {
      filtered = [...filtered].sort((a, b) => b.foodPrice + b.hotelPrice - (a.foodPrice + a.hotelPrice))
    }

    setFilteredItems(filtered)
  }, [search, affordable, budget, days, selectedOption, items])

  const getAffordabilityStatus = (item: City) => {
    if (budget === 0) return "unknown"
    const minCost = (item.foodPrice + item.hotelPrice) * days * 0.9
    const midCost = (item.foodPrice + item.hotelPrice) * days

    if (budget >= minCost) return "affordable"
    if (budget >= midCost / 2) return "moderate"
    return "expensive"
  }

  const handleRandomTravel = async () => {
    setIsRandomizing(true)
    try {
      const destinations = items.length > 0 ? items : await getData()
      const randomIndex = Math.floor(Math.random() * destinations.length)
      const randomDestination = destinations[randomIndex]
      router.push(`/city/${randomDestination._id}`)
    } catch (error) {
      console.error("Error selecting random destination:", error)
      setIsRandomizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Найдите идеальное направление
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Исследуйте мир с учетом вашего бюджета и предпочтений
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск города или страны..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-lg bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8 p-6 bg-card rounded-xl border">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4" />
                Фильтры
              </div>

              <Button
                onClick={handleRandomTravel}
                disabled={isRandomizing || loading}
                variant="outline"
                size="sm"
                className="border-amber-200 hover:border-amber-300 hover:bg-amber-50 bg-transparent hover:text-amber-600"
              >
                {isRandomizing ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Выбираем...
                  </>
                ) : (
                  <>
                    <Dices className="h-4 w-4 mr-2" />
                    Случайное направление
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  Бюджет (₸)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="Введите бюджет"
                  min={0}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Количество дней
                </Label>
                <Input
                  id="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                  min={1}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort" className="text-sm font-medium">
                  Сортировка
                </Label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger id="sort" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">По умолчанию</SelectItem>
                    <SelectItem value="asc">По возрастанию цены</SelectItem>
                    <SelectItem value="desc">По убыванию цены</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="affordable"
                checked={affordable}
                onCheckedChange={(checked) => setAffordable(checked as boolean)}
              />
              <Label htmlFor="affordable" className="text-sm font-medium cursor-pointer">
                Показать только доступные по бюджету
              </Label>
            </div>
          </div>

          {budget > 0 && (
            <div className="lg:w-64 p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Ваш бюджет</div>
              <div className="text-2xl font-bold">{budget.toLocaleString()} ₸</div>
              <div className="text-sm text-muted-foreground">
                на {days} {days === 1 ? "день" : "дней"}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Найдено направлений: <span className="font-medium text-foreground">{filteredItems.length}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Загрузка направлений...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">Направления не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const status = getAffordabilityStatus(item)
              const minPrice = (item.foodPrice + item.hotelPrice) * days
              const maxPrice = minPrice + (item.price - item.foodPrice - item.hotelPrice)

              return (
                <Link key={item._id} href={`/city/${item._id}`} className="group">
                  <div className="h-full bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={`${item.city}, ${item.country}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

                      {budget > 0 && (
                        <div className="absolute top-3 right-3">
                          {status === "affordable" && (
                            <Badge className="bg-success/90 text-white border-0 backdrop-blur-sm">В бюджете</Badge>
                          )}
                          {status === "moderate" && (
                            <Badge className="bg-warning/90 text-white border-0 backdrop-blur-sm">Частично</Badge>
                          )}
                          {status === "expensive" && (
                            <Badge className="bg-red-500/90 text-white border-0 backdrop-blur-sm">
                              Дорого
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {item.city}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.country}
                        </p>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground mb-1">Стоимость поездки</div>
                        <div className="text-lg font-bold">
                          {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} ₸
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          на {days} {days === 1 ? "день" : "дней"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
