export interface Destination {
  name: string
  price: number
  link: string
  isBlurred: boolean
  _id: any
}

export interface City {
  _id: string
  name: string
  city: string
  country: string
  image?: string
  destinations: Destination[]
  foodPrice: number
  hotelPrice: number
  price: number
}
