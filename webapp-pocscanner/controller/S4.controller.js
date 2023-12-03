sap.ui.define([
	"POScanner/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(BaseController, Filter, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("POScanner.controller.S4", {
		onInit: function() {
			this.routerObj = this.getOwnerComponent().getRouter();
			this.routerObj.getRoute("fourthScreen").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			this.getView().byId("summaryTable").removeSelections(true);
			this.loadGroupData();
		},
		onInwardScanning: function(oEvent) {
			// this.routerObj.navTo("thirdScreen", {});
			var selectedItem = this.getView().byId("summaryTable").getSelectedItem();
			if (selectedItem) {
				var sEntrySource = selectedItem.getBindingContext().getObject();
				var sEntry = {
					"GrpId": sEntrySource.GrpId,
					"Ean": sEntrySource.Ean,
					"Matnr": sEntrySource.Article,
					"Invoice": sEntrySource.InvoiceNo,
					"MfgDate": sEntrySource.MfgDate,
					"CaseSize": sEntrySource.CaseSize - 0,
					"BoxSize": sEntrySource.BoxSize - 0,
					"ExpDate": sEntrySource.ExpiryDate,
					"Quantity": ( sEntrySource.CaseSize - 0) * (sEntrySource.BoxSize - 0),
					"Tihi": sEntrySource.Tihi.trim(),
					"Mrp": sEntrySource.ActMrp - 0,
					"Txz01": sEntrySource.Txz01,
					"ShelfLife": sEntrySource.ShelfLife - 0
				};
				this.getView().getModel("localModel").setProperty("/inwardEntry", sEntry);
				this.getView().getModel("localModel").setProperty("/recievedDataFromInWard", sEntrySource);
				this.routerObj.navTo("thirdScreen", {
					source: "summary"
				});
			}
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
		handleSelectionChange: function(oEvent) {
			var sValue = oEvent.getSource().getSelectedKey();
			this.getView().byId("summaryTable").removeSelections(true);
			this.getView().byId("summaryTable").getBinding("items").filter([
				new Filter("GrpId", FilterOperator.EQ, sValue)
			]);
		},
		onPost: function(oEvent) {
			var sModel = this.getView().getModel();
			var groupIdSelected = this.getView().byId("groupId").getSelectedKey();
			var sData = this.getView().byId("summaryTable").getItems().length;
			this.getView().setBusy(true);
			if (groupIdSelected && sData > 0) {
				sModel.read("/POSTSet(GrpId='" + groupIdSelected + "',PoNo='',PoItem='')", {
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						if (oRes.data.Type === 'E') {
							MessageBox.error(oRes.data.Msg);
						} else if (oRes.data.Type === 'S') {
							MessageBox.success(oRes.data.Msg);
							this.loadGroupData();
							sModel.refresh(true);
						} else {
							MessageBox.error("Something went Wrong! Please try Again!");
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
					}.bind(this)
				});
			}
		}
	});
});