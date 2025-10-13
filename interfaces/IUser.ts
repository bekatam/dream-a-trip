export interface BudgetData {
	destinations: {
		name: string
		price: number
		link: string
		isBlurred: boolean
		_id: string
	}[]
	foodPrice: number
	hotelPrice: number
	totalPrice: number
	tripDate?: string | Date
	defaultFoodPrice?: number
	defaultHotelPrice?: number
	lastUpdated: Date
}

export interface UserSettings {
	currency: string
	language: string
	notifications: boolean
}

export interface IUser {
	name: string
	email: string
	password?: string
	image?: string
	provider?: string
	favorites?: string[]
	budgets?: Map<string, BudgetData>
	settings?: UserSettings
	createdAt?: Date
	updatedAt?: Date
}


