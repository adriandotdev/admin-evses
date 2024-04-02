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
};
