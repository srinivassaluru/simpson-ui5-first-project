sap.ui.define([
	"POScanner/controller/BaseController",
	"sap/m/MessageBox"
], function(BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("POScanner.controller.S2", {

		onInit: function() {
			var routerObj = this.getOwnerComponent();
			routerObj.getRouter().getRoute("secondScreen").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			this.getView().byId("enteredPo").setValueState("None");
			this.handleClear();
		},
		onAfterRendering: function() {
			this.sLocalModel = this.getView().getModel("localModel");
		},
		handlePOChange: function(oEvent) {
			this.getView().byId("enteredPo").setValueState("None");
			this.getView().setBusy(true);
			var sModel = this.getView().getModel();
			var sValue = oEvent.getParameter("value");
			// var sId = this.getView().byId("enteredPo");
			if (sValue) {
				sModel.read("/PO_VALIDATIONSet('" + sValue + "')", {
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						if (oReq.Type === "E") {
							MessageBox.error(oReq.Error);
							this.getView().byId("enteredPo").setValue("");
							this.getView().byId("enteredPo").setValueState("Error");
							this.getView().byId("enteredPo").setValueStateText(oReq.Error);
						} else {
							this.getView().byId("enteredPo").setValueState("Success");
							MessageBox.success("PO Is Valid Kindly proceed further with Assigning PO");
							// this.sLocalModel.setProperty("/validPo", true);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
						MessageBox.error(oError);
					}.bind(this)
				});
			}
		},
		handleAssignPO: function(oEvent) {
			this.getView().setBusy(true);
			var sModel = this.getView().getModel();
			var sValue = this.getView().byId("enteredPo").getValue().trim();
			this.getView().byId("enteredPo").setValueState("None");
			if (sValue) {
				sModel.read("/ASSIGN_POSet('" + sValue + "')", {
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						if (oReq.Type === "E") {
							MessageBox.error(oReq.Error);
							this.getView().byId("enteredPo").setValueState("Error");
							this.getView().byId("enteredPo").setValueStateText(oReq.Error);
						} else {
							// this.sLocalModel.setProperty("/validPo", true);
							this.getView().byId("enteredPo").setValueState("None");
							MessageBox.success(oReq.Error);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
						MessageBox.error(oError);
					}.bind(this)
				});
			} else {
				this.getView().setBusy(false);
				MessageBox.error("Enter Valid PO and Proceed with Assign");
			}
		},
		handleGenerateId: function(oEvent) {
			this.getView().setBusy(true);
			var sModel = this.getView().getModel();
			var sValue = this.getView().byId("enteredPo").getValue().trim();
			this.getView().byId("enteredPo").setValueState("None");
			if (sValue) {
				sModel.read("/GENERATE_G_IDSet", {
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						if (oReq.Type === "E") {
							MessageBox.error(oReq.results[0].Msg);
							this.getView().byId("enteredPo").setValueStateText(oReq.results[0].Msg);
							this.getView().byId("enteredPo").setValueState("Error");
						} else {
							// this.sLocalModel.setProperty("/validPo", true);
							this.getView().byId("enteredPo").setValueState("None");
							MessageBox.success(oReq.results[0].Msg);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
						MessageBox.error(oError);
					}.bind(this)
				});
			} else {
				this.getView().setBusy(false);
			}
		},
		handleClear: function() {
			this.getView().byId("enteredPo").setValue("");
		}

	});
});