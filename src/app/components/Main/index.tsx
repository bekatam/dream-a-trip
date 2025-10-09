"use client"
import { useEffect, useState, useCallback } from "react"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { X, MapPin, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"

interface UserData {
  lat: any
  lng: any
  prevState?: null
}

const MapView = () => {
  const containerStyle = {
    width: "100%",
    height: "100%",
  }

  const [selectedPlace, setSelectedPlace] = useState<UserData | null>(null)
  const [selectedCity, setSelectedCity] = useState(null)
  const [country, setCountry] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 })
  const [showPopup, setShowPopup] = useState(false)
  const [modal, setModal] = useState(false)
  const [description, setDescription] = useState<string>("")
  const [loadingDesc, setLoadingDesc] = useState(false)
  const [errorDesc, setErrorDesc] = useState<string>("")
  const [wantToGo, setWantToGo] = useState(false)
  const [navLoading, setNavLoading] = useState(false)
  const [navError, setNavError] = useState<string>("")
  const router = useRouter()

  // Load Google Maps script once; prevents duplicate loads during navigation
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string) || "",
  })

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  const handleModal = async () => {
    const nextState = !modal
    setModal(nextState)
    setShowPopup(false)
    if (!nextState) return
    if (!country) return
    setLoadingDesc(true)
    setErrorDesc("")
    setDescription("")
    try {
      const res = await fetch("/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load")
      setDescription(data.description || "")
    } catch (e: any) {
      setErrorDesc(e?.message || "Failed to load description")
    } finally {
      setLoadingDesc(false)
    }
  }

  const onMarkerDragEnd = useCallback(async (event: any) => {
    setSelectedPlace({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    })
  }, [])

  const handleGoToCity = useCallback(async () => {
    if (!selectedCity) return
    setNavLoading(true)
    setNavError("")
    try {
      // 1) Try find existing
      const res = await fetch("/api/city", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load cities")
      const data = await res.json()
      let target = (data || []).find((c: any) => {
        const city = String(c?.city || "")
        return city.toLowerCase() === String(selectedCity).toLowerCase()
      })
      // 2) If not found, create
      if (!target) {
        const createRes = await fetch("/api/city/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: selectedCity, country: country || "", image: "" }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created?.error || "Failed to create city")
        target = created
      }
      if (target?._id) router.push(`/city/${target._id}`)
    } catch (e: any) {
      setNavError(e?.message || "Ошибка навигации")
    } finally {
      setNavLoading(false)
    }
  }, [selectedCity, router])

  useEffect(() => {
    const fetchCity = async () => {
      const url = await process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (selectedPlace) {
        const { lat, lng } = selectedPlace
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${url}`,
        )
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const city = data.results[0].plus_code?.compound_code?.substring(7)
          const country = data.results[data.results.length - 1].address_components[0].long_name
          if (city) {
            setSelectedCity(city)
            setCountry(country)
          }
        }
      }
    }

    fetchCity()
  }, [selectedPlace])

  const onMapClick = useCallback((event: any) => {
    setSelectedPlace({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    })
    setMapCenter({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    })
    setShowPopup(true)
  }, [])

  return (
    <>
      <div className="relative w-full h-[calc(100vh-65px)]">
        {!isLoaded ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <GoogleMap mapContainerStyle={containerStyle} zoom={3} center={mapCenter} onClick={onMapClick}>
            {selectedPlace && <Marker position={selectedPlace} draggable={true} onDragEnd={onMarkerDragEnd} />}
          </GoogleMap>
        )}

        {selectedCity && showPopup && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-card border rounded-xl shadow-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>Выбранное место</span>
                  </div>
                  <h3 className="text-xl font-semibold text-balance">{selectedCity}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClosePopup}
                  className="h-8 w-8 rounded-full shrink-0"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Закрыть</span>
                </Button>
              </div>

              <Button onClick={handleModal} className="w-full gap-2" size="lg">
                <Sparkles className="h-4 w-4" />
                Узнать больше
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {selectedCity}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {loadingDesc && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Spinner className="h-8 w-8" />
                <p className="text-muted-foreground">Генерация описания...</p>
              </div>
            )}

            {!loadingDesc && errorDesc && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-destructive text-sm">{errorDesc}</p>
              </div>
            )}

            {!loadingDesc && !errorDesc && description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
              </div>
            )}

            {!loadingDesc && !errorDesc && !description && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Описание пока недоступно</p>
              </div>
            )}

          {!loadingDesc && (
            <div className="flex flex-col gap-3">
              <Button onClick={handleGoToCity} disabled={navLoading} className="w-full gap-2" size="lg">
                {navLoading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                Перейти к городу
              </Button>
              {navError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {navError}
                </div>
              )}
            </div>
          )}

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Checkbox
                  id="want-to-go"
                  checked={wantToGo}
                  onCheckedChange={(checked) => setWantToGo(checked as boolean)}
                />
                <Label htmlFor="want-to-go" className="text-base font-medium cursor-pointer flex-1">
                  Я хочу посетить это место
                </Label>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MapView
