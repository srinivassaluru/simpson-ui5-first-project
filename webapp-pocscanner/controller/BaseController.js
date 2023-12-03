sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("POScanner.controller.BaseController", {

		// onInit: function() {
		// 	this.routerObj = this.getOwnerComponent().getRouter();
		// },
		handleHome: function() {
			this.routerObj = this.getOwnerComponent().getRouter();
			this.routerObj.navTo("firstScreen", {});
		},
		handleNavBack: function() {
			window.history.back();
		}
	});
});