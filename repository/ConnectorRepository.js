const mysql = require("../database/mysql");

module.exports = class ConnectorRepository {
	/**
	 * @param {Object} data
	 * @param {import('mysql2').Connection} connection
	 */
	AddConnector(uid, data, connection) {
		const QUERY = `
            INSERT INTO evse_connectors (
                evse_uid,
				connector_id,
                standard,
                format,
                power_type_id,
                max_voltage,
                max_amperage,
                max_electric_power,
                connector_type_id,
                rate_setting_id,
                status,
                date_created,
                date_modified
            )
            VALUES ?
        `;

		let values = data.map((connector, index) => [
			uid,
			index + 1,
			connector.standard,
			connector.format,
			connector.power_type,
			connector.max_voltage,
			connector.max_amperage,
			connector.max_electric_power,
			connector.standard,
			connector.rate_setting + " KW-H",
			"AVAILABLE",
			new Date(),
			new Date(),
		]);

		return new Promise((resolve, reject) => {
			connection.query(QUERY, [values], (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
	}

	AddTimeslots(uid, lastInsertID, kwh, connectorsCount, connection) {
		console.log(uid, lastInsertID, kwh, connectorsCount);

		const QUERY = `
            INSERT INTO 
                evse_timeslots (evse_uid, connector_id, setting_timeslot_id, status)
            VALUES ?
        `;

		let connectorIDs = Array.from(
			{ length: connectorsCount },
			(_, i) => lastInsertID + i
		);
		let values = [];

		// For 7kwh charger timeslots
		if (kwh === 7) {
			for (let connectorID of connectorIDs) {
				for (let j = 1; j <= 3; j++) {
					values.push([uid, connectorID, j, "ONLINE"]);
				}
			}
		}
		// For 22kwh charger timeslots
		else if (kwh === 22) {
			for (let connectorID of connectorIDs) {
				for (let j = 4; j <= 11; j++) {
					values.push([uid, connectorID, j, "ONLINE"]);
				}
			}
		}
		// For 60kwh charger timeslots
		else if (kwh === 60) {
			for (let connectorID of connectorIDs) {
				for (let j = 12; j <= 19; j++) {
					values.push([uid, connectorID, j, "ONLINE"]);
				}
			}
		}
		// For 80kwh charger timeslots
		else if (kwh === 80) {
			for (let connectorID of connectorIDs) {
				for (let j = 20; j <= 27; j++) {
					values.push([uid, connectorID, j, "ONLINE"]);
				}
			}
		}

		return new Promise((resolve, reject) => {
			connection.query(QUERY, [values], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
