const mysql = require("../database/mysql");

module.exports = class EVSERepository {
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
                cpo_location_id
            FROM evse
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
};
