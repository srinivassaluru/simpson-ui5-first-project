sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	var MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var DAY = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

	var pad = function (n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};

	Date.prototype.getWeek = function () {
		var target = new Date(this.valueOf());
	//	var dayNr = (this.getDay() + 6) % 7;    Fix months starting on Sunday bug
		var dayNr = this.getDay();
		target.setDate(target.getDate() - dayNr);
		var firstDay = target.valueOf();
		target.setMonth(0, 1);

		return 1 + Math.ceil((firstDay - target) / 604800000);
	};

	function getDateOfISOWeek(w, y) {
		
		/*var simple = new Date(y, 0, (w - 1) * 7);
		var dow = simple.getDay();
		var ISOweekStart = simple;
		if (dow <= 4)
		//ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
			ISOweekStart.setDate(simple.getDate() - simple.getDay());
		else
			ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());

		return ISOweekStart;*/
		
		var simple = new Date(y, 0, (w - 1) * 7);
	//	var simple = new Date(y, 0, (w) * 7);
		var dow = simple.getDay();
		var ISOweekStart = simple;
	
		ISOweekStart.setDate(simple.getDate() - dow);

		return ISOweekStart;
	};

	var SmartDateModel;

	return {

		formatter: sap.ui.core.format.DateFormat.getDateInstance({
			pattern: "MMM dd"
		}),

		init: function (context) {

			SmartDateModel = this;

			var dataObject = {
				SelectedYear: new Date().getFullYear().toString(),
				SelectedMonths: [],
				SelectedWeek: [],
				SelectedDay: [],

			};

			Object.defineProperty(dataObject, "Years", {
				get: function () {

					var obj = {};
					var arr = [];
			

			var date = new Date();
		
			var differenceYear = date.getFullYear() - 3;
		
				var i = 0,iYear;
			if (differenceYear < 2020) 
			{
				while(true){
				
				 iYear = date.getFullYear() - i;
					obj.Key = iYear;
					obj.Value = iYear;
					i++;
					if (iYear < 2020) {
						i=0;
						break;
					}
					arr.push(Object.assign({}, obj));
				}
				arr = arr.reverse();
			}
			else if(differenceYear >= 2020)
			{
				
				while(true){
						iYear = differenceYear+i;
					obj.Key = iYear;
					obj.Value = iYear;
					if(iYear > date.getFullYear() )
					{
						break;
					}
					i++;
					arr.push(Object.assign({},obj));
				
				}
			}

			return arr.reverse();

				}
			});

			//Dynamic property for list of MOnths
			Object.defineProperty(dataObject, "Months", {
				get: function () {

					var aMonths = [],
						yearBegin = new Date(parseInt(this.SelectedYear), 0),
						numDaysDiff = (Date.now() - yearBegin) / 86400000;

					aMonths = aMonths.concat(MONTH.map(function (item, index) {
						return {
							Key: ('00' + (index + 1)).slice(-2),
							Value: item
						};
					}));

					if (numDaysDiff < 365) {
						return aMonths.splice(0, new Date().getMonth() + 1);
					}

					return aMonths;

				}
			});

			//Dynamic property for list of Weeks. Based on month selection
			Object.defineProperty(dataObject, "Weeks", {
				get: function () {
					var beginDate = new Date(parseInt(this.SelectedYear), 0),
						endDate = new Date(parseInt(this.SelectedYear) + 1, 0),
						selectedYear = this.SelectedYear,
						allWeeks = {},
						aWeeks = [

						],

						fnAddWeeks = function (beginDate, endDate) {
							//var numDaysDiff = (Date.now() - beginDate.getTime()) / 86400000;
							// Added from the truckturntime.
							endDate = new Date(endDate - 1);
							var fromWeek = ((beginDate.getWeek() === 53) || (beginDate.getWeek() === 52)) ? 1 : beginDate.getWeek(),
								toWeek = endDate.getWeek() === 1 ? 53 : endDate.getWeek();
					//		var fromWeek, toWeek;
							// checkif year is leap year
					//		if(((selectedYear % 4 == 0) && (selectedYear % 100 != 0)) || (selectedYear % 400 == 0)){
					//			fromWeek = ((beginDate.getWeek() === 53) || (beginDate.getWeek() === 52)) ? 1 : beginDate.getWeek();
					//			toWeek = endDate.getWeek() === 1 ? 53 : endDate.getWeek();
					//			
					//		}else{
					//			fromWeek = ((beginDate.getWeek() === 53) || (beginDate.getWeek() === 52)) ? 1 : beginDate.getWeek() + 1;
					//			toWeek = endDate.getWeek() === 1 ? 53 : endDate.getWeek() + 1;
					//			
					//		}
							if (toWeek >= 52) {
								toWeek = 53;
							}
							for (var i = fromWeek; i < toWeek + 1; i++) {
								var dateOfISOWeek = getDateOfISOWeek(i, selectedYear),
									dateOfISOWeekEnd = new Date(dateOfISOWeek.getTime() + 86400000 * 6 + 3600000);  //Additional 1 hr for DST

								if (!allWeeks[i + ""]) {
									aWeeks.push({
										Sequence: i,
										Key: i + "",
										Value: SmartDateModel.formatter.format(dateOfISOWeek) + " - " + SmartDateModel.formatter.format(dateOfISOWeekEnd),
										AdditionalText: "Week " + i
									});

									allWeeks[i + ""] = "Week " + i;
								}
							}
						
						};

					if (this.SelectedMonths.length === 0) {
						fnAddWeeks(beginDate, endDate);
					} else {
						this.SelectedMonths.forEach(function (month) {
							beginDate = new Date(parseInt(selectedYear), parseInt(month) - 1);
							endDate = new Date(parseInt(selectedYear), parseInt(month));

							fnAddWeeks(beginDate, endDate);
						});
					}
					aWeeks.sort(SmartDateModel.dynamicSort("Sequence"));
					return aWeeks;
				}
			});

			// Dynamic property for the list of days.Based on the week selection.
			Object.defineProperty(dataObject, "Days", {

				get: function () {
					var aDays = [];
					/*	if( this.SelectedWeek.length > 0 )
	          		{
            			var beginWeekdate,endWeekdate;
	           				for(var i=0;i<this.Weeks.length;i++)
	           				{
									if( this.Weeks[i].Sequence === parseInt(this.SelectedWeek))
										{
											    var date = this.Weeks[i].Value.split("-");
											    // checking the previous year weeks.
											    if(date[0].trim().split(" ")[0] === 'Dec' && date[1].trim().split(" ")[0] !== 'Dec')
											    {
        										beginWeekdate = new Date("'"+date[0]+","+parseInt((this.SelectedYear)-1));
    											 endWeekdate = new Date("'"+date[1]+","+parseInt(this.SelectedYear));
											    }
											    else{
											    beginWeekdate = new Date("'"+date[0]+","+parseInt(this.SelectedYear));
    											 endWeekdate = new Date("'"+date[1]+","+parseInt(this.SelectedYear));
											    }
										}
	           				}
	           				endWeekdate.setDate(endWeekdate.getDate()+1);*/
					var j = 0;
					while (j < 7) {
						aDays.push({
							Key: j,
							Value: DAY[j]
						});
						//beginWeekdate.setDate(beginWeekdate.getDate() + 1);
						j++;
					}
					//}
					return aDays;

				}
			});

			context.getView().setModel(new JSONModel(dataObject), "DateModel");

			return context.getView().getModel("DateModel");
		},

		getWeekText: function (weekNumber, selectedYear) {
			var dateOfISOWeek = getDateOfISOWeek(parseInt(weekNumber), selectedYear),
				dateOfISOWeekEnd = new Date(dateOfISOWeek.getTime() + 86400000 * 6 + 3600000); //Additional 1 hr for DST

			return "Week " + weekNumber + ": " + SmartDateModel.formatter.format(dateOfISOWeek) + " - " + SmartDateModel.formatter.format(
				dateOfISOWeekEnd);
		},

		enhanceDataSeries: function (data, key) {
			if (SmartDateModel[key]) {
				SmartDateModel[key](data);
			}
		},

		// //Adds missing data points into time series
		enhanceData: function (data, property, padWidth, shift) {
			data.forEach(function (item, index) {
				if (parseInt(item[property]) !== (index + shift)) {
					var newIitem = {
						AVERAGE_TURNTIME: "0",
						DOUBLEHANDLE_QTY: 0,
						SINGLEHANDLE_QTY: 0,
						TRUCK_QUANTITY: "0"
					};
					newIitem[property] = pad(index + shift, padWidth);
					data.splice(index, 0, newIitem);

					SmartDateModel.enhanceData(data, property, padWidth, shift);
				}
			});
		},

		MONTH: function (data) {
			SmartDateModel.enhanceData(data, "MONTH", 2, 1);
		},

		WEEK: function (data) {
			SmartDateModel.enhanceData(data, "WEEK", 0, 1);
		},

		DAY: function (data) {
			SmartDateModel.enhanceData(data, "DAY", 0, 0);
		},

		HOUR: function (data) {
			SmartDateModel.enhanceData(data, "HOUR", 2, 0);
		},
		dynamicSort: function (property) {
			var sortOrder = 1;
			if (property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a, b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			};
		}
	};
});