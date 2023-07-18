const axios = require("axios");

export const getData = async () => {
	const res = await axios
		.get("http://localhost:3000/api/city")
		.then((data: any) => data.data);
	return res;
};
