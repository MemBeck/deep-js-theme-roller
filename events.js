(function() {
	function escapeStr( str) {
		if( str)
			return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1')
		else
			return str;
	}

	function invertRGB_ColorStr (oldColorStr) {
		//--- Special case
		if (oldColorStr === 'transparent')   oldColorStr = 'rgb(255, 255, 255)';

		//--- Color is text in RGB format.  EG: rgb(1, 22, 255)
		var colorArray  = oldColorStr.match (/\((\d+),\s?(\d+),\s?(\d+)\)/);

		var newColorStr = $.map (colorArray, function (byte, J) {
			if (!J) return null;
			//--- Invert a decimal byte.
			return Math.abs(255 - parseInt(byte, 10) );
		}).join(',');

		return 'rgb(' + newColorStr + ')';
	}

	var DynamicStyle = function(selectorText, styleName, styleValue) {
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

	var DynamicStyleController = function() {
		var self = this;
		this.dynamicStyles = [];
		this.dynamicStylesCount = 0;

		
		this.getStyles = function($element) {
			if (!$element) $element = $("body");

			var colorRules = [];
			var processSelector = function(rule){ 
				for (var key in rule.style) {
					var style = rule.style[key];
					if (typeof (style) === "string" && key !== "cssText" && style.indexOf("rgb") !== -1){

						var test = new DynamicStyle(rule.selectorText, key, style);
						if (test.r !== undefined /*&& $element.find(escapeStr(test.selectorText)).length !== 0*/){
							var v = test.r + "," + test.g + "," + test.b;
							if (self.dynamicStyles[v] === undefined) self.dynamicStyles[v] = [];
							self.dynamicStyles[v].push(test);
							test.sortOrder = self.dynamicStylesCount;
							self.dynamicStylesCount++;
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

			}; 
			this.init = function() {
				this.getStyles();
			} 
			return this;
	};


	Deep.on("sa.theme-roller.index.render", function(){
		var styleController = new DynamicStyleController();
		styleController.init();
		console.warn("Styles initialized", styleController.dynamicStylesCount, styleController.dynamicStyles);
		for (var colorString in styleController.dynamicStyles) {
			var colorVisualDiv = $("<div/>", 
				{css: {
					"background-color": "rgb("+colorString+")",
					"color" : invertRGB_ColorStr("rgb("+colorString+")"),
					"font-weight" : "bold",
					"padding" : "11px"
				}
			});
			var styles = styleController.dynamicStyles[colorString];
			colorVisualDiv.text(colorString);
			this.$el.find("#sheet-colors").append(colorVisualDiv);
		}
	});
})(jQuery);