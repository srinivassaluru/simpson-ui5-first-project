sap.ui.define([
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
	"use strict";

	return {

		prepareFilters: function (oFilterValues) {
			var aFilters = [];
			var controller = this;
			Object.keys(oFilterValues).forEach(function (filterName) {
				if (Array.isArray(oFilterValues[filterName])) {

					if (oFilterValues[filterName].length > 0) {

						if (filterName === "STOP_CSTMR_NAME") {

							var customerData = controller.getFilterNames(oFilterValues[filterName]);
							aFilters.push(new Filter(customerData, false));

						} else {

							aFilters.push(new Filter({
								filters: oFilterValues[filterName].map(function (value) {

									return new Filter(filterName, FilterOperator.EQ, value);
								})
							}, false));

						}
					}

				} else {
					if (oFilterValues[filterName] && oFilterValues[filterName] !== "All") {
						aFilters.push(new Filter(filterName, FilterOperator.EQ, oFilterValues[filterName]));
					}
				}
			});

			return aFilters;
		},

		getFilterNames: function (data) {
			var aAllFilters = [];
			var aAllFiltrsAnd = [];
			for (var i = 0; i < data.length; i++) {

				aAllFilters.push(new Filter("STOP_CSTMR_NAME", FilterOperator.EQ, data[i].custName));
				aAllFilters.push(new Filter("STOP_CITY", FilterOperator.EQ, data[i].custCity));
				aAllFilters.push(new Filter("STOP_PROV", FilterOperator.EQ, data[i].custProv));
				aAllFilters.push(new Filter("STOP_POSTAL", FilterOperator.EQ, data[i].custPost));

				aAllFiltrsAnd.push(new Filter(aAllFilters, true));
				aAllFilters = [];

			}

			return aAllFiltrsAnd;

		}

	};
});