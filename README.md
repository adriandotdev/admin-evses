# Admin EVSEs APIs

# URL

`https://services-parkncharge.sysnetph.com/admin_evses`

## APIs

### GET EVSEs - `GET /api/v1/evses`

### REGISTER EVSE - `POST /api/v1/evses`

```json
{
	"party_id": "PNC",
	"model": "ChargeMaster Plus",
	"vendor": "VoltCharge Technologies",
	"serial_number": "EVCHRG999999999",
	"box_serial_number": "BOX999999999",
	"firmware_version": "v1.9.8",
	"iccid": "89014103211118510777",
	"imsi": "310260000000005",
	"meter_type": "AC",
	"meter_serial_number": "MTRAC987654321",
	"connectors": [
		{
			"standard": "TYPE_2",
			"format": "SOCKET",
			"power_type": "AC",
			"max_voltage": 210,
			"max_amperage": 140,
			"max_electric_power": 45,
			"rate_setting": 7
		}
	],
	"location_id": 56
}
```

NOTE: EVSE must have atleast one (1) connector.

### BIND / UNBIND evse - `PATCH /api/v1/evses/:action/:location_id/:evse_uid`

Parameters:

- action: Number

  Valid values are: bind or unbind

- location_id: Number

- evse_uid: String
