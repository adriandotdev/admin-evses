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
		/**
		 * @function
		 * @description A function to generate list of timeslots for each connector
		 * @param {Object[]} connectorIDs List of connectors
		 * @param {Number} startingID Starting index from the evse_timeslots table
		 * @param {Number} endingID Ending index from the evse_timeslots table
		 */
		function GenerateTimeslots(connectorIDs, startingID, endingID) {
			for (let connectorID of connectorIDs) {
				for (let j = startingID; j <= endingID; j++) {
					values.push([uid, connectorID, j, "ONLINE"]);
				}
			}
		}

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

		switch (kwh) {
			case 7:
				GenerateTimeslots(connectorIDs, 1, 3);
				break;
			case 22:
				GenerateTimeslots(connectorIDs, 4, 11);
				break;
			case 60:
				GenerateTimeslots(connectorIDs, 12, 19);
				break;
			case 80:
				GenerateTimeslots(connectorIDs, 20, 27);
				break;
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
