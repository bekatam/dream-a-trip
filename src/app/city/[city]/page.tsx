"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getData } from "@/app/endpoints/axios"
import axios from "axios"
import mongoose from "mongoose"
import { MapPin, Utensils, Hotel, Plus, X, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Destination {
  name: string
  price: number
  link: string
  isBlurred: boolean
  _id: any
}

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
      setLoading(false)
    }
    getDataAsync()
  }, [pathname])

  const handleBlurButton = (itemToBlur: string) => {
    setFilteredItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        const updatedDestinations = item.destinations.map((destination) => {
          if (destination._id === itemToBlur && destination.link.trim() === "") {
            axios
              .delete(`/api/city/${pathname}`)
              .then((response) => {
                console.log(response.data)
              })
              .catch((error) => {
                console.error("error")
              })
            return null
          } else if (destination._id === itemToBlur) {
            return { ...destination, isBlurred: !destination.isBlurred }
          }
          return destination
        })

        const filteredDestinations = updatedDestinations.filter((destination) => destination !== null) as Destination[]

        return { ...item, destinations: filteredDestinations }
      })
      return updatedItems
    })
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

    if (shopName.trim() !== "") {
      await axios.post(`/api/city/${pathname}`, newDestination)
    }
    setShopName("")
    setShopPrice(0)
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
            <h1 className="text-5xl font-bold text-white mb-4">{item.city}</h1>
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

            {/* Destinations List Card */}
            <Card>
              <CardHeader>
                <CardTitle>Достопримечательности и расходы</CardTitle>
                <CardDescription>Нажмите на X, чтобы исключить из расчета бюджета</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.destinations.map((destination, index) => (
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
                </div>
              </CardContent>
            </Card>

            {/* Add Custom Expense Card */}
            <Card>
              <CardHeader>
                <CardTitle>Добавить свои расходы</CardTitle>
                <CardDescription>Добавьте планируемые покупки для расчета бюджета</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Beta Notice */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Обратите внимание:</strong> Просьба добавлять только проверенные места. Если добавляете свои
                  покупки, можете высчитать, сохранить себе бюджет и удалить, так как это бета-версия и авторизация пока
                  недоступна.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Информация о ценах</CardTitle>
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
                </div>

                <div className="pt-6 border-t">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Итоговая стоимость</p>
                    <p className="text-3xl font-bold text-primary">{item.price.toLocaleString()} ₸</p>
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
