"use client";
import React, { useState } from "react";
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
		},
	]);
	const getDataAsync = async () => {
		const fetchedItems = await getData();
		const filtered = fetchedItems.filter((item: any) => item._id === pathname);
		setFilteredItems(filtered);
		setLoading(false);
	};
	getDataAsync();
	return (
		<div className="w-full city pt-16 px-36 bg-blue-300">
			{!loading ? (
				<>
					<div className="text-center text-3xl">{`${items[0].city}, ${items[0].country}`}</div>
					<div className="text-center text-2xl mt-5">
						Price: {items[0].price.toLocaleString()} ₸
					</div>
					<div className="flex mt-10 justify-between gap-20">
						<div className="text-xl">{items[0].descr}</div>
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
