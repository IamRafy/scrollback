/* eslint-env browser */

"use strict";

var gcmTimeValidity = 12 * 60 * 60 * 1000,
	updateDevice = false,
//	objUtils = require("../lib/obj-utils.js"),
	userUtils = require("../lib/user-utils.js");

module.exports = function(core, config, store) {
	var LS = window.localStorage,
		lastGCMTime, device,
		initUserObject,
		initUserCallback,
		defaultPackageName;

	defaultPackageName = config.pushNotification.defaultPackageName || "";

	lastGCMTime = LS.getItem("lastGCMTime");
	lastGCMTime = lastGCMTime ? parseInt(lastGCMTime, 10) : 0;

	function addGcmData() {
		if (!device || !initUserObject || !initUserCallback) return;

		var userObj = store.getUser(), uuid, key = "";
		if (!userObj.id || userUtils.isGuest(userObj.id)) return;

		var pushNot = userObj.params.pushNotification;

//		if (device[deviceId] === pushNot.devices[deviceId]) {
//			initUserCallback();
//			return;
//		}

		initUserObject.params = initUserObject.params || {};
		initUserObject.params.pushNotifications = initUserObject.params.pushNotifications || pushNot || {};
		initUserObject.params.pushNotifications.devices = initUserObject.params.pushNotifications.devices || [];

//		initUserObject.params.pushNotifications.devices.push(gcmDevObject);

		device.expiryTime = new Date().getTime() + gcmTimeValidity;
		uuid = device.uuid;

		device.platform = "android";
		key = device.uuid + (device.packageName && device.packageName !== defaultPackageName ? ("_" + device.packageName) : "");
		initUserObject.params.pushNotifications.devices[key] = device;
		device.enabled = true;

		LS.setItem("lastGCMTime", new Date().getTime());
		LS.setItem("currentDevice", uuid);
		updateDevice = false;
		initUserCallback();
	}

	core.on("boot", function(state, next) {
		if (state.context.env === "android" && lastGCMTime < (new Date().getTime() - gcmTimeValidity)) {

			if (window.Android && typeof window.Android.registerGCM === "function") {
				window.Android.registerGCM();
			}

			window.addEventListener("gcm_register", function(event) {
				device = event.detail;

				if (window.Android && typeof window.Android.getPackageName === "function") {
					device.packageName = window.Android.getPackageName();
				}

				updateDevice = true;
				if (store.get("app", "connectionStatus") === "online") {
					addGcmData();
				}
			});

		}
		next();
	}, 100);

	core.on("init-user-up", function(payload, next) {
		initUserObject = payload;
		initUserCallback = next;
		addGcmData();
	});

//	function saveUser() {
//		var userObj = store.getUser(), uuid, key = "";
//
//		if (!userObj.id || userUtils.isGuest(userObj.id)) return;
//
//		userObj = objUtils.clone(userObj);
//
//		if (!userObj.params) userObj.params = {};
//		if (!userObj.params.pushNotifications || userObj.params.pushNotifications instanceof Array) userObj.params.pushNotifications = {};
//		if (!userObj.params.pushNotifications.devices || typeof userObj.params.pushNotifications.devices.length === "number") {
//			userObj.params.pushNotifications.devices = {};
//		}
//
//		device.expiryTime = new Date().getTime() + gcmTimeValidity;
//		uuid = device.uuid;
//
//		device.platform = "android";
//		key = device.uuid + (device.packageName && device.packageName !== defaultPackageName ? ("_" + device.packageName) : "");
//
//
//		userObj.params.pushNotifications.devices[key] = device;
//		device.enabled = true;
//
//		core.emit("user-up", {
//			user: userObj,
//			to: "me"
//		}, function() {
//			LS.setItem("lastGCMTime", new Date().getTime());
//			LS.setItem("currentDevice", uuid);
//			updateDevice = false;
//		});
//	}

	core.on("statechange", function(changes, next) {
		if (changes.user && device && updateDevice) {
			addGcmData();
		}
		next();
	}, 500);

	core.on("logout", function(payload, next) {
		if (store.get("context", "env") === "android" && typeof window.Android.unregisterGCM === "function") {
			window.Android.unregisterGCM();
			localStorage.removeItem("lastGCMTime");
			localStorage.removeItem("currentDevice");
		}
		next();
	}, 500);
};
