(function($, Deep) {

	function getMatchedCSSRules(node) {
		var selectors = [];
		var rules = node.ownerDocument.defaultView.getMatchedCSSRules(node, "");

		if (rules){
			var i = rules.length;
			while (i--) {
				selectors.push(rules[i].selectorText);
			}
		}
		return selectors;
	}

/*	var escapeStr = function(str){
		if(str){
			return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
		} else {
			return str;
		}
	};*/

	var invertRGB_ColorStr = function(oldColorStr) {
		//--- Special case
		if (oldColorStr === "transparent")   oldColorStr = "rgb(255, 255, 255)";

		//--- Color is text in RGB format.  EG: rgb(1, 22, 255)
		var colorArray  = oldColorStr.match (/\((\d+),\s?(\d+),\s?(\d+)\)/);

		var newColorStr = $.map(colorArray, function (byte, J) {
			if (!J) return null;
			//--- Invert a decimal byte.
			return Math.abs(255 - parseInt(byte, 10) );
		}).join(",");

		return "rgb(" + newColorStr + ")";
	};

	var DynamicStyle = function(selectorText, styleName, styleValue) {
		this.selectorText = selectorText;
		this.styleName = styleName;

		var matchColors = /(\d{1,3}), (\d{1,3}), (\d{1,3})/;
		// var matchColorsRgba = /(\d{1,3}), (\d{1,3}), (\d{1,3}), (.*)/;
		var matchItems = new RegExp("^rgb((.*))$");
		//var rgbArr = [];
		var self = this;
		self.originalStyleText = styleValue;
		// try{

			this.styleText = styleValue.replace(matchItems, function (match/*, content, off , s*/){
				var test = styleValue.match(matchColors);
				self.r = parseInt(test[1],10);
				self.g = parseInt(test[2],10);
				self.b = parseInt(test[3],10);
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
			var processSelector = function(rule){
				for (var key in rule.style){
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
				}
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
				}

			}

			this.init = function() {
				this.getStyles();
			};

			return this;
	};

	var hexToRgb = function (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
	};

	var hexToRgbString = function (hex) {
		var result = hexToRgb(hex);
		return "rgb(" + result.r + "," + result.g + "," + result.b + ")";
	};
	var componentToHex = function (c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	};
	var rgbToHex = function(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	};


	var appendColorWidget = function($el, colorString, style) {
		var colorVisualDiv = $("<div/>",
			{css: {
				"background-color": "rgb("+colorString+")",
				"color" : invertRGB_ColorStr("rgb("+colorString+")"),
				"padding" : "11px"
			}
		});
		colorVisualDiv.data("style", style).html(style.selectorText + " <strong>" + style.styleName + "</strong>");
		colorVisualDiv.click(function() {
			var hexVal = prompt("Enter the new color in hexadecimal: ", "");
			if ($.trim(hexVal) !== ""){
				if (hexVal[0] !== "#") hexVal = "#" + hexVal;
				if (confirm('YES = Change only this CSS property\nNO  = Change all CSS classes and properties with the same color')) {

				} else {

				}
				var color = invertRGB_ColorStr(hexToRgbString(hexVal));
				$(this).css({
					"background-color" : hexVal,
					"color" : color
				});
			}
		});
		$el.find("#sheet-colors").append(colorVisualDiv);
	};



	Deep.on("sa.theme-roller.index.render", function(){
		var self = this;
		var styleController = new DynamicStyleController();
		styleController.init();
		console.warn("Styles initialized", styleController.dynamicStylesCount, styleController.dynamicStyles);

		// analyze each element and find dynamic style setting
		this.$el.find("*").click(function() {
			var matchedCSSRules = getMatchedCSSRules(this);
			if (matchedCSSRules.length>0){
				var rule ;
				var sheetColorsDiv = self.$el.find("#sheet-colors").html("").show();
				for (var m = 0; m < matchedCSSRules.length; m++) {
					rule = matchedCSSRules[m];
					for (var key in styleController.dynamicStyles) {
						var styles = styleController.dynamicStyles[key];
						for (var i = 0; i < styles.length; i++) {
							var style = styles[i];
							if (style.selectorText === rule || style.selectorText === rule.replace(/:focus/g, "").replace(/:hover/g, "")){
								appendColorWidget(self.$el, key, style);
							}
						}
					}
				}

				if (sheetColorsDiv.children().length === 0) {
					appendColorWidget(self.$el, "205,201,201", {selectorText:"No CSS color rules matched: ", styleName:"Maybe you want to define so CSS code?"});
					for (m = 0; m < matchedCSSRules.length; m++) {
						rule = matchedCSSRules[m];
						appendColorWidget(self.$el, "205,201,201", {selectorText:rule, styleName:"test"});
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
})(jQuery, Deep);