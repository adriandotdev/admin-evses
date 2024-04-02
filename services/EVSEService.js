const EVSERepository = require("../repository/EVSERepository");
const { HttpBadRequest } = require("../utils/HttpError");

module.exports = class EVSEService {
	#repository;

	constructor() {
		this.#repository = new EVSERepository();
	}

	async GetEVSES({ limit, offset }) {
		if (typeof limit !== "number")
			throw new HttpBadRequest(
				"Invalid limit. Limit must be on type of number"
			);

		if (typeof offset !== "number")
			throw new HttpBadRequest(
				"Invalid offset. Offset must be in type of number"
			);

		const result = await this.#repository.GetEVSES({ limit, offset });

		return result;
	}
};
