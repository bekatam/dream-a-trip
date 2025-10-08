"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle2, Plane } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setEmailSent(true)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-3xl" />

      {/* Forgot Password Card */}
      <Card className="relative w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
        {!emailSent ? (
          <>
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Забыли пароль?</CardTitle>
              <CardDescription className="text-base">
                Введите ваш email и мы отправим инструкции для восстановления пароля
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email адрес
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ivan@example.com"
                      className="pl-10 h-11 bg-white/50 border-neutral-200 focus:border-amber-500 focus:ring-amber-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-lg shadow-amber-500/30 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Отправка...
                    </div>
                  ) : (
                    "Отправить инструкции"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t">
              <Link
                href="/signin"
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к входу
              </Link>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Проверьте почту</CardTitle>
              <CardDescription className="text-base">
                Мы отправили инструкции по восстановлению пароля на ваш email
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 leading-relaxed">
                  Не получили письмо? Проверьте папку "Спам" или попробуйте отправить запрос снова через несколько
                  минут.
                </p>
              </div>

              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full h-11 bg-white/50 border-neutral-200 hover:bg-white hover:border-neutral-300"
              >
                Отправить снова
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 border-t">
              <Link
                href="/signin"
                className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к входу
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
