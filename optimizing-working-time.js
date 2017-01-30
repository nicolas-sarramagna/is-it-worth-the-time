/**
 * parse the value of a fieldId in float
 * 
 * @param id
 * @returns float
 */
function getValue(id) {
	return parseFloat($(id).val());
}

/**
 * parse the value of a field text in float
 * 
 * @param id
 * @returns float
 */
function getValueText(id) {
	return parseFloat($(id).text());
}

/**
 * Returns a decimal with precision 2. Ex x:2,535 -> 2,54
 * 
 * @param x
 * @returns {Number}
 */
function roundValue(x) {
	return Math.round(x * 100) / 100;
}

/**
 * Returns the value in float of the selected option
 * 
 * @param id
 * @returns float
 */
function getValueUnit(id) {
	var idRef = $(id).val();
	return parseFloat($('#' + idRef).val());
}

/**
 * returns the coefficient a from f(x) = a * x. It is the current equation in
 * time spent
 * 
 * @returns {Number}
 */
function getA_X() {
	var actualTaskDuration = getValue('#actualTaskDurationId');

	var actualTaskDurationUnit = getValueUnit('#actualTaskDurationUnitId');
	var actualTaskFrequency = getValue('#actualTaskFrequencyId');

	var actualTaskFrequencyUnit = getValueUnit('#actualTaskFrequencyUnitId');

	// equation actual time spent
	var a_x = (actualTaskDuration * actualTaskDurationUnit * actualTaskFrequency)
			/ (1.0 * actualTaskFrequencyUnit);
	return a_x;
}

/**
 * returns the coefficient b_future from f_future(x) = a_future * x + b_future
 * It is the future equation in time spent
 * 
 * @returns {Number}
 */
function get_B_Future() {
	// in min
	var b_prime = getValue('#timePutInPlaceId') * getValue('#pWorkingDayId');
	return b_prime;
}

/**
 * returns the coefficient a_future from f_future(x) = a_future * x + b_future
 * It is the future equation in time spent
 * 
 * @returns {Number}
 */
function getA_X_Future() {
	// in min
	var timeExecution = getValue('#timeExecutionId')
			* getValue('#pWorkingMinId');
	var taskFrequency = getValue('#taskFrequencyId');
	var taskFrequencyUnit = getValueUnit('#taskFrequencyUnitId');
	var a_x_prime = (timeExecution * taskFrequency) / (1.0 * taskFrequencyUnit);
	return a_x_prime;
}

/**
 * Comestic function to change text 'Gain' to 'Loss' and color background
 * 
 * @param gainValue
 * @returns Void
 */
function displayGainOrLoss(gainValue) {
	if (gainValue < 0) {
		$("#resultZoneId .bg-success h3:contains('Gain')").html(
				function(occurrence, text) {
					var sNewText = text.replace("Gain", "Loss");
					return sNewText;
				});

		$("#resultZoneId .bg-success li:contains('gain')").html(
				function(occurrence, text) {
					var sNewText = text
							.replace(new RegExp('gain', 'g'), "loss"); // replaceAll
					return sNewText;
				});

		// change background success to danger
		$('#resultZoneId .bg-success').addClass('bg-danger');
		$('#resultZoneId .bg-success').removeClass('bg-success');

	} else {
		$("#resultZoneId .bg-danger h3:contains('Loss')").html(
				function(occurrence, text) {
					var sNewText = text.replace("Loss", "Gain");
					return sNewText;
				});

		$("#resultZoneId .bg-danger li:contains('loss')").html(
				function(occurrence, text) {
					var sNewText = text
							.replace(new RegExp('loss', 'g'), "gain");
					return sNewText;
				});

		// change background danger to success
		$('#resultZoneId .bg-danger').addClass('bg-success');
		$('#resultZoneId .bg-danger').removeClass('bg-danger');

	}
}

/**
 * Display the Chart, use the library http://www.flotcharts.org/ and the plugin
 * jquery.flot.axislabels to display titles on axis
 * 
 * @returns Void
 */
