sap.ui.define([
	"POScanner/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/core/Fragment'
], function(BaseController, MessageBox, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("POScanner.controller.S3", {

		onInit: function() {
			this.summarScreenThrougLoaded = false;
			this._totalCount = 0;
			this.routerObj = this.getOwnerComponent().getRouter();
			this.routerObj.getRoute("thirdScreen").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function(oEvent) {
			this.handleClear(true);
			var sParameters = oEvent.getParameter("arguments");
			var entry = this.getView().getModel("localModel").getProperty("/inwardEntry");
			this.getView().getModel().refresh(true);
			this.getView().getModel("localModel").setProperty("/source", "inwardScreen");
			if (entry && sParameters.source === "summary") {
				this.getView().getModel("localModel").setProperty("/source", "summary");
				this.setScreenValues(entry);
				this.summarScreenThrougLoaded = true;
			}
		},
		handleQty: function() {
			var sEnteredCase = this.getView().byId("caseSize").getValue();
			var sEnteredBox = this.getView().byId("boxSize").getValue();
			var total = 0;
			if (sEnteredCase && sEnteredBox) {
				total = sEnteredBox * sEnteredCase;
			}
			this.getView().getModel("localModel").setProperty("/totalQty", total);
		},
		handleSave: function() {
			var sView = this.getView();
			var groupId = sView.byId("groupId").getSelectedKey();
			var eanCode = sView.byId("eanCode").getValue().trim();
			var articleCode = sView.byId("articleCode").getValue().trim();
			var invoiceNumber = sView.byId("invoiceNumber").getValue().trim();
			var mfgDate = sView.byId("mfgDate").getValue();
			var expDate = sView.byId("expDate").getValue();
			var totalQty = sView.getModel("localModel").getProperty("/totalQty");
			var tihi = sView.byId("tihi").getValue().trim();
			var mrpNumber = sView.byId("mrpNumber").getValue().trim();
			var sEnteredCase = this.getView().byId("caseSize").getValue().trim();
			var sEnteredBox = this.getView().byId("boxSize").getValue().trim();
			var desc = this.getView().byId("desc").getValue();
			var shelfLife = this.getView().byId("shelfLife").getValue();
			var recievedData = this.getView().getModel("localModel").getProperty("/recievedData");
			var source = this.getView().getModel("localModel").getProperty("/source");
			if (source === "summary") {
				recievedData = this.getView().getModel("localModel").getProperty("/recievedDataFromInWard");
			}
			if (eanCode.length <= 0 || articleCode.length <= 0 || invoiceNumber.length <= 0 || mrpNumber.length <= 0 || sEnteredCase.lenth <= 0 ||
				sEnteredBox.length <= 0) {
				MessageBox.error("Please fill the form and Submit");
				return;
			}
			if (mfgDate.length <= 0 && expDate.length <= 0) {
				MessageBox.error("Please fill the form and Submit");
				return;
			}
			if (mfgDate.length >= 0) {
				var todayDate = new Date();
				var systemEnteredDate = sView.byId("mfgDate").getDateValue();
				if (systemEnteredDate > todayDate) {
					MessageBox.error("Manufaturing Date Can't be future Date");
					return;
				}
			}
			var sendData = {
				"GrpId": groupId,
				"Ean": eanCode,
				"Matnr": articleCode,
				"Invoice": invoiceNumber,
				"MfgDate": mfgDate,
				"CaseSize": sEnteredCase,
				"BoxSize": sEnteredBox,
				"ExpDate": expDate,
				// "Quantity": recievedData.Quantity,
				"Tihi": (tihi - 0).toString(),
				"ActMrp": mrpNumber,
				"ActQty": (totalQty.toString() - 0).toString(),
				"Description": desc,
				"ShelfLife": shelfLife,
				"Update": (this.summarScreenThrougLoaded) ? "X" : "",
				// "PTol": recievedData.PTol,
				// "NTol": recievedData.NTol,
				"ALLOCATIONSet": [{
					"GrpId": groupId
				}]
			};
			if (this.screenValidations(sendData, recievedData)) {
				var sModel = sView.getModel();
				sModel.create("/SAVE_INWARD_SCANSet", sendData, {
					success: function(oReq, oRes) {
						if (oReq.Type === "S") {
							this._totalCount = 0;
							MessageBox.success("Record Saved Against the Group Id " + groupId, {
								onClose: function(oAction) {
									if (oReq && oReq.ALLOCATIONSet && oReq.ALLOCATIONSet.results.length > 0) {
										this.loadAllocationData(oReq.ALLOCATIONSet.results);
									}
								}.bind(this)
							});
							this.handleClear();
						} else if (oReq.Type === "E") {
							MessageBox.error(oReq.Msg);
						} else {
							MessageBox.error("Something went Wrong! Please try Again!");
						}
					}.bind(this),
					error: function(oError) {
						MessageBox.error("Failed to Saved Against the Group Id " + groupId);
					}.bind(this)
				});
			}
		},
		screenValidations: function(sendData, recievedData) {
			if (this.mandatoryChecks() && this.DateValidations(sendData, recievedData) && this.MRPValidatations(sendData, recievedData) && this
				.quantityValidations(
					sendData, recievedData)) {
				return true;
			} else {
				return false;
			}
		},

		mandatoryChecks: function() {
			var sList = ["invoiceNumber", "mrpNumber", "caseSize", "boxSize"];
			var sView = this.getView();
			for (var ref in sList) {
				var sValue = sView.byId(sList[ref]).getValue();
				if (sValue.length <= 0) {
					MessageBox.error("Please fill the form and Submit");
					return false;
				}
			}
			return true;
		},
		DateValidations: function(sendData, recievedData) {
			var currentDate = new Date();
			if (sendData.MfgDate) {
				var newValue = this.getView().byId("mfgDate").getValue();
				var parts_of_date = newValue.split("-");
				var output = new Date(+parts_of_date[2], parts_of_date[1] - 1, +parts_of_date[0]);
				var shelfLife = recievedData.ShelfLife - 0;
				var shelfLifeThroughGeneratedDate = new Date(output.setDate(new Date(output).getDate() + shelfLife));
				if (shelfLifeThroughGeneratedDate < currentDate) {
					MessageBox.error("Product has Expired");
					return false;
				} else {
					return true;
				}
			} else if (sendData.ExpDate) {
				var expDate = this.getView().byId("expDate").getDateValue();
				// var shelfLifeThroughGeneratedDateExp = new Date().setDate( new Date(expDate).getDate() + 30);
				if (expDate <= currentDate) {
					MessageBox.error("Product has Expired");
					return false;
				} else {
					return true;
				}
			}
		},
		MRPValidatations: function(sendData, recievedData) {
			var mrpEntered = sendData.ActMrp - 0;
			var mrpPO = recievedData.Mrp - 0;
			var poTotal = recievedData.PTol - 0;
			var noTotal = recievedData.NTol - 0;
			if (recievedData.Mrp === "999") {
				return;
			}
			if ((mrpEntered !== mrpPO) && (mrpEntered < poTotal) && (mrpEntered > noTotal)) {
				this._totalCount++;
				if (this._totalCount > 3) {
					return true;
				}
				MessageBox.error("MRP does not match PO MRP");
				return false;
			} else if ((mrpEntered !== mrpPO) && (mrpEntered > poTotal) || (mrpEntered < noTotal)) {
				MessageBox.error("MRP is outside Tolerance limit");
				this._totalCount = 0;
				return false;
			} else {
				this._totalCount = 0;
				return true;
			}
		},
		quantityValidations: function(sendData, recievedData) {
			var totalQty = this.getView().getModel("localModel").getProperty("/totalQty");
			var quantEntered = totalQty - 0;
			var quantRecieved = recievedData.Quantity - 0;
			if (quantEntered > quantRecieved) {
				MessageBox.error("Quantity Value is exceeded than PO");
				return false;
			} else {
				return true;
			}
		},
		handleClear: function(sFlag) {
			var sView = this.getView();
			// sView.byId("groupId").setSelectedKey("");
			sView.byId("eanCode").setValue("");
			sView.byId("articleCode").setValue("");
			if (sFlag) {
				sView.byId("invoiceNumber").setValue("");
				sView.byId("shelfLife").setValue("");
			}

			sView.byId("mfgDate").setEditable(true);
			sView.byId("expDate").setEditable(true);

			sView.byId("mfgDate").setValue("");
			sView.byId("expDate").setValue("");
			sView.byId("caseSize").setValue("");
			sView.byId("boxSize").setValue("");
			sView.byId("tihi").setValue("");
			sView.byId("mrpNumber").setValue("");
			sView.byId("desc").setValue("");
			this.getView().getModel("localModel").setProperty("/totalQty", 0);
		},
		handleSummary: function() {
			this.routerObj.navTo("fourthScreen", {});
		},
		handleEANChange: function(oEvent) {
			var sModel = this.getView().getModel();
			var sValue = oEvent.getParameter("value");
			// var sGroupId = "0000000084";
			var sGroupId = this.getView().byId("groupId").getSelectedKey();
			var eanCode = this.getView().byId("eanCode");
			eanCode.setValueState("None");
			var articleCode = this.getView().byId("articleCode");
			articleCode.setValueState("None");
			if (sValue) {
				this.getView().setBusy(true);
				var aFilters = [
					new Filter("GrpId", FilterOperator.EQ, sGroupId),
					new Filter("Ean", FilterOperator.EQ, sValue)
				];
				sModel.read("/INWARD_SCANSet", {
					filters: aFilters,
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						var sResults = oReq.results;
						if (sResults.length > 0 && sResults[0].Type === "S") {
							this.getView().getModel("localModel").setProperty("/recievedData", sResults[0]);
							this.getView().byId("desc").setValue(sResults[0].Description);
							this.getView().byId("articleCode").setValue(sResults[0].Matnr);
							this.getView().byId("shelfLife").setValue(sResults[0].ShelfLife);
							if (sResults[0].Mrp - 0 === 999) {
								this.getView().byId("mrpNumber").setEditable(false);
							} else {
								this.getView().byId("mrpNumber").setEditable(true);
							}

						} else {
							this.getView().getModel("localModel").setProperty("/recievedData", []);
							MessageBox.error(sResults[0].Msg);
							this.getView().byId("desc").setValue("");
							this.getView().byId("articleCode").setValue("");
							this.getView().byId("shelfLife").setValue("");
							eanCode.setValueState("Error");
							eanCode.setValueStateText(sResults[0].Msg);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
						MessageBox.error(oError);
					}.bind(this)
				});
			}
		},
		handleArticleChange: function(oEvent) {
			var sModel = this.getView().getModel();
			var sValue = oEvent.getParameter("value");
			var sGroupId = this.getView().byId("groupId").getSelectedKey();
			var eanCode = this.getView().byId("eanCode");
			eanCode.setValueState("None");
			var articleCode = this.getView().byId("articleCode");
			articleCode.setValueState("None");
			if (sValue) {
				this.getView().setBusy(true);
				var aFilters = [
					new Filter("GrpId", FilterOperator.EQ, sGroupId),
					new Filter("Matnr", FilterOperator.EQ, sValue)
				];
				sModel.read("/INWARD_SCANSet", {
					filters: aFilters,
					success: function(oReq, oRes) {
						this.getView().setBusy(false);
						var sResults = oReq.results;
						if (sResults.length > 0 && sResults[0].Type === "S") {
							this.getView().getModel("localModel").setProperty("/recievedData", sResults[0]);
							this.getView().byId("desc").setValue(sResults[0].Description);
							this.getView().byId("eanCode").setValue(sResults[0].Ean);
							this.getView().byId("shelfLife").setValue(sResults[0].ShelfLife);
						} else {
							this.getView().getModel("localModel").setProperty("/recievedData", []);
							MessageBox.error(sResults[0].Msg);
							this.getView().byId("desc").setValue("");
							this.getView().byId("eanCode").setValue("");
							this.getView().byId("shelfLife").setValue("");
							articleCode.setValueState("Error");
							articleCode.setValueStateText(sResults[0].Msg);
						}
					}.bind(this),
					error: function(oError) {
						this.getView().setBusy(false);
						MessageBox.error(oError);
					}.bind(this)
				});
			}
		},
		handleMRPChange: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var totalValue = sValue * (5 / 100);
			if (totalValue > 0) {
				MessageBox.error("Tolerance is High");
			} else {
				MessageBox.error("Tolerance is Low");
			}
		},
		setScreenValues: function(sEntry) {
			this.getView().byId("mfgDate").setEnabled(true);
			this.getView().byId("expDate").setEditable(true);
			var sView = this.getView();
			sView.byId("groupId").setSelectedKey(sEntry.GrpId);
			sView.byId("eanCode").setValue(sEntry.Ean);
			sView.byId("articleCode").setValue(sEntry.Matnr);
			sView.byId("invoiceNumber").setValue(sEntry.Invoice);
			sView.byId("mfgDate").setValue(sEntry.MfgDate);
			sView.byId("expDate").setValue(sEntry.ExpDate);
			sView.byId("caseSize").setValue(sEntry.CaseSize);
			sView.byId("boxSize").setValue(sEntry.BoxSize);
			sView.byId("tihi").setValue(sEntry.Tihi);
			sView.byId("mrpNumber").setValue(sEntry.Mrp);
			sView.byId("shelfLife").setValue(sEntry.ShelfLife);
			sView.byId("desc").setValue(sEntry.Txz01);
			this.getView().getModel("localModel").setProperty("/totalQty", sEntry.Quantity);
			// if (sEntry.MfgDate) {
			// 	this.getView().byId("mfgDate").setEnabled(false);
			// } else {
			// 	this.getView().byId("expDate").setEnabled(false);
			// }
		},
		handleMfgDateChange: function(oEvent) {
			var newValue = oEvent.getParameter("newValue");
			if (newValue) {
				var parts_of_date = newValue.split("-");
				var output = new Date(+parts_of_date[2], parts_of_date[1] - 1, +parts_of_date[0]);
				this.getView().getModel("localModel").setProperty("/selectedMfgDate", newValue);
				if (newValue) {
					this.getView().byId("expDate").setEditable(false);
				} else {
					this.getView().byId("expDate").setEditable(true);
				}
				var recievedData = this.getView().getModel("localModel").getProperty("/recievedData");
				var source = this.getView().getModel("localModel").getProperty("/source");
				if (source === "summary") {
					recievedData = this.getView().getModel("localModel").getProperty("/recievedDataFromInWard");
				}
				if (recievedData && recievedData.ShelfLife) {
					var shelfLife = recievedData.ShelfLife - 0;
					var shelfLifeThroughGeneratedDate = new Date(output.setDate(new Date(output).getDate() + shelfLife));
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd-MM-yyyy"
					});
					var dateFormatted = dateFormat.format(shelfLifeThroughGeneratedDate);
					this.getView().byId("expDate").setValue(dateFormatted);
				}
			} else {
				this.getView().byId("expDate").setValue("");
				this.getView().byId("expDate").setEditable(true);
			}
		},
		handleExpDateChange: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			if (sValue) {
				this.getView().byId("mfgDate").setEditable(false);
			} else {
				this.getView().byId("mfgDate").setEditable(true);
			}
		},
		loadAllocationData: function(oResults) {
			var oView = this.getView();
			oView.getModel("localModel").setProperty("/ALLOCATIONSet", oResults);
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "POScanner.view.AllocationList",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function(oDialog) {
				oDialog.open();
				this.getView().byId("allocationList").bindItems({
					path: "localModel>/ALLOCATIONSet",
					template: new sap.m.ObjectListItem({
						title: "{localModel>Store}",
						number: "{localModel>ActAlloc}"
					})
				});
			}.bind(this));
		},
		handlePressOK: function() {
			this._pDialog.then(function(oDialog) {
				oDialog.close();
			}.bind(this));
		}
	});
});