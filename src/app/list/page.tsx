"use client";
import React, { useEffect, useState } from "react";
import "./List.css";
import Link from "next/link";

const List = () => {
	const budget = 30;
	const items = [
		{
			name: "Paris, France",
			image:
				"https://www.thetrainline.com/cms/media/1360/france-eiffel-tower-paris.jpg?mode=crop&width=1080&height=1080&quality=70",
			price: 100,
		},
		{
			name: "Rome, Italy",
			image:
				"https://pbs.twimg.com/media/D5CFk3NX4AYY0cd.jpg",
			price: 52,
		},
		{
			name: "New-York, USA",
			image:
				"https://pbs.twimg.com/media/Fbp9FEuWYAI7px1?format=jpg&name=medium",
			price: 40,
		},
		{
			name: "Berlin, Germany",
			image:
				"https://avatars.mds.yandex.net/i?id=3e0eb187ab63eb8a4e7a2f5f4f9ee0e2_l-6946674-images-thumbs&n=13",
			price: 10,
		},
		{
			name: "Paris, France",
			image:
				"https://www.thetrainline.com/cms/media/1360/france-eiffel-tower-paris.jpg?mode=crop&width=1080&height=1080&quality=70",
			price: 1000,
		},
		{
			name: "Rome, Italy",
			image:
				"https://pbs.twimg.com/media/D5CFk3NX4AYY0cd.jpg",
			price: 500,
		},
		{
			name: "New-York, USA",
			image:
				"https://pbs.twimg.com/media/Fbp9FEuWYAI7px1?format=jpg&name=medium",
			price: 35,
		},
		{
			name: "Berlin, Germany",
			image:
				"https://avatars.mds.yandex.net/i?id=3e0eb187ab63eb8a4e7a2f5f4f9ee0e2_l-6946674-images-thumbs&n=13",
			price: 0,
		},
    {
			name: "Paris, France",
			image:
				"https://www.thetrainline.com/cms/media/1360/france-eiffel-tower-paris.jpg?mode=crop&width=1080&height=1080&quality=70",
			price: 100,
		},
		{
			name: "Rome, Italy",
			image:
				"https://pbs.twimg.com/media/D5CFk3NX4AYY0cd.jpg",
			price: 52,
		},
		{
			name: "New-York, USA",
			image:
				"https://pbs.twimg.com/media/Fbp9FEuWYAI7px1?format=jpg&name=medium",
			price: 40,
		},
		{
			name: "Berlin, Germany",
			image:
				"https://avatars.mds.yandex.net/i?id=3e0eb187ab63eb8a4e7a2f5f4f9ee0e2_l-6946674-images-thumbs&n=13",
			price: 10,
		},
		{
			name: "Paris, France",
			image:
				"https://www.thetrainline.com/cms/media/1360/france-eiffel-tower-paris.jpg?mode=crop&width=1080&height=1080&quality=70",
			price: 1000,
		},
		{
			name: "Rome, Italy",
			image:
				"https://pbs.twimg.com/media/D5CFk3NX4AYY0cd.jpg",
			price: 500,
		},
		{
			name: "New-York, USA",
			image:
				"https://pbs.twimg.com/media/Fbp9FEuWYAI7px1?format=jpg&name=medium",
			price: 35,
		},
		{
			name: "Berlin, Germany",
			image:
				"https://avatars.mds.yandex.net/i?id=3e0eb187ab63eb8a4e7a2f5f4f9ee0e2_l-6946674-images-thumbs&n=13",
			price: 0,
		},
	];
  const [selectedOption, setSelectedOption] = useState("option1");

	const handleKeyDown = (event: any) => {
		if (event.key === "Enter") {
			event.preventDefault();
		}
	};
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState([...items])

  const handleType = (e: any) => {
	const value = e.target.value;
    setSearch(value);
    // let filtered = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
	let filtered = value ? items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())) : items
    setFilteredItems(filtered);
  };

  const handleOptionChange = (option:any) => {
    setSelectedOption(option);
  
    if (option === "option1") {
      setFilteredItems([...items]); 
    } else if (option === "option2") {
      const ascendingItems = [...filteredItems].sort((a, b) => a.price - b.price);
      setFilteredItems(ascendingItems); 
    } else if (option === "option3") {
      const descendingItems = [...filteredItems].sort((a, b) => b.price - a.price);
      setFilteredItems(descendingItems);}
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
      <select
        className="p-1"
        value={selectedOption}
        onChange={(e) => handleOptionChange(e.target.value)}
      >
        <option value="option1">По умолчанию</option>
        <option value="option2">По возрастанию</option>
        <option value="option3">По убыванию</option>
      </select>
			<div className="list__items grid grid-cols-4 gap-x-36 gap-y-10 mt-10">
				{filteredItems.map((item, index) => {
					return (
						<Link
              href={`/city/${item.name} ${item.price}`}
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
							<div className="text-center text-3xl mt-2">{item.name}</div>
							<div className="text-center text-2xl mt-1">{item.price}</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default List;
