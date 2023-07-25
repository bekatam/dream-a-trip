"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./City.css";
import { getData } from "@/app/endpoints/axios";
import axios from "axios";
import mongoose from "mongoose";

const City = () => {
	const pathname = usePathname().substring(6);
	const [loading, setLoading] = useState(true);
	interface Destination {
		name: string;
		price: number;
		link: string;
		isBlurred: boolean;
		_id: any;
	}

	interface Item {
		city: string;
		country: string;
		price: number;
		descr: string;
		image: string;
		destinations: Destination[];
		foodPrice: number;
		hotelPrice: number;
	}

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
	const handleBlurButton = (itemToBlur: string) => {
		setFilteredItems((prevItems) => {
			const updatedItems = prevItems.map((item) => {
				const updatedDestinations = item.destinations.map((destination) => {
					if (destination._id === itemToBlur && destination.link.trim() == "") {
						axios
							.delete(`/api/city/${pathname}`)
							.then((response) => {
								console.log(response.data); // You can handle the response here if needed
							})
							.catch((error) => {
								console.error("error"); // Handle any errors that occur during the request
							});
						return null;
					} else if (destination._id === itemToBlur) {
						return { ...destination, isBlurred: !destination.isBlurred };
					}
					return destination;
				});

				const filteredDestinations = updatedDestinations.filter(
					(destination) => destination !== null
				) as Destination[];

				return { ...item, destinations: filteredDestinations };
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
			_id: new mongoose.Types.ObjectId(),
		};

		setFilteredItems((prevItems) => [
			{
				...prevItems[0],
				destinations: [...prevItems[0].destinations, newDestination],
			},
		]);
		if (shopName.trim() != "") {
			console.log(pathname);
			await axios.post(`/api/city/${pathname}`, newDestination);
		}
		setShopName("");
		setShopPrice(0);
	};

	return (
		<div className="w-full city py-16 px-36 bg-blue-300">
			{!loading ? (
				<>
					<div className="text-center text-3xl">{`${items[0].city}, ${items[0].country}`}</div>
					<div className="text-center text-2xl mt-5">
						Price:{" "}
						<span className="font-semibold">
							{items[0].price.toLocaleString()}
						</span>{" "}
						₸
					</div>
					<div className="flex mt-10 justify-between gap-20">
						<div className="flex text-xl flex-col gap-5">
							<div>{items[0].descr}</div>
							<div>
								Средняя цена за питание на целый день:{" "}
								<span className="font-semibold">
									{items[0].foodPrice.toLocaleString()}
								</span>{" "}
								₸
							</div>
							<div>
								Средняя цена за ночь в отеле:{" "}
								<span className="font-semibold">
									{items[0].hotelPrice.toLocaleString()}
								</span>{" "}
								₸
							</div>
							<div className="font-bold">
								Просьба добавлять только проверенные места, а если добавляете
								свои покупки, можете высчитать, сохранить себе бюджет и удалить,
								так как это бета-версия авторизация недоступна
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
												<p>Цена: {destination.price.toLocaleString()} ₸</p>
												{destination.link.trim() != "" && (
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
													handleBlurButton(destination._id);
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
									<label htmlFor="shop_name">Укажите назначение</label>
									<input
										type="text"
										name="shop_name"
										id="shop_name"
										className="w-fit p-2"
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
										className="w-fit p-2"
										value={shopPrice}
										required
										onChange={(e) => setShopPrice(parseInt(e.target.value))}
										min={0}
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
				<p className="text-3xl">Loading...</p>
			)}
		</div>
	);
};

export default City;
