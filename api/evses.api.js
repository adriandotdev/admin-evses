const TokenMiddleware = require("../middlewares/TokenMiddleware");
const {
	ROLES,
	RoleManagementMiddleware,
} = require("../middlewares/RoleManagementMiddleware");
const { validationResult, body } = require("express-validator");

const logger = require("../config/winston");
const EVSEService = require("../services/EVSEService");

const { HttpUnprocessableEntity } = require("../utils/HttpError");
// Import your SERVICE HERE
// Import MISC HERE

/**
 * @param {import('express').Express} app
 */
module.exports = (app) => {
	/**
	 * import your service here
	 * import your middlewares here
	 */
	const service = new EVSEService();
	const tokenMiddleware = new TokenMiddleware();
	const roleMiddleware = new RoleManagementMiddleware();

	/**
	 * This function will be used by the express-validator for input validation,
	 * and to be attached to APIs middleware.
	 * @param {*} req
	 * @param {*} res
	 */
	function validate(req, res) {
		const ERRORS = validationResult(req);

		if (!ERRORS.isEmpty()) {
			throw new HttpUnprocessableEntity(
				"Unprocessable Entity",
				ERRORS.mapped()
			);
		}
	}

	app.get(
		"/admin_evses/api/v1/evses",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.ADMIN),
		],

		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				const { limit, offset } = req.query;

				logger.info({
					GET_EVSES_REQUEST: { limit, offset },
				});

				const result = await service.GetEVSES({
					limit: parseInt(limit, 10) || 10,
					offset: parseInt(offset, 10) || 0,
				});

				logger.info({
					GET_EVSES_RESPONSE: {
						message: "SUCCESS",
					},
				});
				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					GET_EVSES_ERROR: {
						err,
						message: err.message,
					},
				});
				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);

	app.post(
		"/admin_evses/api/v1/evses",
		[
			tokenMiddleware.AccessTokenVerifier(),
			roleMiddleware.CheckRole(ROLES.ADMIN),
			body("model").notEmpty().withMessage("Missing required property: model"),
			body("vendor")
				.notEmpty()
				.withMessage("Missing required property: vendor"),
			body("serial_number")
				.notEmpty()
				.withMessage("Missign required property: serial_number"),
			body("box_serial_number")
				.notEmpty()
				.withMessage("Missing required property: box_serial_number"),
			body("firmware_version")
				.notEmpty()
				.withMessage("Missing required property: firmware_version"),
			body("iccid").notEmpty().withMessage("Missing required property: iccid"),
			body("imsi").notEmpty().withMessage("Missing required property: imsi"),
			body("meter_type")
				.notEmpty()
				.withMessage("Missing required property: meter_type"),
			body("meter_serial_number")
				.notEmpty()
				.withMessage("Missing required property: meter_serial_number"),
			body("location_id").optional(),
		],
		/**
		 * @param {import('express').Request} req
		 * @param {import('express').Response} res
		 */
		async (req, res) => {
			try {
				validate(req, res);

				logger.info({
					REGISTER_EVSE_REQUEST: {
						...req.body,
					},
				});

				const result = await service.RegisterEVSE({ ...req.body });

				logger.info({
					REGISTER_EVSE_RESPONSE: {
						message: "SUCCESS",
					},
				});

				return res
					.status(200)
					.json({ status: 200, data: result, message: "Success" });
			} catch (err) {
				logger.error({
					REGISTER_EVSE_ERROR: {
						err,
						message: err.message,
					},
				});
				return res.status(err.status || 500).json({
					status: err.status || 500,
					data: err.data || [],
					message: err.message || "Internal Server Error",
				});
			}
		}
	);
};
