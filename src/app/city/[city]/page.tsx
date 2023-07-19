"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./City.css";
import { getData } from "@/app/endpoints/axios";

const City = () => {
	const pathname = usePathname().substring(6);
	const [loading, setLoading] = useState(true);
	const [items, setFilteredItems] = useState([
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
				},
			],
			foodPrice: 0,
			hotelPrice: 0,
		},
	]);
	useEffect(() => {
		const getDataAsync = async () => {
			const fetchedItems = await getData();
			const filtered = fetchedItems.filter(
				(item: any) => item._id === pathname
			);
			setFilteredItems(filtered);
			setLoading(false);
		};
		getDataAsync();
	}, []);
	const handleBlurButton = (nameToBlur: string) => {
		setFilteredItems((prevItems) => {
			const updatedItems = prevItems.map((item) => {
				const updatedDestinations = item.destinations.map((destination) => {
					if (destination.name === nameToBlur) {
						return { ...destination, isBlurred: !destination.isBlurred };
					}
					return destination;
				});
				return { ...item, destinations: updatedDestinations };
			});
			return updatedItems;
		});
	};

	useEffect(() => {
		const totalPrice = items[0].destinations
			.filter((destination) => !destination.isBlurred)
			.reduce((acc, destination) => acc + destination.price, 0);
		setFilteredItems((prevItems) => [
			{
				...prevItems[0],
				price: totalPrice + prevItems[0].foodPrice + prevItems[0].hotelPrice,
			},
		]);
	}, [items[0].destinations]);

	const [shopName, setShopName] = useState("");
	const [shopPrice, setShopPrice] = useState(0);
	const handleFormSubmit = async (event: any) => {
		event.preventDefault();
		const newDestination = {
			name: shopName,
			price: shopPrice,
			link: "",
			isBlurred: false,
		};

		setFilteredItems((prevItems) => [
			{
				...prevItems[0],
				destinations: [...prevItems[0].destinations, newDestination],
			},
		]);

		setShopName("");
		setShopPrice(0);
	};

	return (
		<div className="w-full city py-16 px-36 bg-blue-300">
			{!loading ? (
				<>
					<div className="text-center text-3xl">{`${items[0].city}, ${items[0].country}`}</div>
					<div className="text-center text-2xl mt-5">
						Price: {items[0].price.toLocaleString()} ₸
					</div>
					<div className="flex mt-10 justify-between gap-20">
						<div className="flex text-xl flex-col gap-5">
							<div className="">{items[0].descr}</div>
							<div className="">
								Средняя цена за питание на целый день: {items[0].foodPrice} ₸
							</div>
							<div className="">
								Средняя цена за ночь в отеле: {items[0].hotelPrice} ₸
							</div>
							<ul className="flex gap-5 flex-col">
								{items[0].destinations.map((destination, index) => {
									return (
										<div
											key={index}
											className={`flex justify-between w-1/2 items-start ${
												destination.isBlurred && "opacity-25"
											}`}
										>
											<li>
												<p>
													{index + 1 + ")"} {destination.name}
												</p>
												<p>Цена: {destination.price} ₸</p>
												{destination.link !== "" && (
													<a
														href={destination.link}
														target="_blank"
														rel="noopener noreferrer"
														className="text-red-600 underline"
													>
														Почитать больше
													</a>
												)}
											</li>
											<button
												onClick={() => {
													handleBlurButton(destination.name);
												}}
											>
												X
											</button>
										</div>
									);
								})}
							</ul>
							<form
								method="post"
								className="flex gap-8 items-end"
								onSubmit={handleFormSubmit}
							>
								<div className="flex flex-col gap-2">
									<label htmlFor="shop_name">Укажите покупку</label>
									<input
										type="text"
										name="shop_name"
										id="shop_name"
										className="w-fit"
										placeholder="Купить сувениры для мамы..."
										value={shopName}
										onChange={(e) => setShopName(e.target.value)}
										required
									/>
								</div>
								<div className="flex flex-col gap-2">
									<label htmlFor="shop_price">Укажите цену, ₸</label>
									<input
										type="number"
										name="shop_price"
										id="shop_price"
										placeholder="1000"
										className="w-fit"
										value={shopPrice}
										required
										onChange={(e) => setShopPrice(parseInt(e.target.value))}
									/>
								</div>
								<input
									type="submit"
									value="Отправить"
									className="bg-green-600 text-white p-2 cursor-pointer"
								/>
							</form>
						</div>
						<img
							src={`${items[0].image}`}
							alt="city"
							className="h-[500px] rounded-3xl"
						/>
					</div>
				</>
			) : (
				<p className="text-3xl">Loading</p>
			)}
		</div>
	);
};

export default City;
