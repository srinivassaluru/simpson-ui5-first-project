sap.ui.define([
], function () {
	"use strict";

	return {

		MONTH : {
			"01" : "January",
			"02" : "February",
			"03" : "March",
			"04" : "April",
			"05" : "May",
			"06" : "June",
			"07" : "July",
			"08" : "August",
			"09" : "September",
			"10" : "October",
			"11" : "November",
			"12" : "December"
		},

		DAY_OF_WEEK	 : {
			"0" : "Monday",
			"1" : "Tuesday",
			"2" : "Wednesday",
			"3" : "Thursday",
			"4" : "Friday",
			"5" : "Saturday",
			"6" : "Sunday"
		},

		PERSPECTIVE_LABELS : {
			"QUARTER"	    : "By Quarter",
			"MONTH"			: "By Month",
			"WEEK"			: "By Week",
			"DAY"			: "By Day of Week",
			"MONTH_AND_DAY"	: "By Day"
		},

		getMonthText : function(monthNumber) {
			return this.MONTH[monthNumber];
		},
		
		getDayOfWeekText : function(dayNumber) {
			return this.DAY_OF_WEEK[dayNumber];
		},
		
		getPerspectvieText : function(selectedPerspective) {
			return this.PERSPECTIVE_LABELS[selectedPerspective];
		},
		
		getCustomerLocationText : function(cust,city,prov,postal){
			return cust + ", " + city + ", " + prov + ", " + postal;
		},
		
		getEquipmentText : function(type,desc){
			return type + " - " + desc;
		}

	};
});