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
			mysql.query(
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
						reject(err);
					}

					resolve(result);
				}
			);
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
};
