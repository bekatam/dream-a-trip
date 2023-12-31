"use client";
import React, { useEffect, useState, useCallback } from "react";
import "./Main.css";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
require("dotenv").config();
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
		setSelectedPlace({
			lat: event.latLng.lat(),
			lng: event.latLng.lng(),
		});
	}, []);

	useEffect(() => {
		const fetchCity = async () => {
			const url = await process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
			if (selectedPlace) {
				const { lat, lng } = selectedPlace;
				const response = await fetch(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${url}`
				);
				const data = await response.json();
				if (data.results && data.results.length > 0) {
					console.log(data.results[0]);
					const city = data.results[0].plus_code?.compound_code?.substring(7);
					console.log(city);

					const country =
						data.results[data.results.length - 1].address_components[0]
							.long_name;
					if (city) {
						setSelectedCity(city);
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
				<LoadScript
					googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + ""}
				>
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
						<div className="mb-5">{`${selectedCity}`}</div>
						<div className="city__descr mb-10">Coming soon...</div>
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
