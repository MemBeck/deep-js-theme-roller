(function() {
	function escapeStr( str) {
		if( str)
			return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1')
		else
			return str;
	}
	var dynamicStyles = [];
	var dynamicStylesCount = 0;

	var dynamicStyle = function(selectorText, styleName, styleValue) {
		this.selectorText = selectorText;
		this.styleName = styleName;

		var matchColors = /(\d{1,3}), (\d{1,3}), (\d{1,3})/;
		var matchColorsRgba = /(\d{1,3}), (\d{1,3}), (\d{1,3}), (.*)/;
		var matchItems = new RegExp("^rgb((.*))$");
		//var rgbArr = []; 
		var self = this;
		self.originalStyleText = styleValue;
		// try{ 

			this.styleText = styleValue.replace(matchItems, function (match, content, off, s) {
				var test = match.match(matchColors);
				self.r = test[1];
				self.g = test[2];
				self.b = test[3];   
				return styleValue.replace(match, "{0}");
			});
		// } catch (e) { 
		// } 

		this.val = function(value){
			if (value){ 
				// set value list  
			} else {  
				// get value list 
			}
		}; 

		if (this.r !== undefined){
		}

		return this;
	};

	var getStyle = function(className) {

		var colorRules = [];
		var processSelector = function(rule){

		 
			for (var key in rule.style) {
				var style = rule.style[key];
				if (typeof (style) === "string" && key !== "cssText" && style.indexOf("rgb") !== -1){

					var test = new dynamicStyle(rule.selectorText, key, style);
					if (test.r !== undefined && $(escapeStr(test.selectorText)).length !== 0){
						var v = test.r + "," + test.g + "," + test.b;
						if (dynamicStyles[v] === undefined) dynamicStyles[v] = [];
						dynamicStyles[v].push(test);
						dynamicStylesCount++;
					}
				 
					test.val();
					//console.log(rule.selectorText, key, style);
				}
			};
		};

		var processCss = function(classes) {
			if(classes){	
				for(var x=0; x < classes.length ; x++){
					var selector = classes[x];
					if (selector){
						processSelector(selector);
					}
				}
			}
		};

		var styles = document.styleSheets;
		for (var s = 0; s < styles.length; s++) {
			var style = styles[s];
			if (!style.styleSheet){
				if (style.cssRules)
					for (var i = 0; i < style.cssRules.length; i++) {
						var sheet = style.cssRules[i].styleSheet;
						if (sheet){
							var rules = sheet.rules || sheet.cssRules;
							processCss(rules);
						}
					}
			} else {
				processCss(style);
			}
		};

		console.warn("STYLES", dynamicStyles, dynamicStylesCount);
	}; 

	Deep.on("sa.theme-roller.index.render", function(){
		getStyle(".container");
	});
})(jQuery);