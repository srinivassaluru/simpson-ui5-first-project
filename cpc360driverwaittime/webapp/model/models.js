sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		value: function (__object__, parts, defaultValue) {
            var __parts = parts.split('.');
            var temp = __object__;
            if (!parts || !__parts) {
                return __object__ ? __object__ : defaultValue;
            }
            for (var i = 0; i < __parts.length; i++) {
                var part = __parts[i];
                if (temp) {
                    if ($.isFunction(temp[part])) {
                        temp = temp[part]();
                    } else {
                        temp = temp[part];
                    }
                } else {
                    return defaultValue;
                }
            }
            return temp ? temp : defaultValue;
        },
        
        
        includeByIds: function (ids, fn) {
            return function (element) {
                var include = false;

                $.each(ids, function (i, id) {
                    if (element.getId().indexOf(id) != -1) {
                        include = true;
                    }
                });

                if (include) {
                    fn(element);
                }
            };
        },

        setProperty: function (propertyName, value) {
            return function (element) {
                var oMetadata = element.getMetadata(),
                    oProperty = oMetadata.getAllProperties()[propertyName];

                if (oProperty && oProperty._sMutator) {
                    element[oProperty._sMutator](value);
                }
            };
        },

        setProperties: function (properties) {
            return function (element) {
                var oMetadata = element.getMetadata(),
                    aAllProperties = oMetadata.getAllProperties();

                Object.keys(properties).forEach(function (el) {
                    if (aAllProperties[el] && aAllProperties[el]._sMutator) {
                        element[aAllProperties[el]._sMutator](properties[el]);
                    }
                });
            };
        },

        walkThroughUI: function (root, fnCallback) {
            if (!root) return;

            fnCallback(root);

            $.each(root.findAggregatedObjects(true), function (i, control) {
                fnCallback(control);
            });
        },

        includeByClass: function (__class, fn) {
            return function (element) {
                if (element instanceof __class) {
                    fn(element);
                }
            };
        },

        excludeById: function (__id, fn) {
            return function (element) {
                if (element.getId() && element.getId().indexOf(__id) === -1) {
                    fn(element);
                }
            };
        },

        excludeByIds: function (ids, fn) {
            return function (element) {
                var include = true;

                $.each(ids, function (i, id) {
                    if (element.getId().indexOf(id) != -1) {
                        include = false;
                    }
                });

                if (include) {
                    fn(element);
                }
            };
        },

        includeByData: function (key, value, fn) {
            return function (element) {
                if (value === element.data(key)) {
                    fn(element);
                }
            };
        },

        includeIfDataExist: function (key, fn) {
            return function (element) {
                if (element.data(key)) {
                    fn(element);
                }
            };
        },
	};
});