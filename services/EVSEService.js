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
				data.kwh,
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

			// Audit trail
			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: "REGISTER new EVSE",
				remarks: "success",
			});
			conn.commit();
			return status;
		} catch (err) {
			if (conn) conn.rollback();

			// Audit trail
			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: "ATTEMPT to REGISTER new EVSE",
				remarks: "failed",
			});
			throw err;
		} finally {
			if (conn) conn.release();
		}
	}

	async BindEVSE(data) {
		try {
			const result = await this.#evseRepository.BindEVSE(data);

			const status = result[0][0].STATUS;

			if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: `BIND EVSE with ID of ${data.evse_uid} to Location with ID of ${data.location_id}`,
				remarks: "success",
			});

			return status;
		} catch (err) {
			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: `ATTEMPT to BIND EVSE with ID of ${data.evse_uid} to Location with ID of ${data.location_id}`,
				remarks: "failed",
			});
			throw err;
		}
	}

	async UnbindEVSE(data) {
		try {
			const result = await this.#evseRepository.UnbindEVSE(data);

			const status = result[0][0].STATUS;

			if (status !== "SUCCESS") throw new HttpBadRequest(status, []);

			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: `UNBIND EVSE with ID of ${data.evse_uid} from Location with ID of ${data.location_id}`,
				remarks: "success",
			});
			return status;
		} catch (err) {
			await this.#evseRepository.AuditTrail({
				admin_id: data.admin_id,
				cpo_id: null,
				action: `ATTEMPT to UNBIND EVSE with ID of ${data.evse_uid} from Location with ID of ${data.location_id}`,
				remarks: "failed",
			});
			throw err;
		}
	}

	async GetDefaultData() {
		const payment_types = await this.#evseRepository.GetDefaultPaymentTypes();

		const capabilities = await this.#evseRepository.GetDefaultCapabilities();

		return { payment_types, capabilities };
	}

	async SearchEVSEBySerialNumber(serialNumber, limit, offset) {
		const result = await this.#evseRepository.SearchEVSEBySerialNumber(
			serialNumber,
			limit,
			offset
		);

		return result;
	}
};
