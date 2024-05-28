const mysql = require("../database/mysql");

module.exports = class EVSERepository {
	/**
	 * Retrieves a paginated list of Electric Vehicle Supply Equipment (EVSE) records.
	 *
	 * @function GetEVSES
	 * @param {Object} options - Options object containing limit and offset.
	 * @param {number} options.limit - The maximum number of records to retrieve.
	 * @param {number} options.offset - The number of records to skip before starting to retrieve.
	 * @returns {Promise<Array<Object>>} A promise that resolves to an array of EVSE records.
	 */
	GetEVSES({ limit, offset }) {
		const QUERY = `
            SELECT 
                uid,
                evse_code,
                evse_id,
                model,
                vendor,
                serial_number,
                box_serial_number,
                firmware_version,
                iccid,
                imsi,
				meter_serial_number,
				status,
                cpo_location_id
            FROM evse
			ORDER BY cpo_location_id IS NULL, cpo_location_id ASC
            LIMIT ? OFFSET ?
        `;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [limit, offset], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	/**
	 * Registers a new Electric Vehicle Supply Equipment (EVSE) in the system.
	 *
	 * @function RegisterEVSE
	 * @param {Object} data - The data required to register the EVSE.
	 * @param {string} data.uid - The unique identifier for the EVSE.
	 * @param {string} data.model - The model of the EVSE.
	 * @param {string} data.vendor - The vendor of the EVSE.
	 * @param {string} data.serial_number - The serial number of the EVSE.
	 * @param {string} data.box_serial_number - The box serial number of the EVSE.
	 * @param {string} data.firmware_version - The firmware version of the EVSE.
	 * @param {string} data.iccid - The ICCID of the EVSE.
	 * @param {string} data.imsi - The IMSI of the EVSE.
	 * @param {string} data.meter_type - The meter type of the EVSE.
	 * @param {string} data.meter_serial_number - The meter serial number of the EVSE.
	 * @param {string} [data.location_id] - The location ID where the EVSE is installed (optional).
	 * @returns {Promise<Object>} A promise that resolves to an object containing the result of the registration and the database connection.
	 */
	RegisterEVSE(data) {
		const QUERY = `
           CALL WEB_ADMIN_REGISTER_EVSE(?,?,?,?,?,?,?,?,?,?,?)
        `;

		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				connection.beginTransaction((err) => {
					if (err) {
						reject({ err, connection });
						return;
					}

					connection.query(
						QUERY,
						[
							data.uid,
							data.model,
							data.vendor,
							data.serial_number,
							data.box_serial_number,
							data.firmware_version,
							data.iccid,
							data.imsi,
							data.meter_type,
							data.meter_serial_number,
							data.location_id || null,
						],
						(err, result) => {
							if (err) {
								reject({ err, connection });
							}

							resolve({ result, connection });
						}
					);
				});
			});
		});
	}

	BindEVSE(data) {
		const QUERY = `CALL WEB_ADMIN_BIND_EVSE(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [data.location_id, data.evse_uid], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	UnbindEVSE(data) {
		const QUERY = `CALL WEB_ADMIN_UNBIND_EVSE(?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [data.location_id, data.evse_uid], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddEVSEPaymentTypes(paymentTypes, connection) {
		const QUERY = `INSERT INTO evse_payment_types (evse_uid, payment_type_id)
		VALUES ?`;

		return new Promise((resolve, reject) => {
			connection.query(QUERY, [paymentTypes], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AddEVSECapabilities(capabilities, connection) {
		const QUERY = `INSERT INTO evse_capabilities (capability_id, evse_uid) VALUES ?`;

		return new Promise((resolve, reject) => {
			connection.query(QUERY, [capabilities], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetDefaultPaymentTypes() {
		const QUERY = `SELECT * FROM payment_types`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetDefaultCapabilities() {
		const QUERY = `SELECT * FROM capabilities`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	SearchEVSEBySerialNumber(serialNumber, limit, offset) {
		const QUERY = `
			SELECT 
				uid,
				evse_code,
				evse_id,
				model,
				vendor,
				serial_number,
				box_serial_number,
				firmware_version,
				iccid,
				imsi,
				meter_serial_number,
				status,
				cpo_location_id
			FROM evse
			WHERE LOWER(serial_number) LIKE ?
			LIMIT ${limit} OFFSET ${offset}
		`;

		const PATTERN = `%${serialNumber}%`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [`%${serialNumber}%`], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	AuditTrail({ admin_id, cpo_id, action, remarks }) {
		const QUERY = `
			INSERT INTO 
				admin_audit_trails (admin_id, cpo_id, action, remarks, date_created, date_modified)
			VALUES (
				?,?,?,?,NOW(),NOW()
			)
		`;

		return new Promise((resolve, reject) => {
			mysql.query(QUERY, [admin_id, cpo_id, action, remarks], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
