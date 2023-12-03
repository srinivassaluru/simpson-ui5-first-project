sap.ui.define([
	"POScanner/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(BaseController, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("POScanner.controller.S7", {

		onInit: function() {
			this.routerObj = this.getOwnerComponent().getRouter();
			this.routerObj.getRoute("scevenScreen").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			this.getView().byId("summaryTable").removeSelections(true);
			this.loadGroupData();
		},
		loadGroupData: function() {
			var sModel = this.getView().getModel();
			sModel.read("/LIST_G_IDSet", {
				success: function(oReq, oRes) {
					if (oRes.data.results.length > 0) {
						this.getView().getModel("localModel").setProperty("/LIST_G_IDSet", oRes.data.results);
						this._defaultGroupId = oRes.data.results[0].GrpId;
						this.getView().byId("groupId").setSelectedKey(this._defaultGroupId);
						this.getView().byId("summaryTable").getBinding("items").filter([
							new Filter("GrpId", FilterOperator.EQ, oRes.data.results[0].GrpId)
						]);
					} else {
						this.getView().getModel("localModel").setProperty("/LIST_G_IDSet", []);
					}
				}.bind(this),
				error: function(oEvent) {

				}.bind(this)
			});
		},
		onPost: function(oEvent) {
			var sModel = this.getView().getModel();
			var groupIdSelected = this.getView().byId("groupId").getSelectedKey();
			var sData = this.getView().byId("summaryTable").getItems().length;
			this.getView().setBusy(true);
			if (groupIdSelected && sData > 0) {
				sModel.read("/POSTSet(GrpId='" + groupIdSelected + "',PoNo='',PoItem='')", {
					success: function(oReq, oRes) {
						if (oRes.data.Type === 'E') {
							MessageBox.error(oRes.data.Msg);
							this.getView().setBusy(false);
							// this.getView().getModel("localModel").setProperty("/LIST_G_IDSet", oRes.data.results);
						} else {
							MessageBox.success(oRes.data.Msg);
							this.loadGroupData();
							this.getView().getModel("localModel").refresh(true);
							sModel.refresh(true);
							this.getView().setBusy(false);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
					}.bind(this)
				});
			}
		},
		handleSelectionChange: function(oEvent) {
			var sValue = oEvent.getSource().getSelectedKey();
			this.getView().byId("summaryTable").getBinding("items").filter([
				new Filter("GrpId", FilterOperator.EQ, sValue)
			]);
		}
	});
});