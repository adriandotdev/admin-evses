const EVSERepository = require("../repository/EVSERepository");
const { HttpBadRequest } = require("../utils/HttpError");

const { v4: uuidv4 } = require("uuid");
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

	async RegisterEVSE(data) {
		const uid = uuidv4();

		const result = await this.#repository.RegisterEVSE({ uid, ...data });

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async BindEVSE(data) {
		const result = await this.#repository.BindEVSE(data);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async UnbindEVSE(data) {
		const result = await this.#repository.UnbindEVSE(data);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}
};
