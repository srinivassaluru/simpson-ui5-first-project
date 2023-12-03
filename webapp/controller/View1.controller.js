sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/controls/common/feeds/FeedItem',
	'sap/viz/ui5/data/FlattenedDataset',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'./InitPage',
	"DynamicChart/model/SmartDateModel",
	"sap/ui/core/date/UI5Date"
], function(Controller, BindingMode, JSONModel, FeedItem, FlattenedDataset, ChartFormatter,
	Format, InitPageUtil, SmartDateModel, UI5Date) {
	"use strict";
	var controller, dateModel;

	function resetVizFrameFeedings(newFeeds, feedsUid) {
		var feeds = this.oVizFrame.getFeeds();
		for (var i = 0; i < feeds.length; i++) {
			if (feeds[i].getUid() === feedsUid) {
				var axisFeed = feeds[i];
				this.oVizFrame.removeFeed(axisFeed);
				axisFeed.setValues(newFeeds);
				this.oVizFrame.addFeed(axisFeed);
				break;
			}
		}
	}
	return Controller.extend("DynamicChart.controller.View1", {
		dataPath: "./controller",
		settingsModel: {
			dataset: {
				name: "Dataset",
				defaultSelected: 1,
				values: [{
					name: "Small",
					value: "/betterSmall.json"
				}, {
					name: "Medium",
					value: "/betterMedium.json"
				}, {
					name: "Large",
					value: "/betterLarge.json"
				}]
			},
			series: {
				name: "Series",
				defaultSelected: 1,
				enabled: false,
				values: [{
					name: "1 Series",
					value: ["Revenue"]
				}, {
					name: '2 Series',
					value: ["Revenue", "Cost"]
				}]
			},
			dataLabel: {
				name: "Value Label",
				defaultState: true
			},
			axisTitle: {
				name: "Axis Title",
				defaultState: true
			},
			chartType: {
				name: "Chart Type",
				defaultSelected: 0,
				values: [{
					name: "Column + Line",
					vizType: "combination",
					value: ["Revenue", "Cost"]
				}, {
					name: 'Stacked Column + Line',
					vizType: "stacked_combination",
					value: ["Revenue", "Cost2", "Cost1"]
				}]
			},
			dimensions: {
				Small: [{
					name: 'Seasons',
					value: "{Seasons}"
				}],
				Medium: [{
					name: 'Week',
					value: "{Week}"
				}],
				Large: [{
					name: 'Week',
					value: "{Week}"
				}]
			},
			measures: [{
				name: 'Cost',
				value: '{Cost}'
			}, {
				name: 'Cost1',
				value: '{Cost1}'
			}, {
				name: 'Cost2',
				value: '{Cost2}'
			}, {
				name: 'Revenue',
				value: '{Revenue}'
			}]
		},
		oVizFrame: null,
		datasetRadioGroup: null,
		onInit: function(evt) {
			controller = this;
			var oModel = new JSONModel();
			oModel.setData({
				valueDP2: UI5Date.getInstance(2023, 11, 28)
			});
			this.getView().setModel(oModel);
			// TBD
			this.FIORI_ROUNDOFF_ZEROS = "__UI5__ROUNDOFF";
			Format.numericFormatter(ChartFormatter.getInstance());
			var formatPattern = ChartFormatter.DefaultPattern; // set explored app's demo model on this sample

			// var oVizFrame1 = this.getView().byId("idVizFrame1");

		},
		displayVizFrameDataPlanned: function() {
			var oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					}
				},
				valueAxis: {
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					text: "Actual Data",
					visible: true
				}
			});
			var dataModel = new JSONModel(this.dataPath + "/betterMedium.json");
			oVizFrame.setModel(dataModel);
		},
		displayVizFrameDataActual: function() {
			var oVizFrame1 = this.getView().byId("idVizFrame1");
			oVizFrame1.setVizProperties({
				plotArea: {
					dataLabel: {
						// formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					},
					dataShape: {
						primaryAxis: ["line", "bar", "bar"]
					}
				},
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					text: "Planned Data",
					visible: true
				}
			});
			var dataModel = new JSONModel(this.dataPath + "/betterMedium.json");
			this.getView().byId("idVizFrameTable").setModel(dataModel);
			oVizFrame1.setModel(dataModel);
		},
		displayVizFrameDataDespatch: function() {
			var oVizFrame2 = this.getView().byId("idVizFrame2");
			oVizFrame2.setVizProperties({
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				plotArea: {
					dataLabel: {
						visible: true
					}
				},
				title: {
					text: "Despatch Data",
					visible: true
				}
			});
			var dataModel = new JSONModel(this.dataPath + "/medium.json");
			oVizFrame2.setModel(dataModel);
		},
		displayVizFrameDataSemifinished: function() {
			var oVizFrame3 = this.getView().byId("idVizFrame3");

			oVizFrame3.setVizProperties({
				plotArea: {
					dataLabel: {
						// formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true,
						showTotal: false
					}
				},
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				valueAxis2: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: 'Semifinished Data'
				}
			});
			var dataModel3 = new JSONModel(this.dataPath + "/betterMedium1.json");
			oVizFrame3.setModel(dataModel3);
		},
		displayVizFrameStockData: function() {
			var oVizFrameStock = this.getView().byId("idVizFrameStock");
			oVizFrameStock.setVizProperties({
				plotArea: {
					dataLabel: {
						// formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					},
					dataShape: {
						primaryAxis: ["line", "bar", "bar"]
					}
				},
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					text: "StockWise Data",
					visible: true
				}
			});
			var dataModel = new JSONModel(this.dataPath + "/betterMedium.json");
			oVizFrameStock.setModel(dataModel);
		},
		handleCatChange: function(oEvent) {
			var key = oEvent.getSource().getSelectedKey();
			if (key !== "Plan") {
				this.getView().byId("idVizFrame1").setVisible(true);
				this.getView().byId("chartFixFlex").setVisible(false);
			} else {
				this.getView().byId("idVizFrame1").setVisible(false);
				this.getView().byId("chartFixFlex").setVisible(true);
			}
		},
		handleSelectData: function(oEvent) {
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					axis: 1,
					name: 'Store Name',
					value: "{Store Name}"
				}],
				measures: [{
					name: 'Revenue',
					value: '{Revenue}'
				}],
				data: {
					path: "/milk"
				}
			});

			var legendPosition = new sap.viz.ui5.types.Legend({
				layout: {
					position: "left"
				}
			});
			var stackedColumnVizChart = new sap.viz.ui5.Donut({
				width: "800px",
				height: "500px",
				dataset: oDataset,
				legendGroup: legendPosition,
				title: {
					text: "StockWise Data",
					visible: true
				},
				plotArea: {
					dataLabel: {
						visible: true
					}
				},
				valueAxis: {
					label: {
						// formatString: formatPattern.SHORTFLOAT
					},
					title: {
						visible: true
					}
				}
			});
			stackedColumnVizChart.setModel(sap.ui.getCore().getModel());
			var sValue = Math.floor((Math.random() * 100) + 1);
			// console.log(sValue);
			var oModel = new sap.ui.model.json.JSONModel({
				"milk": [{
					"Store Name": "TAFE",
					"Revenue": 428214.13,
					"Cost": 94383.52,
					"Consumption": 76855.15368
				}, {
					"Store Name": "TMTL",
					"Revenue": 1722148.36,
					"Cost": 274735.17,
					"Consumption": 310292.22
				}, {
					"Store Name": "CNH",
					"Revenue": 1331176.706884,
					"Cost": 233160.58,
					"Consumption": 143432.18
				}, {
					"Store Name": "CIL-PH",
					"Revenue": 1878466.82,
					"Cost": 235072.19,
					"Consumption": 487910.26
				}, {
					"Store Name": "CIL-CH",
					"Revenue": 3326251.94,
					"Cost": 582543.16,
					"Consumption": 267185.27
				}]
			});

			stackedColumnVizChart.setModel(oModel);

			var dlg = new sap.m.Dialog({
				title: 'In Detial',
				content: [stackedColumnVizChart],
				buttons: [
					new sap.m.Button({
						text: "cancel",
						press: function() {
							dlg.close();
						}
					})
				]
			});

			dlg.open();
			stackedColumnVizChart.invalidate();

		},
		handleSelectionMonthChange: function(oEvent) {
			var selectedKey = oEvent.getSource().getSelectedKey()+1;

			var oVizFrame = this.getView().byId("idVizFrame");
			var oVizFrame1 = this.getView().byId("idVizFrame1");
			var oVizFrame2 = this.getView().byId("idVizFrame2");
			var oVizFrame3 = this.getView().byId("idVizFrame3");
			var oVizFrameStock = this.getView().byId("idVizFrameStock");
			var selectAll = true;
			
			var displayData = [];
			var totalData = [{
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "5791",
				"Production": "5702",
				"ASSY": "2982",
				"DELY": "2689",
				"DESP": "1649",
				"Store Name": "Anna Salai"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "5494",
				"Production": "5478",
				"ASSY": "2986",
				"DELY": "2685",
				"DESP": "1630",
				"Store Name": "SEMBIAM PLANT"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "500",
				"Production": "500",
				"ASSY": "189",
				"DELY": "135",
				"DESP": "12",
				"Store Name": "KUMBAKONAM PLANT"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "426",
				"Production": "422",
				"ASSY": "102",
				"DELY": "56",
				"DESP": "19",
				"Store Name": "CUMMINS B3.3"
			}];
			if (selectAll) {
				displayData = totalData;
			} else {
				displayData = [totalData[selectedKey]];
			}
			if (oEvent.getParameters().selected) {
				var dataModel = new JSONModel({
					"milk": displayData
				});
				oVizFrame.setModel(dataModel);
				oVizFrame1.setModel(dataModel);
				oVizFrame2.setModel(dataModel);
				oVizFrame3.setModel(dataModel);
				oVizFrameStock.setModel(dataModel);
				var that = this;
				oVizFrame.getModel().attachRequestCompleted(function() {
					that.dataSort(this.getData());
				});
			}
		},
		/****
		 *   SelectionChange
		 */
		handleSelectionChange: function(oEvent) {
			var selectedKey = oEvent.getParameters().changedItem.getKey() - 0;
			var selectAll = oEvent.getParameters().selectAll;

			var oVizFrame = this.getView().byId("idVizFrame");
			var oVizFrame1 = this.getView().byId("idVizFrame1");
			var oVizFrame2 = this.getView().byId("idVizFrame2");
			var oVizFrame3 = this.getView().byId("idVizFrame3");
			var oVizFrameStock = this.getView().byId("idVizFrameStock");

			var displayData = [];
			var totalData = [{
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "5791",
				"Production": "5702",
				"ASSY": "2982",
				"DELY": "2689",
				"DESP": "1649",
				"Store Name": "Anna Salai"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "5494",
				"Production": "5478",
				"ASSY": "2986",
				"DELY": "2685",
				"DESP": "1630",
				"Store Name": "SEMBIAM PLANT"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "500",
				"Production": "500",
				"ASSY": "189",
				"DELY": "135",
				"DESP": "12",
				"Store Name": "KUMBAKONAM PLANT"
			}, {
				"Week": "November",
				"Revenue": 431000.22,
				"Cost": 230000.00,
				"Cost1": 24800.63,
				"Cost2": 205199.37,
				"Cost3": 199999.37,
				"Target": 500000.00,
				"Budget": 210000.00,
				"Sales": "426",
				"Production": "422",
				"ASSY": "102",
				"DELY": "56",
				"DESP": "19",
				"Store Name": "CUMMINS B3.3"
			}];
			if (selectAll) {
				displayData = totalData;
			} else {
				displayData = [totalData[selectedKey]];
			}
			if (oEvent.getParameters().selected) {
				var dataModel = new JSONModel({
					"milk": displayData
				});
				oVizFrame.setModel(dataModel);
				oVizFrame1.setModel(dataModel);
				oVizFrame2.setModel(dataModel);
				oVizFrame3.setModel(dataModel);
				oVizFrameStock.setModel(dataModel);
				var that = this;
				oVizFrame.getModel().attachRequestCompleted(function() {
					that.dataSort(this.getData());
				});
			}
		},
		dataSort: function(dataset) {
			//let data sorted by revenue
			if (dataset && dataset.hasOwnProperty("milk")) {
				var arr = dataset.milk;
				arr = arr.sort(function(a, b) {
					return b.Sales - a.Sales;
				});
			}
		},
		onAfterRendering: function() {
			this.getView().setBusy(true);
			this.displayVizFrameDataPlanned();
			this.displayVizFrameDataActual();
			this.displayVizFrameDataDespatch();
			this.displayVizFrameDataSemifinished();
			this.displayVizFrameStockData();
			this.getView().setBusy(false);
		},
		onDatasetSelected: function(oEvent) {
			if (!oEvent.getParameters().selected) {
				return;
			}
			var datasetRadio = oEvent.getSource();
			var oVizFrame = this.getView().byId("idVizFrame");
			if (oVizFrame && datasetRadio.getSelected()) {
				var bindValue = datasetRadio.getBindingContext().getObject();
				var dataset = {
					data: {
						path: "/milk"
					}
				};
				var dim = this.settingsModel.dimensions[bindValue.name];
				dataset.dimensions = dim;
				dataset.measures = this.settingsModel.measures;
				var oDataset = new FlattenedDataset(dataset);
				this.oVizFrame.setDataset(oDataset);

				var dataModel = new JSONModel(this.dataPath + bindValue.value);
				oVizFrame.setModel(dataModel);

				var feeds = this.oVizFrame.getFeeds();
				for (var i = 0; i < feeds.length; i++) {
					if (feeds[i].getUid() === "categoryAxis") {
						var categoryAxisFeed = feeds[i];
						this.oVizFrame.removeFeed(categoryAxisFeed);
						var feed = [];
						for (var i = 0; i < dim.length; i++) {
							feed.push(dim[i].name);
						}
						categoryAxisFeed.setValues(feed);
						oVizFrame.addFeed(categoryAxisFeed);
						break;
					}
				}
			}
		},
		onDataLabelChanged: function(oEvent) {
			if (this.oVizFrame) {
				this.oVizFrame.setVizProperties({
					plotArea: {
						dataLabel: {
							visible: oEvent.getParameter('state')
						}
					}
				});
			}
		},
		onAxisTitleChanged: function(oEvent) {
			if (this.oVizFrame) {
				var state = oEvent.getParameter('state');
				this.oVizFrame.setVizProperties({
					valueAxis: {
						title: {
							visible: state
						}
					},
					categoryAxis: {
						title: {
							visible: state
						}
					}
				});
			}
		},
		onChartTypeSelected: function(oEvent) {
			if (!oEvent.getParameters().selected) {
				return;
			}
			var chartTypeRadio = oEvent.getSource();
			if (this.oVizFrame && chartTypeRadio.getSelected()) {
				var bindValue = chartTypeRadio.getBindingContext().getObject();
				this.oVizFrame.setVizType(bindValue.vizType);
				var selectedDataset = this.settingsModel.dataset.values[this.datasetRadioGroup.getSelectedIndex()];
				var dataModel = new JSONModel(this.dataPath + selectedDataset.value);
				this.oVizFrame.setModel(dataModel);
				this.oVizFrame.removeAllFeeds();
				var dim = this.settingsModel.dimensions[selectedDataset.name];
				var feed = [];
				for (var i = 0; i < dim.length; i++) {
					feed.push(dim[i].name);
				}
				var feedValueAxis = new FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': bindValue.value
				});
				var feedCategoryAxis = new FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': feed
				});
				this.oVizFrame.addFeed(feedValueAxis);
				this.oVizFrame.addFeed(feedCategoryAxis);
			}
		},
		handleRouteMatched: function(oEvent) {
			if (oEvent.getParameter("name") === "RouteMain") {
				// In the event of the base route, check if the Company parameter has
				// been passed to the application
				var companyParam = models.value(controller, "getOwnerComponent.getComponentData.startupParameters.Company.0");
				if (companyParam) {
					controller.getRouter().navTo("RouteCompanyMain", {
						company: companyParam
					}, {}, true);

					return;
				}
			}

			//Load company from naviagtion nparameter
			var perspectiveParam = models.value(controller, "getOwnerComponent.getComponentData.startupParameters.Perspective.0");
			controller.company = oEvent.getParameter("arguments").company || "";
			controller.perspective = perspectiveParam || "MONTH";

			//Setup model for UI states
			controller.getView().setModel(new JSONModel({
				SelectedView: "chart-table-view",
				SelectedPerspective: controller.perspective,
				Company: controller.company,
				SelectedOriginRamps: [],
				SelectedDestinationRamps: [],
				SelectedCustomerLocation: [],
				SelectedEquipment: [],
				SelectedOrgDest: "Destination",
				SelectedSpotLive: "L",
				SelectedCharges: [],
				enableDay: false
			}), "DataModel");

			controller.reloadData();

			controller.setAllDropDownFilterBinding();
			// Disabling the ByDAY 
			controller.disableByDAY();
		},
		reloadData: function() {
			controller.disableByDAY();
			var selectedKey = controller.getView().getModel("DataModel").getProperty("/SelectedPerspective");
			// testing for BYDay

			controller.loadData(selectedKey).then(function(data) {
				if (dateModel.getProperty("/SelectedMonths").length === 0 && dateModel.getProperty("/SelectedWeek") === "All") {
					//"Enhance" time series only if there is date specifix filter
					//SmartDateModel.enhanceDataSeries(data, selectedKey);
				}
				controller.getView().setModel(new JSONModel(data), "hanaData");

				// selectedKey = controller.getView().getModel("DataModel").getProperty("/SelectedPerspective");
				controller.getChartDetailedProperties(selectedKey);
			});
		},
		//Returns Promiuse which is fulfiled once data is loaded and payload returned as then function parameter 
		loadData: function(key) {
			var urlParameters = {};

			if (key === "MONTH_AND_DAY") {

				key = "MONTH,DATE_NO," + key;
			}
			if (key === "DAY") {
				key = "DAY_DESC," + key;
			}
			urlParameters = {
				"$select": key + ",AVERAGE_DWT_MINS,DWT_GT90,DWT_LT90,DRIVER_WAIT_TIME_MINS"
			};

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: controller.getFilters(),
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadCustomerLocation: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL,DRIVER_WAIT_TIME",
				"$orderby": "STOP_CSTMR_NAME"
			};
			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/CustomerLocationSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadDestinationRamp: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "DEST_RAMP_DESC,DRIVER_WAIT_TIME",
				"$orderby": "DEST_RAMP_DESC"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/DestinationRampSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadOriginRamp: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "ORIG_RAMP_DESC,DRIVER_WAIT_TIME",
				"$orderby": "ORIG_RAMP_DESC"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/OriginRampSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadEquipmentType: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "EQPT_USED,EQPT_DESCRIPTION,DRIVER_WAIT_TIME",
				"$orderby": "EQPT_USED,EQPT_DESCRIPTION"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/EquipmentSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadOriginDestination: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "ORG_DEST,DRIVER_WAIT_TIME",
				"$orderby": "ORG_DEST desc"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadSpotLive: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "STOP_SPOTLIVE,DRIVER_WAIT_TIME"
			};
			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/LiveSpotSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		loadCharges: function() {
			var urlParameters = {};
			urlParameters = {
				"$select": "CHARGES,DRIVER_WAIT_TIME"
			};
			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/ChargesSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		//Loads filters from filter bars controls
		getFilters: function() {
			var DataModel = controller.getView().getModel("DataModel");

			var aFilters = FilterUtil.prepareFilters({
				YEAR: dateModel.getProperty("/SelectedYear"),
				MONTH: dateModel.getProperty("/SelectedMonths"),
				WEEK: dateModel.getProperty("/SelectedWeek"),
				DAY: dateModel.getProperty("/SelectedDay"),
				/*STOP_CSTMR_NAME: controller.byId("CustomerLocationId").getValue() ? controller.byId("CustomerLocationId").getValue().split(
					",") : [],*/
				STOP_CSTMR_NAME: DataModel.getProperty("/SelectedCustomerLocation"),
				ORIG_RAMP_DESC: DataModel.getProperty("/SelectedOriginRamps"),
				DEST_RAMP_DESC: DataModel.getProperty("/SelectedDestinationRamps"),
				EQPT_USED: DataModel.getProperty("/SelectedEquipment"),
				STOP_SPOTLIVE: DataModel.getProperty("/SelectedSpotLive"),
				ORG_DEST: DataModel.getProperty("/SelectedOrgDest"),
				CHARGES: DataModel.getProperty("/SelectedCharges")

			});
			//controller.addCustomerLocationFilter(aFilters);
			controller.addCompanyFilter(aFilters);

			return aFilters;
		},
		//Adds company filter to the array
		addCompanyFilter: function(aFilters) {
			if (controller.company) {
				/*aFilters.push(new Filter({
					filters: [
						new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company)
						//new Filter("BUSINESSPARTNERIDOUT", FilterOperator.EQ, controller.company)
					]
				}, false));*/

				aFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));

			}
		},
		addCustomerLocationFilter: function(aFilters) {
			var selectedData = controller.getView().getModel("DataModel").getProperty("/SelectedCustomerLocation");
			var nFilters = [];
			var andFilter = new Filter();
			var orFilter = new Filter();

			var orArray = [];
			var andArr = [];
			if (selectedData) {
				selectedData.map(function(item) {
					nFilters.push(new Filter("STOP_CSTMR_NAME", FilterOperator.EQ, item.custName));
					nFilters.push(new Filter("STOP_CITY", FilterOperator.EQ, item.custCity));
					nFilters.push(new Filter("STOP_PROV", FilterOperator.EQ, item.custProv));
					nFilters.push(new Filter("STOP_POSTAL", FilterOperator.EQ, item.custPost));
					andArr.push(new Filter({
						filters: nFilters,
						and: true
					}));
					aFilters.concat(andArr);
					nFilters = [];
					andArr = [];
				});

			}
		},
		setAllDropDownFilterBinding: function() {

			controller.loadCustomerLocation().then(function(results) {

				controller.getView().setModel(new JSONModel(results), "custLocationModel");

			});

			controller.loadDestinationRamp().then(function(results) {

				controller.getView().setModel(new JSONModel(results), "destinationModel");

			});

			controller.loadEquipmentType().then(function(results) {

				controller.getView().setModel(new JSONModel(results), "equipmentModel");

			});

			controller.loadOriginRamp().then(function(results) {

				controller.getView().setModel(new JSONModel(results), "originModel");

			});

			controller.loadOriginDestination().then(function(results) {

				controller.getView().setModel(new JSONModel(results), "originDestinationModel");

			});

			controller.loadSpotLive().then(function(results) {

				controller.getView().setModel(new JSONModel(results.map(function(item) {

					if (item.STOP_SPOTLIVE === "S") {

						item.New_STOP_SPOTLIVE = "Spot";
					} else {
						item.New_STOP_SPOTLIVE = "Live";
					}

					return item;
				})), "spotLiveModel");

			});

			controller.loadCharges().then(function(results) {

				controller.getView().setModel(new JSONModel(results.filter(function(item) {
					return item.CHARGES;
				})), "chargesModel");

			});

		},
		//Loads data from donut chart based on bar selection
		getData: function(oEvent) {
			var key = controller.getView().getModel("DataModel").getProperty("/SelectedPerspective");

			var urlParameters = {};
			var aFilters = controller.getFilters();

			var select = key + ",AVERAGE_DWT_MINS,STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL";

			if (key === "QUARTER") {
				var editQuarter = (oEvent.getParameter("data")[0].data.Quarter).split(":");

				aFilters.push(new Filter(key, FilterOperator.EQ, editQuarter[0].replace(/ /g, "")));
			} else if (key === "MONTH") {
				aFilters.push(new Filter("MONTH_DESC", FilterOperator.EQ, ((oEvent.getParameter("data")[0].data.Month).toUpperCase())));
			} else if (key === "WEEK") {
				aFilters.push(new Filter(key, FilterOperator.EQ, ((oEvent.getParameter("data")[0].data.Week))));
			} else if (key === "DAY") {
				aFilters.push(new Filter("DAY_DESC", FilterOperator.EQ, ((oEvent.getParameter("data")[0].data["Day of Week"]))));
			} else if (key === "MONTH_AND_DAY") {
				key = "MONTH,DATE_NO," + key;
				select = key + ",AVERAGE_DWT_MINS,STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL";
				aFilters.push(new Filter("MONTH_AND_DAY", FilterOperator.EQ, (oEvent.getParameter("data")[0].data.Day)));
			}

			urlParameters = {
				"$select": select,
				"$orderby": "AVERAGE_DWT_MINS desc",
				"$top": 5
			};

			return new Promise(function(resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: aFilters,
					urlParameters: urlParameters,
					success: function(oData) {
						resolve(oData.results);
					}
				});
			});
		},
		//Display popover with chart
		showTopFiveCustomer: function(oEvent) {
			//var measureNames = oEvent.getParameter("data")[0].data.measureNames;

			var label = new sap.m.Label({

				text: "{listData>STOP_CSTMR_NAME}"
			});
			var label1 = new sap.m.Label({
				text: "{listData>STOP_CITY},{listData>STOP_PROV},{listData>STOP_POSTAL}"
			});
			var label2 = new sap.m.Label({
				text: "{listData>AVERAGE_DWT_MINS} Mins"
			});

			var progressIndicator = new sap.m.ProgressIndicator({
				class: "sapUiLargeMarginEnd",
				percentValue: "{listData>percentValue}",
				width: "27rem",
				state: {
					path: 'listData>AVERAGE_DWT_MINS',
					formatter: controller.getProgressIndicatorStatus
				}

			});

			var hBox1 = new sap.m.HBox();
			var vBox = new sap.m.VBox();
			var vBoxPI = new sap.m.VBox();
			vBoxPI.addStyleClass("progressIndicator");

			var vBoxL2 = new sap.m.VBox();
			vBoxL2.addStyleClass("label_margin");

			var hBox = new sap.m.HBox();

			vBoxPI.addItem(progressIndicator);
			vBoxL2.addItem(label2);

			hBox.addItem(vBoxPI);
			hBox.addItem(vBoxL2);

			vBox.addItem(label);
			vBox.addItem(label1);
			vBox.addItem(hBox);
			hBox1.addItem(vBox);

			var list = new sap.m.List();

			var customListItem = new sap.m.CustomListItem();
			customListItem.addContent(hBox1);

			list.bindAggregation("items", {

				path: "listData>/",
				template: customListItem,
				templateShareable: false
			});

			var verticalLayout = new sap.ui.layout.VerticalLayout();

			verticalLayout.addContent(list);

			var popover = new Popover({
				customDataControl: function() {

					return verticalLayout.addStyleClass("margin_list");
				}
			});

			var vizchart = controller.byId("idVizFrame");

			popover.connect(vizchart.getVizUid());

			popover.setBusy(true);

			controller.getData(oEvent).then(function(data) {
				var addedPercent = controller.calculatePercentLevel(data);
				list.setModel(new JSONModel(addedPercent), "listData");
				popover._Popover._oCustomHeader.setTitle("Driver Wait Time");
				popover._Popover._oPopover.setContentWidth("36rem");
				popover.setBusy(false);
			});
		},
		calculatePercentLevel: function(data) {
			var highestNumber, getData;

			/*	highestNumber = data.reduce(function (total, item) {

					return (item.AVERAGE_DWT_MINS > total) ? item.AVERAGE_DWT_MINS : total;

				}, data[0].AVERAGE_DWT_MINS);*/

			highestNumber = data[0].AVERAGE_DWT_MINS;

			getData = data.map(function(item) {

				item.percentValue = Math.round((item.AVERAGE_DWT_MINS / highestNumber) * 100);

				return item;
			});

			return getData;
		},
		getProgressIndicatorStatus: function(avgTime) {

			if (avgTime > 180) {

				return "Error";
			} else if (avgTime <= 180 && avgTime > 90) {
				return "Warning";
			} else if (avgTime > 0 && avgTime <= 90) {
				return "Success";
			} else {
				return "Error";
			}

		},
		//Populate chart properties, deminasions and measures
		getChartDetailedProperties: function(key) {
			var oVizFrame = this.byId("idVizFrame");

			oVizFrame.setVizType("dual_stacked_combination");

			oVizFrame.destroyDataset();
			oVizFrame.removeAllFeeds();

			oVizFrame.setVizProperties({
				interaction: {
					selectability: {
						mode: "SINGLE"
					}
				},
				plotArea: {
					dataShape: {
						primaryAxis: ['line'],
						secondaryAxis: ['bar', 'bar']
					},
					line: {
						visible: true,
						width: 1,
						marker: {
							shape: 'circle',
							size: 6
						}
					},
					dataPointSize: {
						min: true
					},
					dataPointStyle: {
						rules: [{
							properties: {
								color: "#00171F",
								lineColor: "#00171F",
								lineType: "solid",
								pattern: "solid"
							},
							displayName: this.bundle.getText("tableDWT_Average")
						}, {
							dataContext: {
								DriverLT90: "*"
							},
							properties: {
								color: "#427CAC"
							},
							displayName: this.bundle.getText("tableDWT_ShipmentLessThan90")
						}, {
							dataContext: {
								DriverGT90: "*"
							},
							properties: {
								color: "#ADC6DF"
							},
							displayName: this.bundle.getText("tableDWT_ShipmentMoreThan90")
						}]

					}
				},
				legendGroup: {
					layout: {
						position: 'bottom'
					}
				},
				valueAxis: {
					title: {
						visible: true,
						text: this.bundle.getText("chartvalueAxis")
					},
					color: '#999999'
				},
				valueAxis2: {
					label: {
						formatString: this.FIORI_ROUNDOFF_ZEROS
					},
					title: {
						visible: true,
						text: this.bundle.getText("chartvalueAxis2")
					},
					color: '#999999'
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: false,
					text: "Driver Wait Time",
					style: {
						color: '#ff0000'
					}
				}
			});

			var dataset = new sap.viz.ui5.data.FlattenedDataset({
				data: "{hanaData>/}",
				measures: [{
					name: "DriverLT90",
					value: '{hanaData>DWT_LT90}'
				}, {
					name: 'DriverGT90',
					value: '{hanaData>DWT_GT90}'
				}, {
					name: 'AverageDriverWaitTime',
					value: '{hanaData>AVERAGE_DWT_MINS}'
				}]
			});

			var dimension;
			var key1;

			//Different dimensions for different perspectives
			if (key === "QUARTER") {
				dimension = new sap.viz.ui5.data.DimensionDefinition({
					name: this.bundle.getText("tableTTT-Quarter"),
					value: {
						path: 'hanaData>QUARTER',
						formatter: controller.getQuarterNames
					}
				});
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					uid: "categoryAxis",
					type: "Dimension",
					values: [this.bundle.getText("tableTTT-Quarter")]
				}));

				key1 = key;
			} else if (key === "MONTH") {
				dimension = new sap.viz.ui5.data.DimensionDefinition({
					name: this.bundle.getText("tableTTT-Month"),
					value: {
						path: 'hanaData>MONTH',
						formatter: controller.getMonthText
					}
				});
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					uid: "categoryAxis",
					type: "Dimension",
					values: [this.bundle.getText("tableTTT-Month")]
				}));

				key1 = key;
			} else if (key === "WEEK") {
				dimension = new sap.viz.ui5.data.DimensionDefinition({
					name: this.bundle.getText("tableTTT-Week"),
					value: "{hanaData>WEEK}"
				});
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					uid: "categoryAxis",
					type: "Dimension",
					values: [this.bundle.getText("tableTTT-Week")]
				}));
				key1 = key;
			} else if (key === "DAY") {
				dimension = new sap.viz.ui5.data.DimensionDefinition({
					name: this.bundle.getText("tableTTT-Dayofweek"),
					value: {
						path: 'hanaData>DAY_DESC',
						//	formatter: controller.getDayOfWeekText
					}

				});
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					uid: "categoryAxis",
					type: "Dimension",
					values: [this.bundle.getText("tableTTT-Dayofweek")]
				}));
				key1 = key;
			} else if (key === "MONTH_AND_DAY") {
				dimension = new sap.viz.ui5.data.DimensionDefinition({
					name: this.bundle.getText("tableTTT-Day"),
					value: {
						path: 'hanaData>MONTH_AND_DAY'
							//formatter: controller.getDayOfWeekText
					}

				});
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					uid: "categoryAxis",
					type: "Dimension",
					values: [this.bundle.getText("tableTTT-Day")]
				}));
				key1 = key;
			}

			dataset.addDimension(dimension);

			dataset.bindAggregation("data", {
				path: "/",
				model: "hanaData",
				template: controller.byId("idVizFrame"),
				templateShareable: true

			});

			oVizFrame.setDataset(dataset);

			this.valueAxisFeed = this.byId('valueAxisFeed');
			this.valueAxisFeed2 = this.byId('valueAxisFeed2');

			oVizFrame.addFeed(this.valueAxisFeed);
			oVizFrame.addFeed(this.valueAxisFeed2);
		},
		getDayOfWeekText: function(dayNumber) {
			return Formatter.getDayOfWeekText(dayNumber);
		},

		getMonthText: function(monthNumber) {
			return Formatter.getMonthText(monthNumber);
		},

		getWeekText: function(weekNumber) {
			return weekNumber ? SmartDateModel.getWeekText(weekNumber, dateModel.getProperty("/SelectedYear")) : "";
		},

		getPerspectvieText: function(selectedPerspective) {
			return Formatter.getPerspectvieText(selectedPerspective);
		},

		getCustomerLocationText: function(cust, city, prov, postal) {
			return Formatter.getCustomerLocationText(cust, city, prov, postal);
		},

		getEquipmentText: function(type, desc) {
			return Formatter.getEquipmentText(type, desc);
		},

		onDownload: function() {
			ExcelUtil.exportToExcel(controller.byId("ResultTable"), controller);
		},

		formatNumber: function(value) {
			return NumberFormat.getIntegerInstance({
				groupingEnabled: true
			}).format(value);
		},

		getQuarterNames: function(value) {

			if (value === "Q1") {
				return "Q1 : Jan-Mar";
			} else if (value === "Q2") {
				return "Q2 : Apr-Jun";
			} else if (value === "Q3") {
				return "Q3 : Jul-Sep";
			} else if (value === "Q4") {
				return "Q4 : Oct-Dec";
			}

		},

		getroundOffMinutes: function(value) {
			var roundOff = parseInt(Math.round(value), 10);
			return roundOff.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		onReset: function() {
			var dataModel = controller.getView().getModel("DataModel");
			controller.byId("Year").setSelectedKey(new Date().getFullYear());
			controller.byId("Month").setSelectedKeys([]);
			controller.byId("Week").setSelectedKeys([]);
			controller.byId("Day").setSelectedKeys([]);
			dataModel.setProperty("/SelectedOriginRamps", []);
			dataModel.setProperty("/SelectedDestinationRamps", []);
			dataModel.setProperty("/SelectedCustomerLocation", []);
			dataModel.setProperty("/SelectedEquipment", []);
			dataModel.setProperty("/SelectedOrgDest", "Destination");
			dataModel.setProperty("/SelectedSpotLive", "L");
			dataModel.setProperty("/SelectedCharges", "");
			// test
			dataModel.setProperty("/enableDay", true);
			controller.byId("CustomerLocationId").setValue("");
			//dataModel.setProperty("/SelectedPerspective", "MONTH");
			controller.reloadData();
			// testing for BILLTOBP filter in dropdowns
			controller.setAllDropDownFilterBinding();
			//controller.byId("CustomerLocationId").setTokens([]);

		}
	});
});