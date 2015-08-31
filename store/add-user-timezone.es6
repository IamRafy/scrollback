"use strict";
module.exports = function(core) {

	core.on("init-user-up", function(payload, next) {

		var timezone = -(new Date().getTimezoneOffset());
		if (payload.timezone === timezone) {
			return next();
		}
		payload.timezone = timezone;
		next();
	});
};
