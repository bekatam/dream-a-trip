"use client";
import React, { useEffect, useState } from "react";
import "./List.css";
import Link from "next/link";
import { getData } from "../endpoints/axios";

const List = () => {
	const [days, setDays] = useState(1);
	const [budget, setBudget] = useState(0);
	const [items, setItems] = useState([
		{
			city: "",
			price: budget,
			image: "",
			country: "",
			_id: "",
		},
	]);
	const [selectedOption, setSelectedOption] = useState("option1");
	const [search, setSearch] = useState("");
	const [filteredItems, setFilteredItems] = useState([...items]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getDataAsync = async () => {
			const data = await getData();
			setItems(data);
			setFilteredItems(data);
			setLoading(false);
		};
		getDataAsync();
	}, []);

	const handleKeyDown = (event: any) => {
		if (event.key === "Enter") {
			event.preventDefault();
		}
	};

	const handleType = (e: any) => {
		const value = e.target.value;
		setSearch(value);
		let filtered = value
			? items.filter((item) =>
					(item.city + item.country).toLowerCase().includes(value.toLowerCase())
			  )
			: items;
		if (affordable) {
			filtered = filtered.filter((item) => item.price <= budget);
		}
		setFilteredItems(filtered);
	};

	const handleOptionChange = (option: any) => {
		setSelectedOption(option);

		if (option === "option1") {
			setFilteredItems([...items]);
		} else if (option === "option2") {
			const ascendingItems = [...filteredItems].sort(
				(a, b) => a.price - b.price
			);
			setFilteredItems(ascendingItems);
		} else if (option === "option3") {
			const descendingItems = [...filteredItems].sort(
				(a, b) => b.price - a.price
			);
			setFilteredItems(descendingItems);
		}
	};

	const [affordable, setAffordable] = useState(false);

	const handleCheckboxChange = (event: any) => {
		const isChecked = event.target.checked;
		setAffordable(isChecked);
		const updItems = isChecked
			? filteredItems.filter((item) => item.price <= budget)
			: items;
		setFilteredItems(updItems);
	};

	return (
		<div className="list max-h-full bg-blue-300 pt-10 px-28 pb-20">
			<div className="text-center text-black font-bold text-3xl">List</div>
			<div className="list__options flex justify-center mt-10">
				<textarea
					placeholder="Search a city"
					className="h-10 resize-none w-1/3 outline-none border-none p-2 opacity-90"
					onKeyDown={handleKeyDown}
					onChange={handleType}
					value={search}
				></textarea>
			</div>
			<div className="flex justify-between">
				<div className="flex flex-col gap-2">
					<select
						className="p-1 h-1/2"
						value={selectedOption}
						onChange={(e) => handleOptionChange(e.target.value)}
					>
						<option value="option1">По умолчанию</option>
						<option value="option2">По возрастанию</option>
						<option value="option3">По убыванию</option>
					</select>
					<div className="flex gap-4 items-center">
						<label htmlFor="affordable">Affordable for me</label>
						<input
							type="checkbox"
							name="affordable"
							id="affordable"
							checked={affordable}
							onChange={handleCheckboxChange}
							className="h-[20px] w-[20px]"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<div className="flex gap-2 justify-between items-center">
						<p>Write your budget, ₸: </p>
						<input
							type="number"
							value={budget.toString()}
							placeholder="Write your budget"
							onChange={(e) => setBudget(Number(e.target.value))}
						/>
					</div>
					<div className="flex justify-between gap-2 items-center">
						<p>Write days: </p>
						<input
							type="number"
							value={days.toString()}
							placeholder="Write days: "
							onChange={(e) => setDays(Number(e.target.value))}
							min={1}
						/>
					</div>
				</div>
			</div>
			<div className="list__items grid grid-cols-4 gap-x-36 gap-y-10 mt-10">
				{!loading ? (
					filteredItems.map((item, index) => {
						return (
							<Link
								href={`/city/${item._id}`}
								key={index}
								className={`col-span-1 h-[400px] transition-all duration-500 rounded-3xl cursor-pointer border-2 border-blue-300 hover:border-black ${
									+budget > item.price * 0.75
										? "bg-green-300"
										: budget > item.price / 2
										? "bg-yellow-300"
										: "bg-red-300"
								} `}
							>
								<img
									alt="city"
									src={item.image}
									className="w-full rounded-tl-3xl rounded-tr-3xl h-[300px]"
								/>
								<div className="text-center text-2xl mt-2">{`${item.city}, ${item.country}`}</div>
								<div className="text-center text-xl mt-1">
									{(item.price * days).toLocaleString()} ₸
								</div>
							</Link>
						);
					})
				) : (
					<p className="text-3xl">Loading...</p>
				)}
			</div>
		</div>
	);
};

export default List;
