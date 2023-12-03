/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cp/c360DriverWaitTime/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});