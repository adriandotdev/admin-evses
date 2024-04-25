const ConnectorRepository = require("../repository/ConnectorRepository");
const EVSERepository = require("../repository/EVSERepository");
const {
	HttpBadRequest,
	HttpInternalServerError,
} = require("../utils/HttpError");

const { v4: uuidv4 } = require("uuid");
module.exports = class EVSEService {
	#evseRepository;
	#connectorRepository;

	constructor() {
		this.#evseRepository = new EVSERepository();
		this.#connectorRepository = new ConnectorRepository();
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

		const result = await this.#evseRepository.GetEVSES({ limit, offset });

		return result;
	}

	async RegisterEVSE(data) {
		let conn = null;

		try {
			const uid = uuidv4();

			const { result, connection } = await this.#evseRepository.RegisterEVSE({
				uid,
				...data,
			});
			const status = result[0][0].STATUS;
			conn = connection;

			if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

			const connectorResult = await this.#connectorRepository.AddConnector(
				uid,
				data.connectors,
				connection
			);

			await this.#connectorRepository.AddTimeslots(
				uid,
				1,
				7,
				data.connectors.length,
				connection
			);

			const newPaymentTypes = data.payment_types.map((payment_type) => [
				uid,
				payment_type,
			]);

			await this.#evseRepository.AddEVSEPaymentTypes(
				newPaymentTypes,
				connection
			);

			const newCapabilities = data.capabilities.map((capability) => [
				capability,
				uid,
			]);

			await this.#evseRepository.AddEVSECapabilities(
				newCapabilities,
				connection
			);

			conn.commit();
			return status;
		} catch (err) {
			if (conn) conn.rollback();
			throw new HttpInternalServerError(err.message, []);
		} finally {
			if (conn) conn.release();
		}
	}

	async BindEVSE(data) {
		const result = await this.#evseRepository.BindEVSE(data);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async UnbindEVSE(data) {
		const result = await this.#evseRepository.UnbindEVSE(data);

		const status = result[0][0].STATUS;

		if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

		return status;
	}

	async GetDefaultData() {
		const payment_types = await this.#evseRepository.GetDefaultPaymentTypes();

		const capabilities = await this.#evseRepository.GetDefaultCapabilities();

		return { payment_types, capabilities };
	}
};