function displayChart() {
	var LIMIT_FACTOR_AXIS_X = 2;

	// coord x for the gain point
	var xA = getValueText('#timeGainAfterId');

	// coord (x,y) for the extreme right point for the current equation
	var xA_limit = LIMIT_FACTOR_AXIS_X * xA;
	var yA_limit = LIMIT_FACTOR_AXIS_X * getA_X() * xA;

	// cord y for the start of the future equation
	var yB_Future = get_B_Future() / (1.0 * getValue('#pWorkingDayId'));

	// no gain, no display
	if (xA <= 0) {
		$("#chartId").empty();
		return;
	}

	// coord y for the extreme right point for the future equation
	var yA_Future_limit = LIMIT_FACTOR_AXIS_X * getA_X_Future() * xA;

	// points for the current equation
	var now = [ [ 0, 0 ], [ xA_limit, yA_limit ] ];

	// points for the future equation
	var future = [ [ 0, yB_Future ], [ xA_limit, yA_Future_limit + yB_Future ] ];

	// points to show the gain point
	var crosspoint = [ [ xA, 0 ], [ xA, xA * getA_X() ] ];

	// points to show the gain area
	var gainArea = [ [ xA, xA * getA_X() ], [ xA_limit, yA_limit ] ];

	// chart libray flotcharts
	var plot = $.plot($("#chartId"), [ {
		data : now,
		label : "&nbsp; Time currently spent on the task",
		show : true,
		color : "#d1a1a1",
		shadowSize : 0
	}, {
		data : future,
		label : "&nbsp; Time spent with the automated task",
		show : true,
		color : "#9ec5d8",
		shadowSize : 0
	}, {
		data : crosspoint,
		lines : {
			show : true,
			lineWidth : 1
		},
		color : "#545454",
		shadowSize : 0,
		points : {
			show : true
		}
	}, {
		data : gainArea,
		lines : {
			show : true,
			lineWidth : 0, // to avoid to mask the lines of the data 'now'
			fill : true,
			fillColor : { // opacity < 1.0 to avoid to mask the lines of the
							// data 'future'
				colors : [ {
					opacity : 0.4
				}, {
					opacity : 0.4
				} ]
			}
		},
		color : "#c0e0b3",
		shadowSize : 0
	} ], {
		grid : {

			borderWidth : {
				"top" : 0,
				"right" : 0,
				"bottom" : 1,
				"left" : 1
			}
		},
		yaxis : {
			min : 0,
			max : yA_limit,
			tickDecimals : 0,
			axisLabel : "Task worload",
			tickFormatter : function(val) {
				return val + " w. days";
			}
		},
		xaxis : {
			min : 0,
			max : xA_limit,
			axisLabel : "Working time",
			tickFormatter : function(val) {
				return val + " w. days";
			}
		},
		legend : {
			position : "nw"
		}
	}

	);

	// show the gain point in the chart with a message
	var o = plot.pointOffset({
		x : xA,
		y : xA * getA_X()
	});
	$("#chartId").append(
			"<div class='chart-crosspoint' style='left:" + (o.left + 4)
					+ "px;top:" + o.top + "px;'>Gain point = " + xA
					+ " w. days</div>");

}

/**
 * Main function to calculate the indicators
 * 
 * 1. Compute the intersection of the current equation of time spent f(x) = a *
 * x and the future equation in f(x) = a * x + b
 * 
 * 2. updates the fields with the new indicators
 */
function computeTime() {
	// current equation time spent
	var a_x = getA_X();

	// future time spent
	var a_prime_x = getA_X_Future();
	// in min
	var b_prime = get_B_Future();

	// in min
	var timeGainAfter = b_prime / (1.0 * (a_x - a_prime_x));
	// convert gain in working day
	timeGainAfter = timeGainAfter / getValue('#pWorkingDayId');

	// compute gain step after, by w.day
	var timeGain = (a_x - a_prime_x) * getValue('#pWorkingDayId');

	// update fields
	$('#timeGainAfterId').text(roundValue(timeGainAfter));
	$('#timeGainDayId').text(roundValue(timeGain));

	// convert in w. hour by w. week
	$('#timeGainWeekId')
			.text(
					roundValue(timeGain
							* getValue('#pWorkingWeekId')
							/ (getValue('#pWorkingDayId') * getValue('#pWorkingHourId'))));

	// convert in w. day by w. month
	$('#timeGainMonthId')
			.text(
					roundValue(timeGain
							* getValue('#pWorkingMonthId')
							/ (getValue('#pWorkingDayId') * getValue('#pWorkingDayId'))));
	
	// convert in w. day by w. year
	$('#timeGainYearId')
			.text(
					roundValue(timeGain
							* getValue('#pWorkingYearId')
							/ (getValue('#pWorkingDayId') * getValue('#pWorkingDayId'))));

	displayGainOrLoss(timeGain);
	displayChart();
}
// launch
computeTime();
