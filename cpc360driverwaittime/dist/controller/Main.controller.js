sap.ui.define(["sap/ui/core/mvc/Controller","cp/c360DriverWaitTime/model/FilterUtil","sap/suite/ui/commons/ChartContainer","sap/suite/ui/commons/ChartContainerContent","sap/ui/model/json/JSONModel","sap/ui/core/Fragment","cp/c360DriverWaitTime/model/SmartDateModel","cp/c360DriverWaitTime/model/Formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/ListItem","sap/ui/core/Item","cp/c360DriverWaitTime/model/ExcelUtil","cp/c360DriverWaitTime/model/models","sap/viz/ui5/controls/Popover","sap/viz/ui5/controls/VizFrame","sap/viz/ui5/data/FlattenedDataset","sap/viz/ui5/controls/common/feeds/FeedItem","sap/viz/ui5/data/DimensionDefinition","sap/ui/core/format/NumberFormat","sap/viz/ui5/format/ChartFormatter"],function(e,t,a,r,n,i,o,s,l,u,d,c,m,p,T,g,D,S,v,P,f){"use strict";var _,h;var O="V151595";return e.extend("cp.c360DriverWaitTime.controller.Main",{onInit:function(){_=this;h=o.init(_);_.bundle=this.getOwnerComponent().getModel("i18n").getResourceBundle();this.getRouter().attachRouteMatched(this.handleRouteMatched,this);this.FIORI_ROUNDOFF_ZEROS="__UI5__ROUNDOFF";var e=f.getInstance();e.registerCustomFormatter(this.FIORI_ROUNDOFF_ZEROS,function(e){return _.getroundOffMinutes(e)});sap.viz.api.env.Format.numericFormatter(e)},handleRouteMatched:function(e){if(e.getParameter("name")==="RouteMain"){var t=p.value(_,"getOwnerComponent.getComponentData.startupParameters.Company.0");if(t){_.getRouter().navTo("RouteCompanyMain",{company:t},{},true);return}}var a=p.value(_,"getOwnerComponent.getComponentData.startupParameters.Perspective.0");_.company=e.getParameter("arguments").company||"";_.perspective=a||"MONTH";_.getView().setModel(new n({SelectedView:"chart-table-view",SelectedPerspective:_.perspective,Company:_.company,SelectedOriginRamps:[],SelectedDestinationRamps:[],SelectedCustomerLocation:[],SelectedEquipment:[],SelectedOrgDest:"Destination",SelectedSpotLive:"L",SelectedCharges:[],enableDay:false}),"DataModel");_.reloadData();_.setAllDropDownFilterBinding();_.disableByDAY()},reloadData:function(){_.disableByDAY();var e=_.getView().getModel("DataModel").getProperty("/SelectedPerspective");_.loadData(e).then(function(t){if(h.getProperty("/SelectedMonths").length===0&&h.getProperty("/SelectedWeek")==="All"){}_.getView().setModel(new n(t),"hanaData");_.getChartDetailedProperties(e)})},loadData:function(e){var t={};if(e==="MONTH_AND_DAY"){e="MONTH,DATE_NO,"+e}if(e==="DAY"){e="DAY_DESC,"+e}t={$select:e+",AVERAGE_DWT_MINS,DWT_GT90,DWT_LT90,DRIVER_WAIT_TIME_MINS"};return new Promise(function(e,a){_.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID="+"'V151595'"+")/Results",{filters:_.getFilters(),urlParameters:t,success:function(t){e(t.results)}})})},loadCustomerLocation:function(){var e={};e={$select:"STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL,DRIVER_WAIT_TIME",$orderby:"STOP_CSTMR_NAME"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/CustomerLocationSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadDestinationRamp:function(){var e={};e={$select:"DEST_RAMP_DESC,DRIVER_WAIT_TIME",$orderby:"DEST_RAMP_DESC"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/DestinationRampSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadOriginRamp:function(){var e={};e={$select:"ORIG_RAMP_DESC,DRIVER_WAIT_TIME",$orderby:"ORIG_RAMP_DESC"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/OriginRampSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadEquipmentType:function(){var e={};e={$select:"EQPT_USED,EQPT_DESCRIPTION,DRIVER_WAIT_TIME",$orderby:"EQPT_USED,EQPT_DESCRIPTION"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/EquipmentSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadOriginDestination:function(){var e={};e={$select:"ORG_DEST,DRIVER_WAIT_TIME",$orderby:"ORG_DEST desc"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID="+"'V151595'"+")/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadSpotLive:function(){var e={};e={$select:"STOP_SPOTLIVE,DRIVER_WAIT_TIME"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/LiveSpotSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},loadCharges:function(){var e={};e={$select:"CHARGES,DRIVER_WAIT_TIME"};var a=t.prepareFilters({});if(_.company){a.push(new l("BILL_TO_BP",u.EQ,_.company))}return new Promise(function(t,r){_.getView().getModel("hana").read("/ChargesSetParameters(UserID='"+O+"')/Results",{filters:a,urlParameters:e,success:function(e){t(e.results)}})})},getRouter:function(){return this.getOwnerComponent().getRouter()},getFilters:function(){var e=_.getView().getModel("DataModel");var a=t.prepareFilters({YEAR:h.getProperty("/SelectedYear"),MONTH:h.getProperty("/SelectedMonths"),WEEK:h.getProperty("/SelectedWeek"),DAY:h.getProperty("/SelectedDay"),STOP_CSTMR_NAME:e.getProperty("/SelectedCustomerLocation"),ORIG_RAMP_DESC:e.getProperty("/SelectedOriginRamps"),DEST_RAMP_DESC:e.getProperty("/SelectedDestinationRamps"),EQPT_USED:e.getProperty("/SelectedEquipment"),STOP_SPOTLIVE:e.getProperty("/SelectedSpotLive"),ORG_DEST:e.getProperty("/SelectedOrgDest"),CHARGES:e.getProperty("/SelectedCharges")});_.addCompanyFilter(a);return a},addCompanyFilter:function(e){if(_.company){e.push(new l("BILL_TO_BP",u.EQ,_.company))}},addCustomerLocationFilter:function(e){var t=_.getView().getModel("DataModel").getProperty("/SelectedCustomerLocation");var a=[];var r=new l;var n=new l;var i=[];var o=[];if(t){t.map(function(t){a.push(new l("STOP_CSTMR_NAME",u.EQ,t.custName));a.push(new l("STOP_CITY",u.EQ,t.custCity));a.push(new l("STOP_PROV",u.EQ,t.custProv));a.push(new l("STOP_POSTAL",u.EQ,t.custPost));o.push(new l({filters:a,and:true}));e.concat(o);a=[];o=[]})}},setAllDropDownFilterBinding:function(){_.loadCustomerLocation().then(function(e){_.getView().setModel(new n(e),"custLocationModel")});_.loadDestinationRamp().then(function(e){_.getView().setModel(new n(e),"destinationModel")});_.loadEquipmentType().then(function(e){_.getView().setModel(new n(e),"equipmentModel")});_.loadOriginRamp().then(function(e){_.getView().setModel(new n(e),"originModel")});_.loadOriginDestination().then(function(e){_.getView().setModel(new n(e),"originDestinationModel")});_.loadSpotLive().then(function(e){_.getView().setModel(new n(e.map(function(e){if(e.STOP_SPOTLIVE==="S"){e.New_STOP_SPOTLIVE="Spot"}else{e.New_STOP_SPOTLIVE="Live"}return e})),"spotLiveModel")});_.loadCharges().then(function(e){_.getView().setModel(new n(e.filter(function(e){return e.CHARGES})),"chargesModel")})},getData:function(e){var t=_.getView().getModel("DataModel").getProperty("/SelectedPerspective");var a={};var r=_.getFilters();var n=t+",AVERAGE_DWT_MINS,STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL";if(t==="QUARTER"){var i=e.getParameter("data")[0].data.Quarter.split(":");r.push(new l(t,u.EQ,i[0].replace(/ /g,"")))}else if(t==="MONTH"){r.push(new l("MONTH_DESC",u.EQ,e.getParameter("data")[0].data.Month.toUpperCase()))}else if(t==="WEEK"){r.push(new l(t,u.EQ,e.getParameter("data")[0].data.Week))}else if(t==="DAY"){r.push(new l("DAY_DESC",u.EQ,e.getParameter("data")[0].data["Day of Week"]))}else if(t==="MONTH_AND_DAY"){t="MONTH,DATE_NO,"+t;n=t+",AVERAGE_DWT_MINS,STOP_CSTMR_NAME,STOP_CITY,STOP_PROV,STOP_POSTAL";r.push(new l("MONTH_AND_DAY",u.EQ,e.getParameter("data")[0].data.Day))}a={$select:n,$orderby:"AVERAGE_DWT_MINS desc",$top:5};return new Promise(function(e,t){_.getView().getModel("hana").read("/DriverWaitTimeSetParameters(UserID="+"'V151595'"+")/Results",{filters:r,urlParameters:a,success:function(t){e(t.results)}})})},showTopFiveCustomer:function(e){var t=new sap.m.Label({text:"{listData>STOP_CSTMR_NAME}"});var a=new sap.m.Label({text:"{listData>STOP_CITY},{listData>STOP_PROV},{listData>STOP_POSTAL}"});var r=new sap.m.Label({text:"{listData>AVERAGE_DWT_MINS} Mins"});var i=new sap.m.ProgressIndicator({class:"sapUiLargeMarginEnd",percentValue:"{listData>percentValue}",width:"27rem",state:{path:"listData>AVERAGE_DWT_MINS",formatter:_.getProgressIndicatorStatus}});var o=new sap.m.HBox;var s=new sap.m.VBox;var l=new sap.m.VBox;l.addStyleClass("progressIndicator");var u=new sap.m.VBox;u.addStyleClass("label_margin");var d=new sap.m.HBox;l.addItem(i);u.addItem(r);d.addItem(l);d.addItem(u);s.addItem(t);s.addItem(a);s.addItem(d);o.addItem(s);var c=new sap.m.List;var m=new sap.m.CustomListItem;m.addContent(o);c.bindAggregation("items",{path:"listData>/",template:m,templateShareable:false});var p=new sap.ui.layout.VerticalLayout;p.addContent(c);var g=new T({customDataControl:function(){return p.addStyleClass("margin_list")}});var D=_.byId("idVizFrame");g.connect(D.getVizUid());g.setBusy(true);_.getData(e).then(function(e){var t=_.calculatePercentLevel(e);c.setModel(new n(t),"listData");g._Popover._oCustomHeader.setTitle("Driver Wait Time");g._Popover._oPopover.setContentWidth("36rem");g.setBusy(false)})},calculatePercentLevel:function(e){var t,a;t=e[0].AVERAGE_DWT_MINS;a=e.map(function(e){e.percentValue=Math.round(e.AVERAGE_DWT_MINS/t*100);return e});return a},getProgressIndicatorStatus:function(e){if(e>180){return"Error"}else if(e<=180&&e>90){return"Warning"}else if(e>0&&e<=90){return"Success"}else{return"Error"}},getChartDetailedProperties:function(e){var t=this.byId("idVizFrame");t.setVizType("dual_stacked_combination");t.destroyDataset();t.removeAllFeeds();t.setVizProperties({interaction:{selectability:{mode:"SINGLE"}},plotArea:{dataShape:{primaryAxis:["line"],secondaryAxis:["bar","bar"]},line:{visible:true,width:1,marker:{shape:"circle",size:6}},dataPointSize:{min:true},dataPointStyle:{rules:[{properties:{color:"#00171F",lineColor:"#00171F",lineType:"solid",pattern:"solid"},displayName:this.bundle.getText("tableDWT_Average")},{dataContext:{DriverLT90:"*"},properties:{color:"#427CAC"},displayName:this.bundle.getText("tableDWT_ShipmentLessThan90")},{dataContext:{DriverGT90:"*"},properties:{color:"#ADC6DF"},displayName:this.bundle.getText("tableDWT_ShipmentMoreThan90")}]}},legendGroup:{layout:{position:"bottom"}},valueAxis:{title:{visible:true,text:this.bundle.getText("chartvalueAxis")},color:"#999999"},valueAxis2:{label:{formatString:this.FIORI_ROUNDOFF_ZEROS},title:{visible:true,text:this.bundle.getText("chartvalueAxis2")},color:"#999999"},categoryAxis:{title:{visible:true}},title:{visible:false,text:"Driver Wait Time",style:{color:"#ff0000"}}});var a=new sap.viz.ui5.data.FlattenedDataset({data:"{hanaData>/}",measures:[{name:"DriverLT90",value:"{hanaData>DWT_LT90}"},{name:"DriverGT90",value:"{hanaData>DWT_GT90}"},{name:"AverageDriverWaitTime",value:"{hanaData>AVERAGE_DWT_MINS}"}]});var r;var n;if(e==="QUARTER"){r=new sap.viz.ui5.data.DimensionDefinition({name:this.bundle.getText("tableTTT-Quarter"),value:{path:"hanaData>QUARTER",formatter:_.getQuarterNames}});t.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({uid:"categoryAxis",type:"Dimension",values:[this.bundle.getText("tableTTT-Quarter")]}));n=e}else if(e==="MONTH"){r=new sap.viz.ui5.data.DimensionDefinition({name:this.bundle.getText("tableTTT-Month"),value:{path:"hanaData>MONTH",formatter:_.getMonthText}});t.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({uid:"categoryAxis",type:"Dimension",values:[this.bundle.getText("tableTTT-Month")]}));n=e}else if(e==="WEEK"){r=new sap.viz.ui5.data.DimensionDefinition({name:this.bundle.getText("tableTTT-Week"),value:"{hanaData>WEEK}"});t.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({uid:"categoryAxis",type:"Dimension",values:[this.bundle.getText("tableTTT-Week")]}));n=e}else if(e==="DAY"){r=new sap.viz.ui5.data.DimensionDefinition({name:this.bundle.getText("tableTTT-Dayofweek"),value:{path:"hanaData>DAY_DESC"}});t.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({uid:"categoryAxis",type:"Dimension",values:[this.bundle.getText("tableTTT-Dayofweek")]}));n=e}else if(e==="MONTH_AND_DAY"){r=new sap.viz.ui5.data.DimensionDefinition({name:this.bundle.getText("tableTTT-Day"),value:{path:"hanaData>MONTH_AND_DAY"}});t.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({uid:"categoryAxis",type:"Dimension",values:[this.bundle.getText("tableTTT-Day")]}));n=e}a.addDimension(r);a.bindAggregation("data",{path:"/",model:"hanaData",template:_.byId("idVizFrame"),templateShareable:true});t.setDataset(a);this.valueAxisFeed=this.byId("valueAxisFeed");this.valueAxisFeed2=this.byId("valueAxisFeed2");t.addFeed(this.valueAxisFeed);t.addFeed(this.valueAxisFeed2)},getDayOfWeekText:function(e){return s.getDayOfWeekText(e)},getMonthText:function(e){return s.getMonthText(e)},getWeekText:function(e){return e?o.getWeekText(e,h.getProperty("/SelectedYear")):""},getPerspectvieText:function(e){return s.getPerspectvieText(e)},getCustomerLocationText:function(e,t,a,r){return s.getCustomerLocationText(e,t,a,r)},getEquipmentText:function(e,t){return s.getEquipmentText(e,t)},onDownload:function(){m.exportToExcel(_.byId("ResultTable"),_)},formatNumber:function(e){return P.getIntegerInstance({groupingEnabled:true}).format(e)},getQuarterNames:function(e){if(e==="Q1"){return"Q1 : Jan-Mar"}else if(e==="Q2"){return"Q2 : Apr-Jun"}else if(e==="Q3"){return"Q3 : Jul-Sep"}else if(e==="Q4"){return"Q4 : Oct-Dec"}},getroundOffMinutes:function(e){var t=parseInt(Math.round(e),10);return t.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")},onReset:function(){var e=_.getView().getModel("DataModel");_.byId("Year").setSelectedKey((new Date).getFullYear());_.byId("Month").setSelectedKeys([]);_.byId("Week").setSelectedKeys([]);_.byId("Day").setSelectedKeys([]);e.setProperty("/SelectedOriginRamps",[]);e.setProperty("/SelectedDestinationRamps",[]);e.setProperty("/SelectedCustomerLocation",[]);e.setProperty("/SelectedEquipment",[]);e.setProperty("/SelectedOrgDest","Destination");e.setProperty("/SelectedSpotLive","L");e.setProperty("/SelectedCharges","");e.setProperty("/enableDay",true);_.byId("CustomerLocationId").setValue("");_.reloadData();_.setAllDropDownFilterBinding()},disableByDAY:function(){var e=_.getView().getModel("DataModel");var t=_.getView().byId("Week");var a=_.getView().byId("Month");var r=e.getProperty("/SelectedPerspective");if(a.getSelectedItems().length!==0&&a.getSelectedItems().length<=3||t.getSelectedItems().length!==0&&t.getSelectedItems().length<=12){e.setProperty("/enableDay",true)}else{e.setProperty("/enableDay",false);if(r==="MONTH_AND_DAY"&&(a.getSelectedItems().length>=4||t.getSelectedItems().length>=12||a.getSelectedItems().length===0)){e.setProperty("/SelectedPerspective","WEEK")}}},handleValueHelp:function(e){if(!_.customerLocationSelectDialog){_.customerLocationSelectDialog=sap.ui.xmlfragment("cp.c360DriverWaitTime.view.fragments.CustomerLocation",_);this.getView().addDependent(_.customerLocationSelectDialog)}_.customerLocationSelectDialog.getBinding("items").filter([]);_.customerLocationSelectDialog.open()},handleCustomLocationClose:function(e){},handleCustomLocationSearch:function(e){var t=e.getParameter("value");var a=e.getSource().getBinding("items");var r=[];var n=new sap.ui.model.Filter;if(t){var i=new l("STOP_CSTMR_NAME",sap.ui.model.FilterOperator.Contains,t);var o=new l("STOP_CITY",sap.ui.model.FilterOperator.Contains,t);var s=new l("STOP_PROV",sap.ui.model.FilterOperator.Contains,t);var u=new l("STOP_POSTAL",sap.ui.model.FilterOperator.Contains,t);r.push(i);r.push(o);r.push(s);r.push(u);n=new sap.ui.model.Filter(r,false);a.filter(n)}else{a.filter([])}},customerLocationTokenUpdate:function(e){},handleCustomLocationConfirm:function(e){var t=_.getView().getModel("DataModel"),a=e.getParameter("selectedContexts");var r=[];var n={};if(a&&a.length){a.forEach(function(e){n.custName=e.getObject().STOP_CSTMR_NAME;n.custCity=e.getObject().STOP_CITY;n.custProv=e.getObject().STOP_PROV;n.custPost=e.getObject().STOP_POSTAL;r.push(n);n={};t.setProperty("/SelectedCustomerLocation",r)})}else{t.setProperty("/SelectedCustomerLocation",[])}_.byId("CustomerLocationId").setValue(e.getParameter("selectedContexts").map(function(e){return e.getObject().STOP_CSTMR_NAME}).join(","));_.reloadData()}})});