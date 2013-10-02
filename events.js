(function() {

	function getMatchedCSSRules(node) {
		var selectors = [];
		var rules = node.ownerDocument.defaultView.getMatchedCSSRules(node, '');

		if (rules){
			var i = rules.length;
			while (i--) {
				selectors.push(rules[i].selectorText);
			}
		}
		return selectors;
	}

	var escapeStr = function(str){
		if( str)
			return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1')
		else
			return str;
	};

	var invertRGB_ColorStr = function(oldColorStr) {
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
	};

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
			var foundOnPage = function(selectorText) {
				if ($element.find(escapeStr(selectorText)).length>0){
					return true;
				} else {
					console.warn(selectorText, " not found");
				}
				sel = selectorText.split(",");
				for (var i = 0; i < sel.length; i++) {
					if ($element.find(escapeStr(sel[i])).length > 0){
						return true;
					}
				}
				return false;
			};

			var processSelector = function(rule){ 
				for (var key in rule.style) {
					var style = rule.style[key];
					if (typeof (style) === "string" && key !== "cssText" && style.indexOf("rgb") !== -1){

						var test = new DynamicStyle(rule.selectorText, key, style);
						if (test.r !== undefined /*&& foundOnPage(test.selectorText)*/){
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
			};

			return this;
	};


	Deep.on("sa.theme-roller.index.render", function(){
		var styleController = new DynamicStyleController();
		styleController.init();
		console.warn("Styles initialized", styleController.dynamicStylesCount, styleController.dynamicStyles);
		/*for (var colorString in styleController.dynamicStyles) {
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
		}*/

		// analyze each element and find dynamic style setting
		this.$el.find("*").click(function() {
			var matchedCSSRules = getMatchedCSSRules(this);
			if (matchedCSSRules.length>0){
				for (var key in styleController.dynamicStyles) {
					var styles = styleController.dynamicStyles[key];
					for (var i = 0; i < styles.length; i++) {
						var style = styles[i];
						if (style.selectorText === matchedCSSRules[0]){
							debugger;
						}
					}
				}
				console.log(matchedCSSRules,  this, $(this).css("background-color"));
			}
			return false;
		});
/*		$("*").each(function() {
			var matchedCSSRules = getMatchedCSSRules(this);
			// matched rule found! Find the dynammic css rule for this match.
			if (matchedCSSRules.length>0){
				for (var i = 0; i < styleController.dynamicStyles.length; i++) {
					style = styleController.dynamicStyles[i];
					debugger;
				};
				console.log(matchedCSSRules,  this, $(this).css("background-color"));
			}
		});*/
	});
})(jQuery);