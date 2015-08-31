"use strict";
var objUtils = require("../lib/obj-utils.js");

module.exports = function(core) {
	core.on("init-dn", function (init) {
		core.emit("init-user-up", {}, function (err, payload) {
			var userObj = objUtils.merge(init.user, payload);
			if (Object.keys(payload).length === 0) return;
			core.emit("user-up", {
				user: userObj,
				to: "me"
			});
		});
	}, 1);
};
