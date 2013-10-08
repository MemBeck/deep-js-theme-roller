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

	var style = $("<style/>");
	var errorMethod = function (userValue) {
		alert("invalid__color__value: " + userValue);
	};
	var translateMethod = function (v) {
		return v;
	};
	style.appendTo("body");
	var DynamicStyleController = function() {
		var self = this;
		this.dynamicStyles = [];
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
		};

		this.colorWidgetItemValueChanged = function(e, reason) {

				if(reason === 'save' /*|| reason === 'cancel'*/) {
					var $e = $(e.currentTarget);
					var userValue = $(e.currentTarget).text();
					var newColor = new Color(userValue);
					if (newColor.err){
						errorMethod(userValue);
					} else {

						// fetch original color data which contains styleClass and property name info
						var currentColor = $e.data("color"); //new Color($(e.currentTarget).parent().css("background-color"), "background-color");
						newColor = currentColor.assignColor(newColor);
						$e.parent().parent().children().each(function() {
							var c = $(this).find("a").data("color"); // new Color(colorStr, "background-color");
							if (c.equal(currentColor)){
								// apply color change!
								$e.editable('setValue', newColor.toString());

								$(this).css({
									"background-color" : newColor.toString(),
									"color" : newColor.invertGoodReadable().toString()
								}).data("color", newColor);

								var colorSetupIndex = getChangeSetIndex(currentColor);
								if (colorSetupIndex === -1){
									colorChangeSet.push(newColor);
								} else {
									colorChangeSet[colorSetupIndex] = newColor;
								}
							}
						});
						self.applyCSS();


						currentElement.click();
					}
				}
		};


		this.getStyles = function($element) {

			if (!$element) $element = $("body");
			var processSelector = function(rule){
				for (var key in rule.style){
					var style = rule.style[key];

						// {

					if (typeof (style) === "string" && key !== "cssText" && $.trim(style) !== ""){
						var colorValues = new CSSColorRow(key, style);
						if (colorValues.count !== 0){



							var test = new DynamicStyle(rule.selectorText, key, style);
							if (test.r !== undefined /*&& foundOnPage(test.selectorText)*/){
								var v = test.r + "," + test.g + "," + test.b;
								if (self.dynamicStyles[v] === undefined) self.dynamicStyles[v] = [];
								self.dynamicStyles[v].push(test);
								test.sortOrder = self.dynamicStylesCount;
								self.dynamicStylesCount++;
							}

							test.val();
						}
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
			if (this.dynamicStylesCount === 0)
				for (var css = 0; css < styles.length; css++) {
					var cssSheet = styles[css];
					var rul = cssSheet.rules || cssSheet.cssRules;
					if (rul)
						processCss(rul);
				}
			};

			this.init = function() {
				this.getStyles();
			};

			this.getCSSRuleMatches = function(element) {
				var result = [];
				var matchedCSSRules = getMatchedCSSRules(element);
				if (matchedCSSRules.length>0){
					var rule ;
				// get all current rules matching this element
				for (var m = 0; m < matchedCSSRules.length; m++) {
					rule = matchedCSSRules[m];
					for (var key in this.dynamicStyles) {
						var styles = this.dynamicStyles[key];
						for (var i = 0; i < styles.length; i++) {
							var style = styles[i];
							if (style.selectorText === rule || style.selectorText === rule.replace(/:focus/g, "").replace(/:hover/g, "")){
								result.push({"el":element, "key" : key, "style": style});
							}
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
			this.colorString = color.colorString;
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

		this.rgbToHex = function(r, g, b) {
			return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
		};


		this.invertGoodReadable = function() {
			var result = new Color("#ffffff", this.colorType);
			if (((this.r + this.b + this.g) / 3) > 128) {
				result.initializeBy("#000000");
			}

			return result;
		};


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


	var render = function(colors, $el, colorString, style, styleController) {
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
		colorVisualDiv = new ColorVisualDiv(colorString).data("style", style).html(text);

		$sheetColorsContainer.append(colorVisualDiv);

		for (var cc = 0; cc < colors.colors.length; cc++) {
			var color = colors.colors[cc];
			color.style = style;

			var previousChangedColorIndex = getChangeSetIndex(color);
			if ( previousChangedColorIndex !== -1 ){
				var resetButton = $('<input type="button" class="btn btn-mini btn-warning" value="' + translateMethod("reset") + '">');
				colorVisualDiv.append(resetButton);
				var previousChangedColor = colorChangeSet[previousChangedColorIndex];
				color.assignColor(previousChangedColor);
				resetButton.click(function() {
					remove(colorChangeSet, previousChangedColorIndex);
					styleController.applyCSS();
					currentElement.click();
				});
			}

			var template = Handlebars.compile('<a class="theme-roller-style-container">' + color.toString() + '</a>');


			var renderedTemplate = $(template(color)).editable({

			}).on('hidden', styleController.colorWidgetItemValueChanged).data("color", color).css({
					"background-color": color.toString(),
					"color" : color.invertGoodReadable().toString(),
					"margin-right" : "5px"
					//"padding" : "11px"
			});

			colorVisualDiv.append(renderedTemplate);
		}

		colorVisualDiv.fadeIn();
	};


	var ThemeRoller = function() {

		var self = this;
		var renderColorWidgets = function(target, styleRules) {
			for (var i = 0; i < styleRules.length; i++) {
				var r = styleRules[i];
				r.style.selectorText = r.style.selectorText;// + " - " + r.style.sortOrder; // + (styleRules.length>0 ? " < " + styleRules[0].style.selectorText + " &#8476; " + styleRules[0].el.nodeName : "");

				var colors = new CSSColorRow(r.style.styleName, r.style.originalStyleText);
				render(colors, target, r.key, r.style, self.styleController);
			}
		};


		this.listen = function($elements) {
			$elements.click(function() {
				$("#sheet-colors-content").empty();
				self.lookAt(this);
				return false;
			});
		};

		this.lookAt = function(element) {
			currentElement = element;
			var styleRules = this.styleController.getCSSRuleMatches(element);
			if (styleRules.length === 0) styleRules = this.styleController.getParentMatches(element);
			renderColorWidgets($("#sheet-colors-content"), styleRules);
		};

		this.init = function(containerElement, options) {
			options = options || {};
			if (options.error) errorMethod = options.error;
			if (options.translate) translateMethod = options.translate;
			this.$el = $(containerElement);
			this.styleController.init();
		};

		this.styleController = new DynamicStyleController();
		this.styleController.init();

		return this;
	};


	// Otherwise expose jQuery to the global object as usual
	window.ThemeRoller = new ThemeRoller();

	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "themeRoller", [], function () { return new ThemeRoller(); } );
	}


})( window, jQuery );