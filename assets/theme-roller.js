/*!
ThemeRoller JavaScript Library
Copyright Stephan Ahlf (ahlf-it.de)
https://github.com/s-a/deep-js-theme-roller
MIT and GPL licensed.
*/
;(function(window, $) {



	var currentElement = null;
	var getMatchedCSSRules = function(node) {
		var selectors = [];
		if (!node || !node.ownerDocument) return [];
		var rules = node.ownerDocument.defaultView.getMatchedCSSRules(node, "");

		if (rules){
			var i = rules.length;
			while (i--) {
				selectors.push(rules[i].selectorText);
			}
		}
		return selectors;
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
		self.styleName = styleName;



		this.styleText = styleValue.replace(matchItems, function (match/*, content, off , s*/){
			var test = styleValue.match(matchColors);
			self.r = parseInt(test[1],10);
			self.g = parseInt(test[2],10);
			self.b = parseInt(test[3],10);
			return styleValue.replace(match, "{0}");
		});


		return this;
	};

	var style = $("<style/>");
	var errorMethod = function (userValue) {
		alert("invalid__color__value: " + userValue);
	};
	var changedEvent = function() {};
	var doneEvent = function() {};
	var translateMethod = function (v) {
		return v;
	};
	style.appendTo("body");
	var DynamicStyleController = function() {
		var self = this;
		this.dynamicColorStyles = [];
		this.dynamicFontStyles = [];
		this.dynamicStylesCount = 0;



		this.applyCSS = function(){
			var result = [];
			for (var i = 0; i < colorChangeSet.length; i++) {
				var color = colorChangeSet[i];
				result.push(color.style.selectorText + "{");

				var type = color.type.split(/(?=[A-Z])/);
				for (var t = 0; t < type.length; t++) {
					type[t] = type[t].toLowerCase();
				}
				result.push(type.join("-") + ": " + color.toString() + ";");
				result.push("}");
			}
			var res = result.join("\n");
			style.html(res);
			var bgColor = $("body").css("background-color");
			var c = new Color(bgColor);
			$("#theme-roller-content").css("color", c.invertGoodReadable().toString());
			changedEvent();
		};

		this.colorWidgetItemValueChanged = function(e, reason) {
			var newColor = new Color(this.value);
			if (newColor.err){
				errorMethod(this.value);
				return false;
			} else {

				// fetch original color data which contains styleClass and property name info
				var currentColor = this.$el.data("color"); //new Color($(e.currentTarget).parent().css("background-color"), "background-color");
				newColor = currentColor.assignColor(newColor);
				this.$el.css({
					"background-color" : newColor.toString(),
					"color" : newColor.invertGoodReadable().toString()
				}).data("color", newColor);

				var colorSetupIndex = getChangeSetIndex(currentColor);
				if (colorSetupIndex === -1){
					colorChangeSet.push(newColor);
				} else {
					colorChangeSet[colorSetupIndex] = newColor;
				}
				self.applyCSS();
				this.$el.nextAll(".btn-warning:first").fadeIn();
				return true;
			}
		};

		var isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};

		this.getStyles = function($element) {

			if (!$element) $element = $("body");
			var processSelector = function(rule){
				for (var key in rule.style){
					var style = rule.style[key];
					if (typeof (style) === "string" && key !== "cssText" && $.trim(style) && !isNumber(style) ){

						var colorValues = new CSSColorRow(key, style);
						if (colorValues.count !== 0){
							var test = new DynamicStyle(rule.selectorText, key, style);
							if (test.r !== undefined /*&& foundOnPage(test.selectorText)*/){
								var v = test.r + "," + test.g + "," + test.b;
								if (self.dynamicColorStyles[v] === undefined) self.dynamicColorStyles[v] = [];
								self.dynamicColorStyles[v].push(test);
								test.sortOrder = self.dynamicStylesCount;
								self.dynamicStylesCount++;
							}
						} else {
							if (style.indexOf("font") !== -1){
								var styleValue = rule.style[style];
								if (styleValue !== "") {
									var newFontItemStyle = {rule:rule, cssPropertyName: style, cssPropertyValue: styleValue};
									self.dynamicFontStyles.push(newFontItemStyle);
								}
							}
						}
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


			// read css import rules
			for (var s = 0; s < styles.length; s++) {
				var style = styles[s];
				var rules = style.rules || style.cssRules;

				if (rules){
					for (var i = 0; i < rules.length; i++) {
						var rule = rules[i];
						var sheet = rule.styleSheet;
						if (sheet){
							var ru = sheet.rules || sheet.cssRules;
							processCss(ru);
						}
					}
				}
			}

			// read files css rules
			if (this.dynamicStylesCount === 0){
				for (var css = 0; css < styles.length; css++) {
					var cssSheet = styles[css];
					var rul = cssSheet.rules || cssSheet.cssRules;
					if (rul)
						processCss(rul);
				}
			}
		};

		this.init = function() {
			this.getStyles();
		};

		var isRelevant = function(result) {
			if (result.length === 0) return false; 
			for (var i = 0; i < result.length; i++) {
				var res = result[i];
				var name = res.style.styleName;
				if (name === "backgroundColor" || name === "color") {
					return true;
				}
			}
			return false;
		};

		this.getCSSRuleMatches = function(element) {
			var result = [];
			var matchedCSSRules = getMatchedCSSRules(element);
			if (matchedCSSRules.length>0){
				var rule ;
				// get all current rules matching this element
				for (var m = 0; m < matchedCSSRules.length; m++) {
					rule = matchedCSSRules[m];
					for (var key in this.dynamicColorStyles) {
						var styles = this.dynamicColorStyles[key];
						for (var i = 0; i < styles.length; i++) {
							var style = styles[i];
							if (style.selectorText === rule || style.selectorText === rule.replace(/:focus/g, "").replace(/:hover/g, "")){
								result.push({"el":element, "key" : key, "style": style});
							}
						}
					}
				}
			}

			if (isRelevant(result)){ 
				return result;
			} else {
				return [];
			}
		};

		this.getCSSFontRuleMatches = function(element) {
			var result = [];
			var matchedCSSRules = getMatchedCSSRules(element);
			if (matchedCSSRules.length>0){
				var rule ;
				// get all current rules matching this element
				for (var m = 0; m < matchedCSSRules.length; m++) {
					rule = matchedCSSRules[m];
					for (var i = 0; i < this.dynamicFontStyles.length; i++) {
						var style = this.dynamicFontStyles[i];
						if (style.rule.selectorText === rule || style.rule.selectorText === rule.replace(/:focus/g, "").replace(/:hover/g, "")){
							result.push({"el":element, "style": style});
						}
					}

				}
			}
			return result;
		};

		this.getParentMatches = function  (elem) {
			if (!elem) return [];
			var e = $(elem).parent().get(0);
			var s = this.getCSSRuleMatches(e);

			if (s.length === 0) {
				return this.getParentMatches(e);
			} else {
				return s;
			}
		};

		this.getParentFontMatches = function  (elem) {
			if (!elem) return [];
			var e = $(elem).parent().get(0);
			var s = this.getCSSFontRuleMatches(e);

			if (s.length === 0) {
				return this.getParentFontMatches(e);
			} else {
				return s;
			}
		};

		return this;
	};

	var Color = function(colorValue, colorType) {

		this.type = colorType;

		this.equal = function(color) {
			return ( this.r === color.r && this.g === color.g && this.b === color.b );
		};

		this.assignColor = function(color) {
			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			this.a = color.a;
			this.colorString = color.colorString || this.colorString;
			return this;
		};

		this.parseRGB = function(colorString) {

			if (colorString === "transparent")   colorString = "rgb(255, 255, 255)";
			var colorArray  = colorString.match (/\((\d+)\s?,\s?(\d+)\s?,\s?(\d+),?\s?((\.\d+|\d+\.\d+))?\)/);

			var result = colorArray ? {
				r: parseInt(colorArray[1], 10),
				g: parseInt(colorArray[2], 10),
				b: parseInt(colorArray[3], 10),
				a: parseFloat(colorArray[4])
			} : null;

			colorString = colorString.replace(/(\d+)/, "{r}");
			colorString = colorString.replace(/(\d+)/, "{g}");
			colorString = colorString.replace(/(\d+)/, "{b}");
			colorString = colorString.replace(/(\.\d+|\d+\.\d+)/, "{a}");
			this.colorString = colorString;
			return result;
		};

		this.getColorFromName = function(name) {
			var rgb,
			tmp = document.body.appendChild(document.createElement("div"));

			tmp.style.backgroundColor = name.toLowerCase();
			rgb = window.getComputedStyle(tmp, null).backgroundColor;
			this.colorString = rgb;
			var color = this.parseRGB(this.colorString);

			if (!color || !color.r || color.r===0 && color.g===0 && color.b===0 && this.colorString !== "black"){
				return null;
			} else {
				return color;
			}
		};

		this.normalizeHexValue = function(hex) {
			var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			var result = null;
			if (res){
				result = hex;
			} else {
				result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec("#"+hex);
				if (result) result = "#" + hex;
			}
			return result;
		};

		this.hexToRgb = function (hex) {
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
		/*
		this.hexToRgbString = function (hex) {
			var result = this.hexToRgb(hex);
			return "rgb(" + result.r + "," + result.g + "," + result.b + ")";
		};*/

		this.componentToHex = function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		};

		this.hex = function() {
			return "#" + this.componentToHex(this.r) + this.componentToHex(this.g) + this.componentToHex(this.b);
		};


		this.invertGoodReadable = function() {
			var result = new Color("#ffffff", this.colorType);
			if (((this.r + this.b + this.g) / 3) > 128) {
				result.initializeBy("#000000");
			}
			return result;
		};

		this.lum = function(lum) {
			var hex = ColorLuminance(this.hex(), 0)
			hex = ColorLuminance(hex, lum);
			var newColor = new Color(hex);
			this.assignColor(newColor);
		};

		var ColorLuminance= function(hex, lum) {

			// validate hex string
			hex = String(hex).replace(/[^0-9a-f]/gi, '');
			if (hex.length < 6) {
				hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
			}
			lum = lum || 0;

			// convert to decimal and change luminosity
			var rgb = "#", c, i;
			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i*2,2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
				rgb += ("00"+c).substr(c.length);
			}

			return rgb;
		}

		this.toString = function() {
			var rgbValueString = "" ;
			if (this.colorString){
				result = this.colorString;
				result = result.replace("{r}", this.r);
				result = result.replace("{g}", this.g);
				result = result.replace("{b}", this.b);
				result = result.replace("{a}", this.a);
				if (result.indexOf("rgb") === -1){
					if (this.a){
						result = "rgba" + result;
					} else {
						result = "rgb" + result;
					}
				}
			} else {
				if (this.a){
					result = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
				} else {
					result = "rgb(" + this.r + "," + this.g + "," + this.b + ")";
				}
			}
			return result;
		};

		this.initializeByNativeColorType = function(c) {
			this.r = c.r;
			this.g = c.g;
			this.b = c.b;
			this.a = c.a;
			this.err = false;
		};

		this.initializeBy = function(colorValue) {
			var color = colorValue;
			if (color.r === undefined){
				// try to parse hexadecimal.
				color = this.normalizeHexValue(color);
				if (color === null){
					// try to parse rgb.
					color = this.parseRGB(colorValue);
					if (color === null){
						// try get color by name string
						color = this.getColorFromName(colorValue);
					}
				} else {
					// parse hex
					color = this.hexToRgb(color);
				}
			}
			if (color) this.initializeByNativeColorType(color);
		};
		this.err = true;
		this.initializeBy(colorValue);

		return this;
	};

	var colorChangeSet = [];
	remove = function(arr, from, to) {
		var rest = arr.slice((to || from) + 1 || arr.length);
		arr.length = from < 0 ? arr.length + from : from;
		return arr.push.apply(arr, rest);
	};
	var getChangeSetIndex = function(compareColor) {
		var result = -1;
		for (var i = 0; i < colorChangeSet.length; i++) {
			var color = colorChangeSet[i];
			if (color.style.selectorText === compareColor.style.selectorText && color.type === compareColor.type){
				result = i;
				break;
			}
		}
		return result;
	};

	var CSSColorRow = function(styleName, cssText) {

		var currentColorIndex = 0;
		var parsed = false;

		this.oldString = this.newString = cssText;
		this.colors = [];
		this.styleName = styleName;

		var parse = function(row) {
			var colorArray  = row.newString.match (/\((\d+)\s?,\s?(\d+)\s?,\s?(\d+),?\s?(\.\d+|\d+\.\d+)?\)+/);
			if (colorArray){
				var color = new Color({
					r:colorArray[1],
					g:colorArray[2],
					b:colorArray[3],
					a:colorArray[4],
				}, styleName);

				var newColor = new Color(colorArray[0], styleName); // parse again to hold the original css text format
				row.colors.push(newColor);
				row.newString = row.newString.replace(newColor.toString(),"{"+currentColorIndex+"}");
				currentColorIndex++;
			} else {
				parsed = true;
			}
		};

		while(!parsed) parse(this);

		this.toString = function() {
			var result = this.newString;
			for (var i = 0; i < this.colors.length; i++) {
				var color = this.colors[i];
				result = result.replace("{"+i+"}", color.toString());
			}

			return result;
		};
		this.count = currentColorIndex;
		return this;
	};


	var renderColorWidget = function(colors, $el, colorString, style, styleController) {
		var $sheetColorsContainer = $el;
		var c = colors.toString();
		var ColorVisualDiv = function  (c) {
			return $("<div/>",{
				class : "style-selector-item",
				css: {
					// "background-color": style.originalStyleText,
					// "color" : (new Color(style.originalStyleText, "?")).invertGoodReadable().toString(),
					//"padding" : "11px"
				}/*,
				click: widgetItemClick*/
			}).hide();
		};

		style.selector = $('<div/>').text(style.selectorText).html();

		var text = '<div class="theme-roller-style-container style-selector-text" title="' + style.selector + '">' + style.selectorText + "</div> <div class='theme-roller-style-container style-selector-text'><strong>" + style.styleName + "</strong> (" + style.originalStyleText + ")</div><br>";
		var colorVisualDiv = new ColorVisualDiv(colorString).data("style", style).html(text);

		$sheetColorsContainer.append(colorVisualDiv);
		var renderedElements = [];
		for (var cc = 0; cc < colors.colors.length; cc++) {
			var color = colors.colors[cc];
			color.style = style;

			var previousChangedColorIndex = getChangeSetIndex(color);
			var lessDarkerButton = $('<input type="button" class="btn btn-xs btn-default" value="' + translateMethod("brighter") + '">');
			var darkerButton = $('<input type="button" class="btn btn btn-xs btn-primary" value="' + translateMethod("darker") + '">');
			var resetButton = $('<input type="button" class="btn btn-xs btn-warning" value="' + translateMethod("reset") + '">').hide();
			resetButton.click(function() {
				remove(colorChangeSet, previousChangedColorIndex);
				styleController.applyCSS();
				currentElement.click();
			});

			var hexValueView = $('<span class="label label-inverse">' + color.hex() + '</span>');

			var lum = function(lum) {
				var colorSetupIndex = getChangeSetIndex(color);

				color.lum(lum);
				if (colorSetupIndex !== -1) {
					colorChangeSet[colorSetupIndex] = color;
				} else {
					colorChangeSet.push(color);
				}
				colorInputElement.userInput('setValue', color.toString()).data("color",color).css({
					"background-color": color.toString(),
					"color" : color.invertGoodReadable().toString()
				});
				hexValueView.text(color.hex());
				styleController.applyCSS();
				resetButton.fadeIn();
			};

			darkerButton.click(function() {
				lum(-.1); return false;
			});
			lessDarkerButton.click(function() {
				lum(.1); return false;
			});
			if ( previousChangedColorIndex !== -1 ){

				var previousChangedColor = colorChangeSet[previousChangedColorIndex];
				color.assignColor(previousChangedColor);
				resetButton.fadeIn();
			}
			colorVisualDiv.append(lessDarkerButton);
			colorVisualDiv.append(darkerButton);

			var template = '<a class="theme-roller-style-container">' + color.toString() + '</a>';
			var colorInputElement = $(template);
			colorInputElement.data("color", color).css({
				"background-color": color.toString(),
				"color" : color.invertGoodReadable().toString(),
				"margin-right" : "5px"
					//"padding" : "11px"
			});

			colorInputElement.userInput({
				on : {
					change : styleController.colorWidgetItemValueChanged
				},
				msg : translateMethod("Please enter a color value")
			});

			colorVisualDiv.append(colorInputElement);
			colorVisualDiv.append(hexValueView);
			colorVisualDiv.append(resetButton);

		}

		colorVisualDiv.fadeIn();
	};

	var renderFontWidget = function(targetElement, fontStyle) {

		var FontVisualDiv = function  (c) {
			return $("<div/>",{
				class : "style-selector-item",
				css: {
					// "background-color": style.originalStyleText,
					// "color" : (new Color(style.originalStyleText, "?")).invertGoodReadable().toString(),
					//"padding" : "11px"
				}/*,
				click: widgetItemClick*/
			}).hide();
		};
		var text = '<div class="theme-roller-style-container style-selector-text" title="' + fontStyle.style.rule.selectorText + '">'  + fontStyle.style.rule.selectorText + "{" + fontStyle.style.cssPropertyName + ": " + fontStyle.style.cssPropertyValue +  "}</div><br>";
		var fontVisualDiv = new FontVisualDiv().data("style", fontStyle).html(text);
		$themeRollerFontsContent.append(fontVisualDiv);
		fontVisualDiv.fadeIn();
	};

	var $themeRollerFontsContent;
	var ThemeRoller = function() {

		var self = this;
		var renderColorWidgets = function(target, styleRules) {
			styleRules = _.uniq(styleRules,function(item, key, a){
				var style = item.style;
				return style.selectorText+style.styleName+style.originalStyleText;
			})
			styleRules = _.uniq(styleRules, false);
			for (var i = 0; i < styleRules.length; i++) {
				var r = styleRules[i];
				r.style.selectorText = r.style.selectorText;// + " - " + r.style.sortOrder; // + (styleRules.length>0 ? " < " + styleRules[0].style.selectorText + " &#8476; " + styleRules[0].el.nodeName : "");

				var colors = new CSSColorRow(r.style.styleName, r.style.originalStyleText);
				renderColorWidget(colors, target, r.key, r.style, self.styleController);
			}
		};

		var renderFontWidgets = function(target, styleRules) {
			for (var i = 0; i < styleRules.length; i++) {
				renderFontWidget(target, styleRules[i]);
			}
		};


		var inspectElement = function(e) {
			$("#theme-roller-colors-content").empty();
			$themeRollerFontsContent.empty();
			self.lookAt(this);
			return false;
		};
		this.$elements;

		this.off = function($elements) {
			this.$elements.unbind("click", inspectElement);
		}

		this.on = function() {
		 	this.$elements = $("body *[class]:not(#theme-roller, #theme-roller *)");
			$themeRollerFontsContent = $("#theme-roller-fonts-content");
			this.$elements.bind("click", inspectElement);
		};

		this.refresh = function(){
			if (currentElement) currentElement.click();
		};



		this.lookAt = function(element) {
			currentElement = element;
			var styleRules = this.styleController.getCSSRuleMatches(element);
			if (styleRules.length === 0) styleRules = this.styleController.getParentMatches(element);
			renderColorWidgets($("#theme-roller-colors-content"), styleRules);

			styleRules = this.styleController.getCSSFontRuleMatches(element);
			if (styleRules.length === 0) styleRules = this.styleController.getParentFontMatches(element);
			renderFontWidgets($themeRollerFontsContent, styleRules);
		};

		this.init = function(containerElement, options) {
			options = options || {};
			if (options.error) errorMethod = options.error;
			if (options.change) changedEvent = options.change;
			if (options.done) doneEvent = options.done;
			if (options.translate) translateMethod = options.translate;
			this.$el = $(containerElement);
			if (this.styleController.dynamicStylesCount === 0) this.styleController.init();
			doneEvent();
		};

		this.styleController = new DynamicStyleController();
		this.styleController.init();
		return this;
	};

		window.ThemeRoller = new ThemeRoller();
		if ( typeof define === "function" && define.amd ) {
			define( "themeRoller", [], function () { return new ThemeRoller(); } );
		}


})( window, jQuery );