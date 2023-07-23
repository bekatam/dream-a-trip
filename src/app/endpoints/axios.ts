const axios = require("axios");

export const getData = async () => {
	const res = await axios.get("/api/city").then((data: any) => data.data);
	return res;
};
