sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"cp/c360DriverWaitTime/model/FilterUtil",
	"sap/suite/ui/commons/ChartContainer",
	"sap/suite/ui/commons/ChartContainerContent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"cp/c360DriverWaitTime/model/SmartDateModel",
	"cp/c360DriverWaitTime/model/Formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/ListItem",
	"sap/ui/core/Item",
	"cp/c360DriverWaitTime/model/ExcelUtil",
	"cp/c360DriverWaitTime/model/models",
	"sap/viz/ui5/controls/Popover",
	"sap/viz/ui5/controls/VizFrame",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/viz/ui5/data/DimensionDefinition",
	"sap/ui/core/format/NumberFormat",
		"sap/viz/ui5/format/ChartFormatter"
], function (Controller, FilterUtil, ChartContainer, ChartContainerContent, JSONModel, Fragment, SmartDateModel, Formatter, Filter,
	FilterOperator, ListItem, Item, ExcelUtil, models, Popover, VizFrame, FlattenedDataset, FeedItem, DimensionDefinition, NumberFormat,ChartFormatter) {

	"use strict";

	var controller, dateModel;

	//var USER = "V151592"; //"U530788" "V151592" "@User@"  {User}
	var USER = "V151595";

	return Controller.extend("cp.c360DriverWaitTime.controller.Main", {

		onInit: function () {
			controller = this;

			dateModel = SmartDateModel.init(controller);

			controller.bundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.getRouter().attachRouteMatched(this.handleRouteMatched, this);
				// testing for the valueaxis custom-formatter starts
			// TBD
			this.FIORI_ROUNDOFF_ZEROS = "__UI5__ROUNDOFF";
			 var chartFormatter = ChartFormatter.getInstance();
              chartFormatter.registerCustomFormatter(this.FIORI_ROUNDOFF_ZEROS, function(value) {
                  return controller.getroundOffMinutes(value);
              });
               //apply
              sap.viz.api.env.Format.numericFormatter(chartFormatter);
              
            // Testing ends here.
		},

		handleRouteMatched: function (oEvent) {
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

		reloadData: function () {
			controller.disableByDAY();
			var selectedKey = controller.getView().getModel("DataModel").getProperty("/SelectedPerspective");
			// testing for BYDay

			controller.loadData(selectedKey).then(function (data) {
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
		loadData: function (key) {
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

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: controller.getFilters(),
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadCustomerLocation: function () {
			var urlParameters = {};
			urlParameters = {
				"$select": "STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL,DRIVER_WAIT_TIME",
				"$orderby": "STOP_CSTMR_NAME"
			};
			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/CustomerLocationSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadDestinationRamp: function () {
			var urlParameters = {};
			urlParameters = {
				"$select": "DEST_RAMP_DESC,DRIVER_WAIT_TIME",
				"$orderby": "DEST_RAMP_DESC"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/DestinationRampSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadOriginRamp: function () {

			var urlParameters = {};
			urlParameters = {
				"$select": "ORIG_RAMP_DESC,DRIVER_WAIT_TIME",
				"$orderby": "ORIG_RAMP_DESC"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/OriginRampSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadEquipmentType: function () {

			var urlParameters = {};
			urlParameters = {
				"$select": "EQPT_USED,EQPT_DESCRIPTION,DRIVER_WAIT_TIME",
				"$orderby": "EQPT_USED,EQPT_DESCRIPTION"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/EquipmentSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadOriginDestination: function () {
			var urlParameters = {};

			urlParameters = {
				"$select": "ORG_DEST,DRIVER_WAIT_TIME",
				"$orderby": "ORG_DEST desc"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadSpotLive: function () {
			var urlParameters = {};

			urlParameters = {
				"$select": "STOP_SPOTLIVE,DRIVER_WAIT_TIME"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/LiveSpotSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		loadCharges: function () {

			var urlParameters = {};

			urlParameters = {
				"$select": "CHARGES,DRIVER_WAIT_TIME"
			};

			var dFilters = FilterUtil.prepareFilters({});
			if (controller.company) {
				dFilters.push(new Filter("BILL_TO_BP", FilterOperator.EQ, controller.company));
			}

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/ChargesSetParameters(UserID='" + USER + "')/Results", {
					filters: dFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		//Loads filters from filter bars controls
		getFilters: function () {
			var DataModel = controller.getView().getModel("DataModel");

			var aFilters = FilterUtil.prepareFilters({
				YEAR: dateModel.getProperty("/SelectedYear"),
				MONTH: dateModel.getProperty("/SelectedMonths"),
				WEEK: dateModel.getProperty("/SelectedWeek"),
				DAY: dateModel.getProperty("/SelectedDay"),
				/*STOP_CSTMR_NAME: controller.byId("CustomerLocationId").getValue() ? controller.byId("CustomerLocationId").getValue().split(
					",") : [],*/
				STOP_CSTMR_NAME:DataModel.getProperty("/SelectedCustomerLocation"),
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
		addCompanyFilter: function (aFilters) {
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

		addCustomerLocationFilter: function (aFilters) {
			var selectedData = controller.getView().getModel("DataModel").getProperty("/SelectedCustomerLocation");
			var nFilters = [];
			var andFilter = new Filter();
			var orFilter = new Filter();

			var orArray = [];
			var andArr = [];
			if (selectedData) {
				selectedData.map(function (item) {
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

		setAllDropDownFilterBinding: function () {

			controller.loadCustomerLocation().then(function (results) {

				controller.getView().setModel(new JSONModel(results), "custLocationModel");

			});

			controller.loadDestinationRamp().then(function (results) {

				controller.getView().setModel(new JSONModel(results), "destinationModel");

			});

			controller.loadEquipmentType().then(function (results) {

				controller.getView().setModel(new JSONModel(results), "equipmentModel");

			});

			controller.loadOriginRamp().then(function (results) {

				controller.getView().setModel(new JSONModel(results), "originModel");

			});

			controller.loadOriginDestination().then(function (results) {

				controller.getView().setModel(new JSONModel(results), "originDestinationModel");

			});

			controller.loadSpotLive().then(function (results) {

				controller.getView().setModel(new JSONModel(results.map(function (item) {

					if (item.STOP_SPOTLIVE === "S") {

						item.New_STOP_SPOTLIVE = "Spot";
					} else {
						item.New_STOP_SPOTLIVE = "Live";
					}

					return item;
				})), "spotLiveModel");

			});

			controller.loadCharges().then(function (results) {

				controller.getView().setModel(new JSONModel(results.filter(function (item) {
					return item.CHARGES;
				})), "chargesModel");

			});

		},

		//Loads data from donut chart based on bar selection

		getData: function (oEvent) {
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

			return new Promise(function (resolve, reject) {
				controller.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID=" + "'V151595'" + ")/Results", {
					filters: aFilters,
					urlParameters: urlParameters,
					success: function (oData) {
						resolve(oData.results);
					}
				});
			});
		},

		//Display popover with chart
		showTopFiveCustomer: function (oEvent) {
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
				customDataControl: function () {

					return verticalLayout.addStyleClass("margin_list");
				}
			});

			var vizchart = controller.byId("idVizFrame");

			popover.connect(vizchart.getVizUid());

			popover.setBusy(true);

			controller.getData(oEvent).then(function (data) {
				var addedPercent = controller.calculatePercentLevel(data);
				list.setModel(new JSONModel(addedPercent), "listData");
				popover._Popover._oCustomHeader.setTitle("Driver Wait Time");
				popover._Popover._oPopover.setContentWidth("36rem");
				popover.setBusy(false);
			});
		},

		calculatePercentLevel: function (data) {

			var highestNumber, getData;

			/*	highestNumber = data.reduce(function (total, item) {

					return (item.AVERAGE_DWT_MINS > total) ? item.AVERAGE_DWT_MINS : total;

				}, data[0].AVERAGE_DWT_MINS);*/

			highestNumber = data[0].AVERAGE_DWT_MINS;

			getData = data.map(function (item) {

				item.percentValue = Math.round((item.AVERAGE_DWT_MINS / highestNumber) * 100);

				return item;
			});

			return getData;
		},

		getProgressIndicatorStatus: function (avgTime) {

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
		getChartDetailedProperties: function (key) {
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

		getDayOfWeekText: function (dayNumber) {
			return Formatter.getDayOfWeekText(dayNumber);
		},

		getMonthText: function (monthNumber) {
			return Formatter.getMonthText(monthNumber);
		},

		getWeekText: function (weekNumber) {
			return weekNumber ? SmartDateModel.getWeekText(weekNumber, dateModel.getProperty("/SelectedYear")) : "";
		},

		getPerspectvieText: function (selectedPerspective) {
			return Formatter.getPerspectvieText(selectedPerspective);
		},

		getCustomerLocationText: function (cust, city, prov, postal) {
			return Formatter.getCustomerLocationText(cust, city, prov, postal);
		},

		getEquipmentText: function (type, desc) {
			return Formatter.getEquipmentText(type, desc);
		},

		onDownload: function () {
			ExcelUtil.exportToExcel(controller.byId("ResultTable"), controller);
		},

		formatNumber: function (value) {
			return NumberFormat.getIntegerInstance({
				groupingEnabled: true
			}).format(value);
		},

		getQuarterNames: function (value) {

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

		getroundOffMinutes: function (value) {
			var roundOff = parseInt(Math.round(value), 10);
			return roundOff.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},

		onReset: function () {
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
			
		},

		disableByDAY: function () {
			// enableDay
			var dataModel = controller.getView().getModel("DataModel");

			var idWeek = controller.getView().byId("Week");
			var idMonth = controller.getView().byId("Month");
			var key = dataModel.getProperty("/SelectedPerspective");

			if ((idMonth.getSelectedItems().length !== 0 && idMonth.getSelectedItems().length <= 3) || (idWeek.getSelectedItems().length !== 0 &&
					idWeek.getSelectedItems().length <= 12)) {
				dataModel.setProperty("/enableDay", true);

			} else {
				dataModel.setProperty("/enableDay", false);
				if (key === "MONTH_AND_DAY" && (idMonth.getSelectedItems().length >= 4 || idWeek.getSelectedItems().length >= 12 || idMonth.getSelectedItems()
						.length === 0)) {
					dataModel.setProperty("/SelectedPerspective", "WEEK");

				}

			}

		},

		// valuehelpDialog for the CustomerLocation
		handleValueHelp: function (oEvent) {
			if (!controller.customerLocationSelectDialog) {
				controller.customerLocationSelectDialog = sap.ui.xmlfragment("cp.c360DriverWaitTime.view.fragments.CustomerLocation", controller);
				this.getView().addDependent(controller.customerLocationSelectDialog);
			}
			controller.customerLocationSelectDialog.getBinding("items").filter([]);
			controller.customerLocationSelectDialog.open();
		},
		handleCustomLocationClose: function (oEvent) {

		},
		// valuehelpDialog Search for the CustomerLocation
		handleCustomLocationSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oBinding = oEvent.getSource().getBinding("items");
			var aFilters = [];
			var filters = new sap.ui.model.Filter();
			if (sValue) {
				var cusName = new Filter("STOP_CSTMR_NAME", sap.ui.model.FilterOperator.Contains, sValue);
				var cusCity = new Filter("STOP_CITY", sap.ui.model.FilterOperator.Contains, sValue);
				var cusProv = new Filter("STOP_PROV", sap.ui.model.FilterOperator.Contains, sValue);
				var cusPost = new Filter("STOP_POSTAL", sap.ui.model.FilterOperator.Contains, sValue);
				aFilters.push(cusName);
				aFilters.push(cusCity);
				aFilters.push(cusProv);
				aFilters.push(cusPost);
				filters = new sap.ui.model.Filter(aFilters, false);
				oBinding.filter(filters);
			} else {
				oBinding.filter([]);
			}
		},

		customerLocationTokenUpdate: function (oEvent) {

		},
		// valuehelpDialog Confirm for the CustomerLocation
		handleCustomLocationConfirm: function (oEvent) {

			var delvyDataModel = controller.getView().getModel("DataModel"),
				aContexts = oEvent.getParameter("selectedContexts");

			var tempArr = [];
			var tempObj = {};

			if (aContexts && aContexts.length) {
				aContexts.forEach(function (oContext) {
					tempObj.custName = oContext.getObject().STOP_CSTMR_NAME;
					tempObj.custCity = oContext.getObject().STOP_CITY;
					tempObj.custProv = oContext.getObject().STOP_PROV;
					tempObj.custPost = oContext.getObject().STOP_POSTAL;
					tempArr.push(tempObj);
					tempObj = {};
					
					delvyDataModel.setProperty("/SelectedCustomerLocation", tempArr);
				});
			} else {
				delvyDataModel.setProperty("/SelectedCustomerLocation", []);
			}

			controller.byId("CustomerLocationId").setValue(oEvent.getParameter("selectedContexts").map(function (context) {
				return context.getObject().STOP_CSTMR_NAME;
			}).join(","));

			controller.reloadData();
		}
		/* handleCustomLocationConfirm : function (oEvent) {
			controller.byId("CustomerLocationId").setValue(oEvent.getParameter("selectedContexts").map(function (context) {
				return context.getObject().STOP_CSTMR_NAME;
			}).join(","));

			controller.reloadData();
		}*/
	});
});