export interface ICity {
	city: string;
	country: string;
	isMarked: boolean;
	descr: string;
	image: string;
	destinations: Array<{
		name: string;
		price: number;
		link: string;
	}>;
	price: number;
	foodPrice: number;
	hotelPrice: number;
}
