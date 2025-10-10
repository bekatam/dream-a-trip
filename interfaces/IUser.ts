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
	lastUpdated: Date
}

export interface IUser {
	name: string
	email: string
	password?: string
	image?: string
	provider?: string
	favorites?: string[]
	budgets?: Map<string, BudgetData>
	createdAt?: Date
	updatedAt?: Date
}


