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
import { MapPin, Heart, Wallet, Globe, Settings, Edit, Plus, ArrowRight, Trash2, TrendingUp, X } from "lucide-react"
import { getData } from "@/app/endpoints/axios"
import type { City } from "@/types"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [destinations, setDestinations] = useState<City[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [budgets, setBudgets] = useState<Record<string, any>>({})
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [budgetsLoading, setBudgetsLoading] = useState(true)
  const [globalLoading, setGlobalLoading] = useState(true)

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editSettingsOpen, setEditSettingsOpen] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "", // URL остается пустым
  })
  const [settingsForm, setSettingsForm] = useState({
    currency: "KZT",
    language: "ru",
    notifications: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isDragOver, setIsDragOver] = useState(false)
  
  // User profile data
  const [userProfile, setUserProfile] = useState<{
    name: string
    email: string
    avatar: string
    memberSince: string
  }>({
    name: "Пользователь",
    email: "",
    avatar: "/diverse-user-avatars.png",
    memberSince: "Недавно"
  })
  
  // Expenses filter state
  const [selectedCityForExpenses, setSelectedCityForExpenses] = useState<string>("all")
  const [expandedCityId, setExpandedCityId] = useState<string | null>(null)
  const [editedBudgets, setEditedBudgets] = useState<Record<string, { tripDate: string; hotelPrice: number; foodPrice: number }>>({})
  const [editedDestinations, setEditedDestinations] = useState<Record<string, any[]>>({})
  const [editingHotel, setEditingHotel] = useState<Record<string, boolean>>({})
  const [editingFood, setEditingFood] = useState<Record<string, boolean>>({})
  const [savingHotel, setSavingHotel] = useState<Record<string, boolean>>({})
  const [savingFood, setSavingFood] = useState<Record<string, boolean>>({})
  const [savingDate, setSavingDate] = useState<Record<string, boolean>>({})
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState("expenses")
  const [dataLoaded, setDataLoaded] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Real user data from session
  const user = {
    name: userProfile.name,
    email: userProfile.email,
    avatar: userProfile.avatar,
    memberSince: userProfile.memberSince,
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

  // Get cities with budgets for dropdown
  const citiesWithBudgets = Object.keys(budgets).map(cityId => {
    const city = destinations.find(dest => dest._id === cityId)
    const budget = budgets[cityId]
    return {
      id: cityId,
      name: city?.city || "Неизвестный город",
      country: city?.country || "Неизвестная страна",
      budget: budget
    }
  }).filter(city => city.name !== "Неизвестный город")

  // Filter expenses by selected city
  const filteredExpenses = selectedCityForExpenses === "all" 
    ? budgetEntries 
    : budgetEntries.filter((budget, index) => {
        const cityId = Object.keys(budgets).find(key => budgets[key] === budget)
        return cityId === selectedCityForExpenses
      })

  // Calculate stats for selected city
  const selectedCityStats = {
    totalSpent: filteredExpenses.reduce((sum, budget) => sum + (budget.totalPrice || 0), 0),
    totalTrips: filteredExpenses.length,
    averageSpent: filteredExpenses.length > 0 
      ? Math.round(filteredExpenses.reduce((sum, budget) => sum + (budget.totalPrice || 0), 0) / filteredExpenses.length)
      : 0
  }

  const stats = {
    totalTrips: budgetEntries.length,
    totalSpent: totalBudgetSpent,
    countriesVisited: new Set(countriesFromBudgets).size,
    upcomingTrips: budgetEntries.length, // Use budgets as "upcoming trips"
  }

  // Check session and trigger data loading only once
  useEffect(() => {
    if (session && !sessionChecked) {
      setSessionChecked(true)
      setDataLoaded(false) // Trigger data loading
    }
  }, [session, sessionChecked])

  // Load real data from APIs in parallel
  useEffect(() => {
    const loadData = async () => {
      setGlobalLoading(true)
      setFavoritesLoading(true)
      setBudgetsLoading(true)
      try {
        const destinationsPromise = getData()
        const favoritesPromise = fetch("/api/favorites")
        const budgetsPromise = fetch("/api/budget")
        const settingsPromise = fetch("/api/settings")
        const profilePromise = fetch("/api/profile")

        const [
          destinationsResult,
          favoritesResult,
          budgetsResult,
          settingsResult,
          profileResult,
        ] = await Promise.allSettled([
          destinationsPromise,
          favoritesPromise,
          budgetsPromise,
          settingsPromise,
          profilePromise,
        ])

        // destinations
        if (destinationsResult.status === "fulfilled") {
          setDestinations(destinationsResult.value)
        }

        // favorites
        if (favoritesResult.status === "fulfilled" && favoritesResult.value.ok) {
          const data = await favoritesResult.value.json()
          setFavorites(data.favorites || [])
        }
        setFavoritesLoading(false)

        // budgets
        if (budgetsResult.status === "fulfilled" && budgetsResult.value.ok) {
          const data = await budgetsResult.value.json()
          setBudgets(data.budgets || {})
        }
        setBudgetsLoading(false)

        // settings
        if (settingsResult.status === "fulfilled" && settingsResult.value.ok) {
          const data = await settingsResult.value.json()
          setSettingsForm(
            data.settings || {
              currency: "KZT",
              language: "ru",
              notifications: true,
            },
          )
        }

        // profile
        if (profileResult.status === "fulfilled" && profileResult.value.ok) {
          const profileData = await profileResult.value.json()
          setUserProfile({
            name: profileData.user.name || session?.user?.name || "Пользователь",
            email: profileData.user.email || session?.user?.email || "",
            avatar: profileData.user.image || session?.user?.image || "/diverse-user-avatars.png",
            memberSince: formatMemberSince(profileData.user.createdAt || new Date()),
          })
        } else {
          setUserProfile({
            name: session?.user?.name || "Пользователь",
            email: session?.user?.email || "",
            avatar: session?.user?.image || "/diverse-user-avatars.png",
            memberSince: formatMemberSince(new Date()),
          })
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        setFavoritesLoading(false)
        setBudgetsLoading(false)
      } finally {
        setGlobalLoading(false)
        setDataLoaded(true)
      }
    }

    if (sessionChecked && !dataLoaded) {
      loadData()
    }
  }, [dataLoaded, sessionChecked])

  // Sync editable fields from loaded budgets
  useEffect(() => {
    const next: Record<string, { tripDate: string; hotelPrice: number; foodPrice: number }> = {}
    const nextDests: Record<string, any[]> = {}
    for (const cityId of Object.keys(budgets)) {
      const b = budgets[cityId] || {}
      next[cityId] = {
        tripDate: b.tripDate ? formatDateForInput(b.tripDate) : "",
        hotelPrice: b.hotelPrice || 0,
        foodPrice: b.foodPrice || 0,
      }
      const dests = Array.isArray(b.destinations) ? b.destinations : []
      nextDests[cityId] = dests.map((d: any) => ({ ...d, __removed: false }))
      // Debug: log destinations to check isBlurred state
      if (dests.length > 0) {
        console.log(`Destinations for ${cityId}:`, dests.map((d: any) => ({ name: d.name, isBlurred: d.isBlurred })))
      }
    }
    setEditedBudgets(next)
    setEditedDestinations(nextDests)
  }, [budgets])

  // Initialize forms when userProfile loads
  useEffect(() => {
    if (userProfile.name !== "Пользователь") {
      setProfileForm({
        name: userProfile.name,
        email: userProfile.email,
        avatar: "", // Оставляем URL пустым
      })
    }
  }, [userProfile])

  // Clean up file states when dialog closes
  useEffect(() => {
    if (!editProfileOpen) {
      removeSelectedFile()
    }
  }, [editProfileOpen])

  const favoriteDestinations = destinations.filter((dest) => favorites.includes(dest._id))

  // File handling functions
  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert('Пожалуйста, выберите файл в формате JPEG, JPG или PNG')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl("")
    }
  }

  // Function to update profile
  const updateProfile = async () => {
    setIsUpdating(true)
    try {
      let avatarUrl = profileForm.avatar

      // If a file is selected, convert it to base64
      if (selectedFile) {
        const base64 = await convertFileToBase64(selectedFile)
        avatarUrl = base64
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileForm,
          avatar: avatarUrl
        }),
      })

      if (response.ok) {
        setEditProfileOpen(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
        // Clean up file states
        removeSelectedFile()
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

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Helper function to format date beautifully
  const formatMemberSince = (dateString: string | Date): string => {
    if (!dateString) return "Недавно"
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // If it's today
    if (diffDays === 0) return "Сегодня"
    
    // If it's yesterday
    if (diffDays === 1) return "Вчера"
    
    // If it's within a week
    if (diffDays < 7) return `${diffDays} дней назад`
    
    // If it's within a month
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      if (weeks === 1) return "1 неделю назад"
      if (weeks < 4) return `${weeks} недель назад`
    }
    
    // If it's within a year
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      if (months === 1) return "1 месяц назад"
      if (months < 12) return `${months} месяцев назад`
    }
    
    // For dates older than a year, show the actual date
    return date.toLocaleDateString("ru-RU", { 
      month: "long", 
      year: "numeric" 
    })
  }

  // Function to toggle city details
  const toggleCityDetails = (cityId: string) => {
    setExpandedCityId(expandedCityId === cityId ? null : cityId)
  }

  // Save budget edits for a city
  const saveCityBudget = async (cityId: string, field?: 'hotel' | 'food' | 'date') => {
    const edit = editedBudgets[cityId]
    if (!edit) return

    const currentBudget = budgets[cityId]
    if (!currentBudget) return

    // Prepare payload with only changed fields
    const payload: any = {}
    
    // Check if trip date changed
    if (field === 'date' || field === undefined) {
      const currentDate = currentBudget.tripDate ? new Date(currentBudget.tripDate).toISOString().split('T')[0] : ''
      if (edit.tripDate !== currentDate) {
        payload.tripDate = edit.tripDate || null
      }
    }
    
    // Check if hotel price changed
    if (field === 'hotel' || field === undefined) {
      const currentHotelPrice = Number(currentBudget.hotelPrice || 0)
      if (Number(edit.hotelPrice || 0) !== currentHotelPrice) {
        payload.hotelPrice = Number(edit.hotelPrice || 0)
      }
    }
    
    // Check if food price changed
    if (field === 'food' || field === undefined) {
      const currentFoodPrice = Number(currentBudget.foodPrice || 0)
      if (Number(edit.foodPrice || 0) !== currentFoodPrice) {
        payload.foodPrice = Number(edit.foodPrice || 0)
      }
    }

    // Check if destinations changed (removed items)
    if (field === undefined) {
      const editedDests = editedDestinations[cityId]
      if (editedDests) {
        // Filter out removed destinations and remove __removed flag
        const filteredDests = editedDests
          .filter((dest: any) => !dest.__removed)
          .map((dest: any) => {
            const { __removed, ...cleanDest } = dest
            return cleanDest
          })
        
        // Compare with current destinations
        const currentDests = currentBudget.destinations || []
        if (JSON.stringify(filteredDests) !== JSON.stringify(currentDests)) {
          payload.destinations = filteredDests
        }
      }
    }

    // If nothing changed, don't send request
    if (Object.keys(payload).length === 0) {
      return
    }

    // Set appropriate loading state
    if (field === 'hotel') {
      setSavingHotel(prev => ({ ...prev, [cityId]: true }))
    } else if (field === 'food') {
      setSavingFood(prev => ({ ...prev, [cityId]: true }))
    } else if (field === 'date') {
      setSavingDate(prev => ({ ...prev, [cityId]: true }))
    } else {
      setIsUpdating(true)
    }

    try {
      const res = await fetch(`/api/budget/${cityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        const updated = data.budget
        setBudgets({ ...budgets, [cityId]: updated })
        
        // Clear edited destinations and sync with updated data
        setEditedDestinations((prev) => ({
          ...prev,
          [cityId]: (updated.destinations || []).map((d: any) => ({ ...d, __removed: false })),
        }))
        
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 2000)
      }
    } catch (e) {
      console.error("Ошибка при сохранении бюджета:", e)
    } finally {
      // Clear appropriate loading state
      if (field === 'hotel') {
        setSavingHotel(prev => ({ ...prev, [cityId]: false }))
      } else if (field === 'food') {
        setSavingFood(prev => ({ ...prev, [cityId]: false }))
      } else if (field === 'date') {
        setSavingDate(prev => ({ ...prev, [cityId]: false }))
      } else {
        setIsUpdating(false)
      }
    }
  }

  const resetCityBudgetToDefaults = async (cityId: string) => {
    const current = budgets[cityId]
    if (!current) return

    const nextHotel = current.defaultHotelPrice ?? current.hotelPrice ?? 0
    const nextFood = current.defaultFoodPrice ?? current.foodPrice ?? 0

    setEditedBudgets((prev) => ({
      ...prev,
      [cityId]: {
        tripDate: prev[cityId]?.tripDate || "",
        hotelPrice: Number(nextHotel),
        foodPrice: Number(nextFood),
      },
    }))

    // Reset destinations to original state (remove all __removed flags)
    setEditedDestinations((prev) => ({
      ...prev,
      [cityId]: (current.destinations || []).map((d: any) => ({ ...d, __removed: false })),
    }))

    await saveCityBudget(cityId)
  }

  const removeDestinationFromCity = (cityId: string, destIndex: number) => {
    setEditedDestinations((prev) => {
      const list = prev[cityId] ? [...prev[cityId]] : []
      if (!list[destIndex]) return prev
      const toggled = { ...list[destIndex], __removed: !list[destIndex].__removed }
      const next = [...list]
      next[destIndex] = toggled
      return { ...prev, [cityId]: next }
    })
  }

  // Handle expense selection
  const toggleExpenseSelection = (cityId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  // Handle bulk delete
  const deleteSelectedExpenses = async () => {
    if (selectedExpenses.length === 0) return
    
    setIsUpdating(true)
    setShowDeleteModal(false)
    try {
      await Promise.allSettled(
        selectedExpenses.map(cityId => 
          fetch(`/api/budget/${cityId}`, { method: "DELETE" })
        )
      )
      
      // Update local state
      const newBudgets = { ...budgets }
      selectedExpenses.forEach(cityId => {
        delete newBudgets[cityId]
      })
      setBudgets(newBudgets)
      setSelectedExpenses([])
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 2000)
    } catch (error) {
      console.error("Ошибка при удалении поездок:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Get selected cities names for confirmation modal
  const getSelectedCitiesNames = () => {
    return selectedExpenses.map(cityId => {
      const city = destinations.find(dest => dest._id === cityId)
      return city?.city || "Неизвестный город"
    })
  }

  // Clear selection function
  const clearSelection = () => {
    setSelectedExpenses([])
  }

  // Handle tab change and clear selection
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedExpenses([])
    setExpandedCityId(null) // Сворачиваем детализацию поездки
  }

  // Force refresh data function
  const refreshData = () => {
    setDataLoaded(false)
    setSessionChecked(false)
  }

  // Add refresh button to profile header
  const handleRefresh = () => {
    refreshData()
  }

  // Filter expenses by search query
  const filteredBudgetEntries = budgetEntries.filter((budget, index) => {
    const cityId = Object.keys(budgets).find(key => budgets[key] === budget)
    const city = destinations.find(dest => dest._id === cityId)
    
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      city?.city?.toLowerCase().includes(searchLower) ||
      city?.country?.toLowerCase().includes(searchLower) ||
      budget.totalPrice?.toString().includes(searchQuery)
    )
  })

  const formatDateForInput = (value: string | Date): string => {
    if (!value) return ""
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
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

  // Show loading while checking session or while data is loading
  if (!session || globalLoading) {
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl text-destructive">Подтверждение удаления</DialogTitle>
            <DialogDescription className="text-base">
              Вы уверены, что хотите удалить следующие поездки? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Будут удалены поездки в города:</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {getSelectedCitiesNames().map((cityName, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cityName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isUpdating}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={deleteSelectedExpenses} disabled={isUpdating}>
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Удаление...
                </span>
              ) : (
                "Удалить поездки"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage 
                src={previewUrl || user.avatar || "/placeholder.svg"} 
                alt={user.name} 
              />
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
                  <p className="text-sm text-muted-foreground">
                    {user.memberSince === "Недавно" ? "Новый участник" : `Участник с ${user.memberSince}`}
                  </p>
                </div>
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleRefresh}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Обновить
                    </Button>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Edit className="h-4 w-4" />
                        Редактировать
                      </Button>
                    </DialogTrigger>
                  </div>
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
                        <Label className="text-sm font-medium">
                          Аватар
                        </Label>
                        
                        {/* File Upload Area */}
                        <div
                          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragOver 
                              ? 'border-primary bg-primary/5' 
                              : 'border-muted-foreground/25 hover:border-primary/50'
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleFileInputChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          
                          {previewUrl ? (
                            <div className="space-y-3">
                              <div className="relative inline-block">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-primary/20"
                                />
                                <button
                                  type="button"
                                  onClick={removeSelectedFile}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                                >
                                  ×
                                </button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {selectedFile?.name}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-muted-foreground"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Перетащите изображение сюда или{' '}
                                  <span className="text-primary">выберите файл</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  JPEG, JPG, PNG до 5MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Fallback URL input */}
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            Или введите URL изображения:
                          </p>
                          <Input
                            value={profileForm.avatar}
                            onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                            className="h-9"
                          />
                        </div>
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
                    <MapPin className="h-4 w-4" />
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
          <Tabs defaultValue="favorites" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="expenses" className="gap-2">
              <Wallet className="h-4 w-4" />
              Расходы
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Избранное
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
                <p className="text-muted-foreground">Нажмите на город для просмотра детальной информации</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Все расходы</CardTitle>
                  <CardDescription>Ваши траты по всем городам</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Bulk Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Поиск по городу, стране или сумме..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {selectedExpenses.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Выбрано: {selectedExpenses.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSelection}
                          disabled={isUpdating}
                        >
                          Снять выделение
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteModal(true)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Удаление...
                            </span>
                          ) : (
                            "Удалить выбранные"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
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
                      {filteredBudgetEntries.map((budget, index) => {
                        const cityId = Object.keys(budgets).find(key => budgets[key] === budget)
                        const city = destinations.find(dest => dest._id === cityId)
                        const isExpanded = expandedCityId === cityId
                        const isSelected = cityId ? selectedExpenses.includes(cityId) : false
                        
                        return (
                          <div key={index} className="border rounded-lg overflow-hidden">
                            {/* Main city card */}
                            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    if (cityId) toggleExpenseSelection(cityId)
                                  }}
                                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <div 
                                  className="flex items-center gap-4 flex-1 cursor-pointer"
                                  onClick={() => cityId && toggleCityDetails(cityId)}
                                >
                                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <MapPin className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                                      {city?.city || "Неизвестный город"}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {budget.lastUpdated ? new Date(budget.lastUpdated).toLocaleDateString("ru-RU") : "Недавно"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{city?.country}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <p className="text-lg font-bold group-hover:text-primary transition-colors">
                                    {budget.totalPrice?.toLocaleString() || 0} ₸
                                  </p>
                                  <Badge variant="secondary" className="text-xs">
                                    Бюджет
                                  </Badge>
                                </div>
                                <div className={`transform transition-transform cursor-pointer duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  onClick={() => cityId && toggleCityDetails(cityId)}
                                >
                                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && cityId && (
                              <div className="border-t bg-muted/20 p-6 space-y-6">
                                {/* City Image */}
                                <div className="relative h-32 rounded-lg overflow-hidden">
                                  <img
                                    src={city?.image || "/placeholder.svg"}
                                    alt={`${city?.city || "Город"}, ${city?.country || "Страна"}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <div className="absolute bottom-3 left-3 text-white">
                                    <h3 className="text-lg font-bold">{city?.city || "Город"}</h3>
                                    <p className="text-sm opacity-90">{city?.country || "Страна"}</p>
                                  </div>
                                  <Button asChild size="icon" variant="secondary" className="absolute bottom-3 right-3 h-9 w-9" aria-label="Перейти к городу">
                                    <Link href={`/city/${cityId}`}>
                                      <ArrowRight className="h-5 w-5" />
                                    </Link>
                                  </Button>
                                </div>

                                {/* Budget Breakdown */}
                                <div className="space-y-4">
                                  <h4 className="text-lg font-semibold">Разбивка бюджета</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border bg-blue-50">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                          </svg>
                                        </div>
                                        <span className="font-medium">Отели</span>
                                        {!editingHotel[cityId] && (
                                          <Button size="sm" variant="outline" className="ml-auto h-7 px-2 bg-transparent" onClick={(e) => { e.stopPropagation(); setEditingHotel({ ...editingHotel, [cityId]: true }) }}>
                                            Изменить
                                          </Button>
                                        )}
                                      </div>
                                      {editingHotel[cityId] ? (
                                        <div>
                                          <Input
                                            className="w-full"
                                            type="number"
                                            min={0}
                                            value={editedBudgets[cityId]?.hotelPrice ?? ""}
                                            onChange={(e) => {
                                              const val = e.target.value === "" ? 0 : Number(e.target.value)
                                              setEditedBudgets((prev) => ({
                                                ...prev,
                                                [cityId]: {
                                                  tripDate: prev[cityId]?.tripDate || "",
                                                  hotelPrice: val,
                                                  foodPrice: prev[cityId]?.foodPrice ?? 0,
                                                },
                                              }))
                                            }}
                                          />
                                          <div className="mt-2 flex items-center gap-2">
                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); saveCityBudget(cityId, 'hotel').then(() => setEditingHotel({ ...editingHotel, [cityId]: false })) }} disabled={savingHotel[cityId]}>
                                              {savingHotel[cityId] ? (
                                                <span className="flex items-center gap-2">
                                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                  Сохранение...
                                                </span>
                                              ) : (
                                                "Сохранить"
                                              )}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setEditedBudgets((prev) => ({ 
                                                ...prev, 
                                                [cityId]: { 
                                                  tripDate: prev[cityId]?.tripDate || "", 
                                                  hotelPrice: Number(budget.defaultHotelPrice || budget.hotelPrice || 0), 
                                                  foodPrice: prev[cityId]?.foodPrice ?? Number(budget.defaultFoodPrice || budget.foodPrice || 0) 
                                                } 
                                              })); 
                                              // Reset destinations to original state
                                              setEditedDestinations((prev) => ({
                                                ...prev,
                                                [cityId]: (budget.destinations || []).map((d: any) => ({ ...d, __removed: false })),
                                              }));
                                            }} disabled={savingHotel[cityId]}>
                                              По умолчанию
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingHotel({ ...editingHotel, [cityId]: false }); setEditedBudgets((prev) => ({ ...prev, [cityId]: { tripDate: prev[cityId]?.tripDate || "", hotelPrice: Number(budget.hotelPrice || 0), foodPrice: prev[cityId]?.foodPrice ?? Number(budget.foodPrice || 0) } })) }} disabled={savingHotel[cityId]}>
                                              Отмена
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xl font-bold">{budget.hotelPrice?.toLocaleString() || 0} ₸</p>
                                      )}
                                    </div>
                                    
                                    <div className="p-4 rounded-lg border bg-green-50">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                          </svg>
                                        </div>
                                        <span className="font-medium">Питание</span>
                                        {!editingFood[cityId] && (
                                          <Button size="sm" variant="outline" className="ml-auto h-7 px-2 bg-transparent" onClick={(e) => { e.stopPropagation(); setEditingFood({ ...editingFood, [cityId]: true }) }}>
                                            Изменить
                                          </Button>
                                        )}
                                      </div>
                                      {editingFood[cityId] ? (
                                        <div>
                                          <Input
                                            className="w-full"
                                            type="number"
                                            min={0}
                                            value={editedBudgets[cityId]?.foodPrice ?? ""}
                                            onChange={(e) => {
                                              const val = e.target.value === "" ? 0 : Number(e.target.value)
                                              setEditedBudgets((prev) => ({
                                                ...prev,
                                                [cityId]: {
                                                  tripDate: prev[cityId]?.tripDate || "",
                                                  hotelPrice: prev[cityId]?.hotelPrice ?? 0,
                                                  foodPrice: val,
                                                },
                                              }))
                                            }}
                                          />
                                          <div className="mt-2 flex items-center gap-2">
                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); saveCityBudget(cityId, 'food').then(() => setEditingFood({ ...editingFood, [cityId]: false })) }} disabled={savingFood[cityId]}>
                                              {savingFood[cityId] ? (
                                                <span className="flex items-center gap-2">
                                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                  Сохранение...
                                                </span>
                                              ) : (
                                                "Сохранить"
                                              )}
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setEditedBudgets((prev) => ({ 
                                                ...prev, 
                                                [cityId]: { 
                                                  tripDate: prev[cityId]?.tripDate || "", 
                                                  hotelPrice: prev[cityId]?.hotelPrice ?? Number(budget.hotelPrice || 0), 
                                                  foodPrice: Number(budget.defaultFoodPrice || budget.foodPrice || 0) 
                                                } 
                                              })); 
                                              // Reset destinations to original state
                                              setEditedDestinations((prev) => ({
                                                ...prev,
                                                [cityId]: (budget.destinations || []).map((d: any) => ({ ...d, __removed: false })),
                                              }));
                                            }} disabled={savingFood[cityId]}>
                                              По умолчанию
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingFood({ ...editingFood, [cityId]: false }); setEditedBudgets((prev) => ({ ...prev, [cityId]: { tripDate: prev[cityId]?.tripDate || "", hotelPrice: prev[cityId]?.hotelPrice ?? Number(budget.hotelPrice || 0), foodPrice: Number(budget.foodPrice || 0) } })) }} disabled={savingFood[cityId]}>
                                              Отмена
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xl font-bold">{budget.foodPrice?.toLocaleString() || 0} ₸</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-lg font-semibold">Итого</span>
                                      <span className="text-2xl font-bold text-primary">
                                        {(() => {
                                          const staged = editedDestinations[cityId]
                                          const list = (staged && Array.isArray(staged) ? staged : (budget.destinations || [])).filter((d: any) => !d?.__removed && !d?.isBlurred)
                                          const destTotal = list.reduce((s: number, d: any) => s + Number(d?.price || 0), 0)
                                          const hotel = Number(editedBudgets[cityId]?.hotelPrice ?? budget.hotelPrice ?? 0)
                                          const food = Number(editedBudgets[cityId]?.foodPrice ?? budget.foodPrice ?? 0)
                                          return (hotel + food + destTotal).toLocaleString()
                                        })()} ₸
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Destinations List */}
                                {(editedDestinations[cityId] && editedDestinations[cityId].length > 0) && (
                                  <div className="space-y-4">
                                    <h4 className="text-lg font-semibold">Запланированные места</h4>
                                    <div className="space-y-2">
                                      {editedDestinations[cityId].map((dest: any, destIndex: number) => (
                                        <div key={destIndex} className={`flex items-center justify-between p-3 rounded-lg border bg-white ${dest.__removed || dest.isBlurred ? 'opacity-50' : ''}`}>
                                          <div>
                                            <p className="font-medium">{dest.name}</p>
                                            {dest.link && dest.link.trim() !== "" && (
                                              <a 
                                                href={dest.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                              >
                                                Подробнее
                                              </a>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className="font-semibold">{dest.price?.toLocaleString() || 0} ₸</span>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 border" aria-label="Удалить" onClick={() => removeDestinationFromCity(cityId, destIndex)}>
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t">
                                  <Button
                                    className="flex-1"
                                    onClick={() => saveCityBudget(cityId, 'date')}
                                    disabled={savingDate[cityId]}
                                  >
                                    {savingDate[cityId] ? (
                                      <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Сохранение...
                                      </span>
                                    ) : (
                                      "Сохранить изменения"
                                    )}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      const b = budgets[cityId] || {}
                                      setEditedBudgets((prev) => ({
                                        ...prev,
                                        [cityId]: {
                                          tripDate: b.tripDate ? formatDateForInput(b.tripDate) : "",
                                          hotelPrice: b.hotelPrice || 0,
                                          foodPrice: b.foodPrice || 0,
                                        },
                                      }))
                                      setExpandedCityId(null)
                                    }}
                                  >
                                    Отменить
                                  </Button>
                                </div>

                                {/* Last Updated */}
                                <div className="text-sm text-muted-foreground">
                                  Последнее обновление: {budget.lastUpdated 
                                    ? new Date(budget.lastUpdated).toLocaleDateString("ru-RU", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "Недавно"
                                  }
                                </div>
                              </div>
                            )}
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
                      Общая статистика
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
                      <p className="text-sm text-muted-foreground mb-1">Всего поездок</p>
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

              {/* <Card>
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
              </Card> */}

              {/* <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-destructive">Опасная зона</CardTitle>
                  <CardDescription>Необратимые действия с вашим аккаунтом</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full md:w-auto">
                    Удалить аккаунт
                  </Button>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  )
}
