(function() {
	
	/*
	 * Logs for timed runs
	 */
	var TimerLog = function() {
		var fastest = null,
			slowest = null,
			times = [],
			totalTime = 0;
		
		return {
			/*
			 * Add a run
			 */
			add: function(timeInMs) {
				times.push(timeInMs);
				if (timeInMs >= this.fastest()) {
					this.fastest(timeInMs); 
				}
				if (this.slowest() === null || timeInMs <= this.slowest()) {
					this.slowest(timeInMs);
				}
				totalTime += timeInMs;
			},
			/*
			 * Run count
			 */
			count: function() {
				return times.length;
			},
			/*
			 * Fastest run time in ms
			 */
			fastest: function(timeInMs) {
				return timeInMs ? fastest = timeInMs : fastest;
			},
			/*
			 * Slowest run time in ms
			 */
			slowest: function(timeInMs) {
				return timeInMs ? slowest = timeInMs : slowest;
			},
			/*
			 * Total time of all runs in ms
			 */
			totalTime: function() {
				return totalTime;
			},
			/*
			 * Trims slowest and fastest run times and returns an object containing
			 * the total trimmed time in ms and the run count after excluding the
			 * fastest and slowest run times.
			 */
			trimmed: function() {
				var time = 0;
				var count = 0;
				for (i = 0; i < this.count(); i++) {
					if (this.count() < 3 || (this.fastest() !== times[i] && this.slowest() !== times[i])) {
						time += times[i];
						count++;
					}
				}
				return {
					time: time,
					count: count	
				};
			}
		};
	};
	
	/*
	 * A simple timer
	 */
	var Timer = function(optionsParam) {
			
		var options = {			
				/*
				 * Interval that the timer uses to increment
				 */
				intervalTime: 43,
				/*
				 * Default formatting options when converting
				 * time in ms. Specify the minimum number of 
				 * digits a time property should have as well
				 * as the trim length.  
				 */
				timeFormat: {
					ms:   { digits: 3, trim: 1 },
					sec:  { digits: 2, trim: 0 },
					min:  { digits: 1, trim: 0 },
					hour: { digits: 1, trim: 0 },
					day:  { digits: 1, trim: 0 }
				}		
			},
			
			
			/*
			 * Timer running flag
			 */
			running = false,
					
			/*
			 * Id of the setInterval that is running
			 */
			intervalId = null,
			
			/*
			 * The Date when the timer is started
			 */
			startDate = null,
			
			/*
			 * The Date when the timer is stopped
			 */
			endDate = null;
		
		/*
		 * Simple object extend
		 * 
		 * @param {Object} objA - the object to copy the properties into
		 * @param {Object} objB - the object to copy the properties from
		 * 
		 * @return objA extended with the properties from objB
		 */
		function extend(objA, objB) {
			for (var b in objB) {
				objA[b]= objB[b];
			}
			return objA;
		}
		
		/*
		 * Internal convert function
		 */
		function convert(timeMs) {
			var d = new Date(0, 0, 0, 0, 0, 0, timeMs);
			return {
				ms: d.getMilliseconds(),
				sec: d.getSeconds(),
				min: d.getMinutes(),
				hour: d.getHours(),
				day: d.getDay()
			};
		}
		
		/*
		 * Internal format function
		 */
		function format(timeMs, timeFormat) {
			var localTimeFormat = extend(extend({}, options.timeFormat), timeFormat);
			var time = convert(timeMs);
			for (var a in localTimeFormat) {
				if (options.timeFormat[a] !== undefined) {
					var localFormat = localTimeFormat[a];
					var strValue = time[a].toString();
					while (strValue.length < localFormat.digits) {
						strValue = "0" + strValue;
					}
					time[a] = strValue.substr(0, strValue.length - localFormat.trim);
				}
			}
			return time;
		}
		
		options = extend(options, optionsParam);
		
		return {
			/*
			 * Start the timer
			 * 
			 * @param {Function} callback - a callback function to run at each interval, 
			 *								the callback will be passed the elapsed time in ms
			 */
			start: function(callback) {
				var self = this;
				
				running = true;
				startDate = new Date();
				endDate = null;
				
				intervalId = window.setInterval(function() {
					endDate = new Date();
					if (typeof callback === "function") {
						callback(self.elapsed());
					}
				}, options.intervalTime);
			},
			/*
			 * Stop the timer
			 */
			stop: function() {
				running = false;
				clearInterval(intervalId);
				return this.elapsed();
			},
			/*
			 * Reset the timer
			 */
			reset: function() {
				this.stop();
				startTime = endTime = 0;
			},
			/*
			 * The elapsed time for the current run
			 */
			elapsed: function() {
				return (this.running() ? new Date() : endDate) - startDate;
			},
			/*
			 * Convert time in ms to an object that contains discrete
			 * properties for each time segment.
			 * 
			 * @param {Number} timeMs - the time in ms to convert
			 * 
			 * @return an object that contains properties
			 *			for ms, sec, min, hour and day.
			 */
			convert: function(timeMs) {
				return convert(timeMs);
			},
			/*
			 * Format a time in ms for display.
			 * 
			 * @param {Number} timeMs - the time in ms to format
			 * @param {Object} timeFormat - optional param to override the default time format options
			 * 
			 * @return an object that contains properties
			 *			for ms, sec, min, hour and day.
			 */
			format: function(timeMs, options) {
				return format(timeMs, options);
			},
			/*
			 * If the timer is running
			 */
			 running: function() {
				return running;
			 }
		};
	};
	
	/*
	 * Manages the rubkis timer UI interactions
	 */
	var Rubkis = function() {
		/*
		 * $container element
		 */
		var $container = document.getElementById("container"),
			
			/*
			 * Cube random moves element
			 */
			$moves = document.getElementById("moves"),
			
			/*
			 * Timer elements
			 */
			$timer = document.getElementById("timer"),
			$minutes = document.getElementById("minutes"),
			$seconds = document.getElementById("seconds"),
			$tenths = document.getElementById("tenths"),
			$times = document.getElementById("times"),
			
			/*
			 * Summary Elements
			 */
			$summary = document.getElementById("summary"),
			$avgRuns = document.getElementById("average-runs"),
			$avrTime = document.getElementById("average-time"),
			$trimRuns = document.getElementById("trimmed-runs"),
			$trimTime = document.getElementById("trimmed-time"),
			
			elementToTimeMap = [],
			
			timer = new Timer(),
			
			timerLog = new TimerLog(),
			
			/*
			 * Before start CSS class
			 */
			TIME_BEFORE_START_CLASS = "timer-before-start",
			
			/*
			 * Timer running CSS class
			 */
			TIMER_RUNNING_CLASS = "timer-running",
			
			/*
			 * Fastest run time CSS class
			 */
			FASTEST_TIME_CLASS = "fastest-time",
			
			/*
			 * Slowest run time CSS class
			 */
			SLOWEST_TIME_CLASS = "slowest-time",
			
			/*
			 * Time data attribute name
			 */
			TIME_DATA = "time",
			
			/*
			 * Spacebar key
			 */
			SPACEBAR_KEY_ID = 32;
		
		/*
		 * Creates 25 random cube moves and shows them in the UI
		 */
		function populateMoves() {
			$moves.innerHTML = "";
			
			var moveTypes = ["R", "U", "B", "L", "D", "F"];
			var moveAug = ["", "2", "'"];
			
			for (i = 0; i < 25; i++) {
				var ranMoveTypePos = Math.floor(Math.random() * (moveTypes.length));
				var ranMoveAugPos = Math.floor(Math.random() * (moveAug.length));
				
				var ranMoveType = moveTypes[ranMoveTypePos];
				var ranMoveAug = moveAug[ranMoveAugPos];
				var moveElement = document.createElement("li");
				moveElement.appendChild(document.createTextNode(ranMoveType + ranMoveAug));
				$moves.appendChild(moveElement);
			}
		}

		/*
		 * Show run results 
		 */
		function showRunResults(ms) {
			var resultsElement = document.createElement("li");
			resultsElement.innerHTML = $timer.innerHTML;
			$times.appendChild(resultsElement);
			
			elementToTimeMap.push({
				element: resultsElement,
				time: ms
			});
			
			$times.scrollTop = $times.scrollHeight;
			
			for (var i = 0; i < elementToTimeMap.length; i++) {
				var item = elementToTimeMap[i];
				
				if (item.time === timerLog.fastest()) {
					addClass(item.element, FASTEST_TIME_CLASS);
				} else if (item.time === timerLog.slowest()) {
					addClass(item.element, SLOWEST_TIME_CLASS);
				} else {
					removeClass(item.element, FASTEST_TIME_CLASS);
					removeClass(item.element, SLOWEST_TIME_CLASS);
				}
			}
			
			var trimmed = timerLog.trimmed(),
				totalTimeObj = timer.format(timerLog.totalTime() / timerLog.count()),
				t = new Date(timerLog.totalTime() / timerLog.count());
				totalTrimTimeObj = timer.format(trimmed.time / trimmed.count);
			
			$avgRuns.innerHTML = timerLog.count();
			$avrTime.innerHTML = totalTimeObj.min + ":" + totalTimeObj.sec + "." + totalTimeObj.ms;
			$trimRuns.innerHTML = trimmed.count;
			$trimTime.innerHTML = totalTrimTimeObj.min + ":" + totalTrimTimeObj.sec + "." + totalTrimTimeObj.ms;
			
			$summary.style.display = "block";
		}
		
		function addClass(element, newClass){
		    var clazz, 
				classes = element.className.split(/\s+/), 
				newClasses = []; 

		    while(classes.length){
		        clazz = classes.shift();
		        if(clazz && clazz != newClass) {
					newClasses.push(clazz);
		        }
		    }
		    
		    newClasses.push(newClass);
		    element.className = newClasses.join(" ");  
		}
		
		function removeClass(element, oldClass){
		    var clazz, 
				classes = element.className.split(/\s+/), 
				newClasses = []; 

		    while(classes.length){
		        clazz = classes.shift();
		        if(clazz && clazz != oldClass) {
					newClasses.push(clazz);
		        }
		    }
		    
		    element.className = newClasses.join(" ");   
		}
			
		/*
		 * Listen to spacebar to start, stop and reset the timer
		 */
		 
		document.onkeyup = function(e) {
			var event = e || window.event;
			if (event.which === SPACEBAR_KEY_ID) {
				removeClass($container, TIME_BEFORE_START_CLASS);

				if (timer.running()) {
					removeClass($container, TIMER_RUNNING_CLASS);
					
					var latestTime = timer.stop();
					
					timerLog.add(latestTime);
					
					showRunResults(latestTime);
					populateMoves();
				} else {
					addClass($container, TIMER_RUNNING_CLASS);

					timer.start(function(ms) {
						var t = timer.format(ms);
						
						$tenths.innerHTML = t.ms;
						$seconds.innerHTML = t.sec;
						$minutes.innerHTML = t.min;	
					});
				}
			}		
		};
	
		document.onkeydown = function(e) {
			var event = e || window.event;
			if (event.which === SPACEBAR_KEY_ID) {
				addClass($container, TIME_BEFORE_START_CLASS);

				if (!timer.running()) {
					$tenths.innerHTML = "00";
					$seconds.innerHTML = "00";
					$minutes.innerHTML = "0";
					timer.reset();
				}
			}
		};
		
		populateMoves();
	}();
})();