sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cp/c360DriverWaitTime/model/models",
	"sap/ui/model/json/JSONModel",
	"cp/c360DriverWaitTime/localService/mockserver"
	
], function (UIComponent, Device, models,JSONModel,mockserver) {
	"use strict";

	return UIComponent.extend("cp.c360DriverWaitTime.Component", {

		metadata: {
			manifest: "json"
		},
		
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			
			UIComponent.prototype.init.apply(this, arguments);

			var oModel = new JSONModel("./default/TruckTurnTimeSet.json");
		    oModel.setDefaultBindingMode("OneWay");
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			// enable routing
			this.getRouter().initialize();

			// this.getModel("hana").setUseBatch(false);
			// set the device model
			// this.setModel(models.createDeviceModel(), "device");
		}
	});
});