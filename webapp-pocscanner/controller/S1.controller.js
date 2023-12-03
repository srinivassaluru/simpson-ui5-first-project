sap.ui.define([
	"./BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("POScanner.controller.S1", {

		onInit: function() {
			this.routerObj = this.getOwnerComponent().getRouter();
		},
		onAssignPO: function(oEvent) {
			this.routerObj.navTo("secondScreen", {});
		},
		onInwardScanning: function(oEvent) {
			this.routerObj.navTo("thirdScreen", {});
		},
		onSummary: function(oEvent) {
			this.routerObj.navTo("fourthScreen", {});
		},
		onMissing: function(oEvent) {
			this.routerObj.navTo("fifthScreen", {});
		},
		onAllocations: function(oEvent) {
			this.routerObj.navTo("sixScreen", {});
		},
		onPost: function(oEvent) {
			this.routerObj.navTo("scevenScreen", {});
		},
	});
});