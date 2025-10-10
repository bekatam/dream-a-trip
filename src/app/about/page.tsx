"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plane,
  MapPin,
  Wallet,
  Calendar,
  TrendingUp,
  Check,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Heart,
  Dices,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getData } from "@/app/endpoints/axios"

const features = [
  {
    icon: MapPin,
    title: "Умный поиск направлений",
    description: "Находите идеальные места для путешествий на основе вашего бюджета и предпочтений",
  },
  {
    icon: Wallet,
    title: "Планирование бюджета",
    description: "Контролируйте расходы и получайте рекомендации по оптимизации затрат на поездку",
  },
  {
    icon: Calendar,
    title: "Гибкое планирование",
    description: "Создавайте маршруты на любое количество дней с учетом всех деталей",
  },
  {
    icon: Globe,
    title: "Интерактивная карта",
    description: "Визуализируйте направления на карте и исследуйте достопримечательности",
  },
  {
    icon: TrendingUp,
    title: "Аналитика поездок",
    description: "Отслеживайте историю путешествий и получайте персональные рекомендации",
  },
  {
    icon: Shield,
    title: "Безопасность данных",
    description: "Ваши данные защищены современными методами шифрования",
  },
]

const pricingPlans = [
  {
    name: "Бесплатный",
    price: "0",
    period: "/месяц",
    description: "Для тех, кто только начинает планировать путешествия",
    features: ["До 3 направлений в месяц", "Базовый поиск по бюджету", "Просмотр на карте", "Мобильное приложение"],
    cta: "Начать бесплатно",
    href: "/signup",
    popular: false,
  },
  {
    name: "Про",
    price: "990",
    period: "/месяц",
    description: "Для активных путешественников",
    features: [
      "Неограниченные направления",
      "Расширенная аналитика",
      "Персональные рекомендации",
      "Приоритетная поддержка",
      "Экспорт маршрутов",
      "Совместное планирование",
    ],
    cta: "Попробовать Pro",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Премиум",
    price: "1990",
    period: "/месяц",
    description: "Для профессионалов и команд",
    features: [
      "Все возможности Pro",
      "API доступ",
      "Белый лейбл",
      "Корпоративная поддержка 24/7",
      "Индивидуальные интеграции",
      "Обучение команды",
    ],
    cta: "Связаться с нами",
    href: "/signup?plan=premium",
    popular: false,
  },
]

const stats = [
  { value: "50K+", label: "Активных пользователей" },
  { value: "200+", label: "Стран и городов" },
  { value: "1M+", label: "Запланированных поездок" },
  { value: "4.9", label: "Средняя оценка" },
]

export default function AboutPage() {
  const router = useRouter()
  const [isRandomizing, setIsRandomizing] = useState(false)

  const handleRandomTravel = async () => {
    setIsRandomizing(true)
    try {
      const destinations = await getData()
      const randomIndex = Math.floor(Math.random() * destinations.length)
      const randomDestination = destinations[randomIndex]
      router.push(`/city/${randomDestination._id}`)
    } catch (error) {
      console.error("Error selecting random destination:", error)
      setIsRandomizing(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Новая эра планирования путешествий
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Путешествуйте умнее с{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                TravelApp
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Планируйте идеальные поездки с учетом вашего бюджета. Находите лучшие направления, управляйте расходами и
              создавайте незабываемые впечатления.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
              >
                <Link href="/signup">
                  <Plane className="w-5 h-5 mr-2" />
                  Начать бесплатно
                </Link>
              </Button>

              <Button
                onClick={handleRandomTravel}
                disabled={isRandomizing}
                size="lg"
                variant="outline"
                className="h-12 px-8 bg-white/80 backdrop-blur-sm border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50/80 hover:text-amber-600"
              >
                {isRandomizing ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    Выбираем...
                  </>
                ) : (
                  <>
                    <Dices className="w-5 h-5 mr-2" />
                    Мне повезёт!
                  </>
                )}
              </Button>

              <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-white/80 backdrop-blur-sm">
                <Link href="/">
                  <MapPin className="w-5 h-5 mr-2" />
                  Посмотреть карту
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Возможности
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Все что нужно для идеального путешествия
            </h2>
            <p className="text-xl text-muted-foreground">
              Мощные инструменты для планирования, которые делают организацию поездок простой и приятной
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-amber-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Тарифы
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Выберите свой план</h2>
            <p className="text-xl text-muted-foreground">
              Начните бесплатно и обновитесь когда будете готовы к большему
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-amber-500 border-2 shadow-xl shadow-amber-500/20"
                    : "border-2 hover:border-amber-200 transition-colors"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-4 py-1">
                      Популярный
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">₸{plan.period}</span>
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    asChild
                    className={`w-full h-11 ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />

        <div className="container relative mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold">Готовы начать путешествие?</CardTitle>
              <CardDescription className="text-xl">
                Присоединяйтесь к тысячам путешественников, которые уже планируют свои поездки с TravelApp
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/30"
              >
                <Link href="/signup">
                  <Zap className="w-5 h-5 mr-2" />
                  Создать аккаунт
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-white/80">
                <Link href="/signin">Уже есть аккаунт</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
