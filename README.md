# Admin EVSEs APIs

# URL

`https://services-parkncharge.sysnetph.com/admin_evses`

## APIs

### GET EVSEs - `GET /api/v1/evses?limit=1&offset=0`

**Description**

Get all of the EVSEs (Electric Vehicle Supply Equipment)

**Parameters**

- **limit**
  - Number of objects to retrieved
  - Type: Number
- **offset**
  - Starting object to be retrieved
  - Type: Number

**Sample EVSE object**

```json
{
	"uid": "09149625-e6e4-4655-ad7a-fe8008e051e9",
	"evse_code": "NCR0000000042",
	"evse_id": "PHPNCE0000000042",
	"model": "PowerCharge Max",
	"vendor": "EcoCharge Solutions",
	"serial_number": "EVCHRG123123123",
	"box_serial_number": "BOX123123123",
	"firmware_version": "v2.1.3",
	"iccid": "89014103211118510775",
	"imsi": "310260000000003",
	"cpo_location_id": 55
}
```

---

### REGISTER EVSE - `POST /api/v1/evses`

**Description**

Registers new EVSEs

**Request**

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

> NOTE: EVSE must have atleast one (1) connector.

> NOTE: All fields are required.

> NOTE: If you want to bind the EVSE during registration, specify the location_id, and if not make it 0.

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

**Errors**

- **LOCATION_ID_DOES_NOT_EXISTS**

- **Unrpocessable Entity**

---

### BIND / UNBIND evse - `PATCH /api/v1/evses/:action/:location_id/:evse_uid`

**Description**

Bind or Unbind EVSE to location.

**Parameters**

- **action**
  - Valid actions are: bind or unbind
  - Type: String
- **location_id**
  - Location's ID
  - Type: Number
- **evse_uid**
  - EVSE's UID
  - Type: String

**Response**

```json
{
	"status": 200,
	"data": "SUCCESS",
	"message": "Success"
}
```

**Errors**

- **Invalid action. Valid actions are: bind or unbind**

- **LOCATION_ID_DOES_NOT_EXISTS**

- **EVSE_UID_DOES_NOT_EXISTS**

- **EVSE_ALREADY_BINDED**
