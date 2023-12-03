sap.ui.define(["sap/ui/model/json/JSONModel"],function(e){"use strict";var t=["January","February","March","April","May","June","July","August","September","October","November","December"];var a=["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];var r=function(e,t,a){a=a||"0";e=e+"";return e.length>=t?e:new Array(t-e.length+1).join(a)+e};Date.prototype.getWeek=function(){var e=new Date(this.valueOf());var t=(this.getDay()+6)%7;e.setDate(e.getDate()-t+3);var a=e.valueOf();e.setMonth(0,1);if(e.getDay()!=4){e.setMonth(0,1+(4-e.getDay()+7)%7)}return 1+Math.ceil((a-e)/6048e5)};function n(e,t){var a=new Date(t,0,(e-1)*7);var r=a.getDay();var n=a;n.setDate(a.getDate()-r);return n}var i;return{formatter:sap.ui.core.format.DateFormat.getDateInstance({pattern:"MMM dd"}),init:function(r){i=this;var u={SelectedYear:(new Date).getFullYear().toString(),SelectedMonths:[],SelectedWeek:[],SelectedDay:[]};Object.defineProperty(u,"Years",{get:function(){var e={};var t=[];var a=new Date;var r=a.getFullYear()-3;var n=0,i;if(r<2020){while(true){i=a.getFullYear()-n;e.Key=i;e.Value=i;n++;if(i<2020){n=0;break}t.push(Object.assign({},e))}t=t.reverse()}else if(r>=2020){while(true){i=r+n;e.Key=i;e.Value=i;if(i>a.getFullYear()){break}n++;t.push(Object.assign({},e))}}return t.reverse()}});Object.defineProperty(u,"Months",{get:function(){var e=[],a=new Date(parseInt(this.SelectedYear),0),r=(Date.now()-a)/864e5;e=e.concat(t.map(function(e,t){return{Key:("00"+(t+1)).slice(-2),Value:e}}));if(r<365){return e.splice(0,(new Date).getMonth()+1)}return e}});Object.defineProperty(u,"Weeks",{get:function(){var e=new Date(parseInt(this.SelectedYear),0),t=new Date(parseInt(this.SelectedYear)+1,0),a=this.SelectedYear,r={},u=[],o=function(e,t){var o=e.getWeek()===53||e.getWeek()===52?1:e.getWeek(),c=t.getWeek()===1?53:t.getWeek();if(c>=52){c=53}for(var s=o;s<c+1;s++){var f=n(s,a),l=new Date(f.getTime()+864e5*6);if(!r[s+""]){u.push({Sequence:s,Key:s+"",Value:i.formatter.format(f)+" - "+i.formatter.format(l),AdditionalText:"Week "+s});r[s+""]="Week "+s}}};if(this.SelectedMonths.length===0){o(e,t)}else{this.SelectedMonths.forEach(function(r){e=new Date(parseInt(a),parseInt(r)-1);t=new Date(parseInt(a),parseInt(r));o(e,t)})}u.sort(i.dynamicSort("Sequence"));return u}});Object.defineProperty(u,"Days",{get:function(){var e=[];var t=0;while(t<7){e.push({Key:t,Value:a[t]});t++}return e}});r.getView().setModel(new e(u),"DateModel");return r.getView().getModel("DateModel")},getWeekText:function(e,t){var a=n(parseInt(e),t),r=new Date(a.getTime()+864e5*6);return"Week "+e+": "+i.formatter.format(a)+" - "+i.formatter.format(r)},enhanceDataSeries:function(e,t){if(i[t]){i[t](e)}},enhanceData:function(e,t,a,n){e.forEach(function(u,o){if(parseInt(u[t])!==o+n){var c={AVERAGE_TURNTIME:"0",DOUBLEHANDLE_QTY:0,SINGLEHANDLE_QTY:0,TRUCK_QUANTITY:"0"};c[t]=r(o+n,a);e.splice(o,0,c);i.enhanceData(e,t,a,n)}})},MONTH:function(e){i.enhanceData(e,"MONTH",2,1)},WEEK:function(e){i.enhanceData(e,"WEEK",0,1)},DAY:function(e){i.enhanceData(e,"DAY",0,0)},HOUR:function(e){i.enhanceData(e,"HOUR",2,0)},dynamicSort:function(e){var t=1;if(e[0]==="-"){t=-1;e=e.substr(1)}return function(a,r){var n=a[e]<r[e]?-1:a[e]>r[e]?1:0;return n*t}}}});