const axios = require("axios");

export const getData = async () => {
	const res = await axios
		.get("http://dream-a-trip.vercel.app/api/city")
		.then((data: any) => data.data);
	return res;
};
