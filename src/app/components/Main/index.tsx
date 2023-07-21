"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./Main.css";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
const dotenv = require("dotenv");
dotenv.config();

interface UserData {
	lat: any;
	lng: any;
	prevState?: null;
}
const Main = () => {
	const containerStyle = {
		width: "100%",
		height: "100%",
	};

	const [selectedPlace, setSelectedPlace] = useState<UserData | null>(null);
	const [selectedCity, setSelectedCity] = useState(null);
	const [country, setCountry] = useState(null);
	const [mapCenter, setMapCenter] = useState({ lat: 20, lng: 0 });
	const [closed, setClosed] = useState(true);
	const [modal, setModal] = useState(false);

	const handleClose = () => {
		setClosed(!closed);
	};

	const handleModal = () => {
		setModal(!modal);
		setClosed(false);
	};

	const onMarkerDragEnd = useCallback(async (event: any) => {
		console.log("setSelectedPlace");
		setSelectedPlace({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
	}, []);

	useEffect(() => {
		const fetchCity = async () => {
			if (selectedPlace) {
				const { lat, lng } = selectedPlace;
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD8sth4FLPl4af02hfH1WWpgIZxMc4PKho`
				);
				const data = await response.json();
				if (data.results && data.results.length > 0) {
					const city = data.results[0].address_components.find(
						(component: any) =>
							component.types.includes("locality") ||
							component.types.includes("administrative_area_level_1")
					);

					const country =
						data.results[data.results.length - 1].address_components[0]
							.long_name;
					if (city) {
						setSelectedCity(city.long_name);
						setCountry(country);
					}
				}
			}
		};

		fetchCity();
	}, [selectedPlace]);

	const onMapClick = useCallback((event: any) => {
		setSelectedPlace({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
		setMapCenter({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
		setClosed(true);
	}, []);

	return (
		<>
			<div
				className={`main bg-blue-300 min-w-screen relative ${
					modal ? "modal-open" : ""
				}`}
			>
				<LoadScript googleMapsApiKey="AIzaSyD8sth4FLPl4af02hfH1WWpgIZxMc4PKho">
					<GoogleMap
						mapContainerStyle={containerStyle}
						zoom={3}
						center={mapCenter}
						onClick={onMapClick}
					>
						{selectedPlace && (
							<Marker
								position={selectedPlace}
								draggable={true}
								onDragEnd={onMarkerDragEnd}
							/>
						)}
					</GoogleMap>
				</LoadScript>
				{selectedCity && closed && (
					<div className="city__wrapper absolute top-1/3 right-1/3 w-64 min-h-32 rounded-[20px] p-5 bg-[#93FF51] shadow-2xl text-[14px]">
						<div className="city__wrapper__info flex justify-between items-center text-[19px]">
							{selectedCity}
							<span
								className="city__wrapper__close text-[24px] cursor-pointer"
								onClick={handleClose}
							>
								X
							</span>
						</div>
						<div
							className="city__wrapper__learn mt-4 underline cursor-pointer text-[18px]"
							onClick={handleModal}
						>
							Learn More {"->"}
						</div>
					</div>
				)}
			</div>
			{modal && (
				<div className="absolute top-1/4 -translate-y-20 left-1/3 h-2/3  w-1/3 p-6 pt-3 rounded-3xl bg-green-300">
					<span
						className="text-[24px] cursor-pointer flex justify-end"
						onClick={handleModal}
					>
						X
					</span>
					<div className="city__wrapper__info flex flex-col justify-between items-center text-[19px]">
						<div className="city mb-5">{`${selectedCity}, ${country}`}</div>
						<div className="city__descr mb-10">
							Далеко-далеко за словесными горами в стране гласных и согласных
							живут рыбные тексты. Подпоясал имеет ручеек свое океана своего
							меня которой рукописи! До lorem приставка языкового страну
							переписывается жаренные ведущими вопрос встретил решила? Океана
							дал сбить безорфографичный? Букв продолжил все вопроса первую
							снова, большого коварных своих речью путь! Даже заглавных если
							толку вскоре которое ты ipsum прямо свой там. Повстречался выйти
							букв курсивных! Послушавшись маленький вскоре реторический,
							составитель дал свой деревни даль курсивных ipsum своих все
							встретил великий раз. Рукописи лучше пунктуация составитель
							возвращайся грустный сих текст осталось, несколько знаках. Взгляд,
							языкового переписали.
						</div>
						<div className="want flex self-start text-xl items-center">
							I want to go here
							<input type="checkbox" name="want" className="ml-4 h-5 w-5" />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Main;
