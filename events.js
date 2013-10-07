(function($, Deep) {


	var styleController = null;
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
	style.appendTo("body");
	var DynamicStyleController = function() {
		var self = this;
		this.dynamicStyles = [];
		this.dynamicStylesCount = 0;

		this.applyCSS = function(){
			var result = [];
			result.push("<style>");
			for (var i = 0; i < colorChangeSet.length; i++) {
				var color = colorChangeSet[i];
				result.push(color.style.selectorText + "{");
					result.push(color.type + ": " + color.toString() + ";");
				result.push("}");
			}
			result.push("</style>");
			var res = $(result.join("\n"));
			style.html(res);
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
					for (var key in styleController.dynamicStyles) {
						var styles = styleController.dynamicStyles[key];
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

		var colorWidgetItemValueChanged = function(e, reason) {
			if(reason === 'save' /*|| reason === 'cancel'*/) {
				var $e = $(e.currentTarget);
				var userValue = $(e.currentTarget).text();
				var newColor = new Color(userValue);
				if (newColor.err){
					Deep.Web.UI.msg({type: "error", msg: Deep.translate("invalid__color__value",userValue )});
				} else {
					// fetch original color data which contains styleClass and property name info
					var originalColorData = $e.data("color");
					originalColorData.assignColor(newColor);
					var currentColor = new Color($(e.currentTarget).parent().css("background-color"), "background-color");
					$e.editable('setValue', originalColorData.toString());
					$e.parent().parent().children().each(function() {
						var colorStr = $(this).css("background-color");
						var c = new Color(colorStr, "background-color");
						if (currentColor.equal(c))
							$(this).css({
								"background-color" : originalColorData.toString(),
								"color" : originalColorData.invertGoodReadable().toString()
							});
					});
					colorChangeSet.push(originalColorData);
					styleController.applyCSS();
				}
			}
		};

		var render = function(colors, $el, colorString, style) {
			var $sheetColorsContainer = $el.find("#sheet-colors-content");
			var c = colors.toString();
			var ColorVisualDiv = function  (c) {
				return $("<div/>",{
					class : "style-selector-item",
					css: {
						"background-color": style.originalStyleText,
						"color" : (new Color(style.originalStyleText, "?")).invertGoodReadable().toString(),
						"padding" : "11px"
				}/*,
				click: widgetItemClick*/
				}).hide();
			};

			style.selector = $('<div/>').text(style.selectorText).html();

			var text = '<div class="theme-roller-style-container style-selector-text" title="' + style.selector + '">' + style.selectorText + "</div> <div class='theme-roller-style-container style-selector-text'>" + style.styleName + " (" + style.originalStyleText + ")</div><br>";
			colorVisualDiv = new ColorVisualDiv(colorString).data("style", style).html(text);
			$sheetColorsContainer.append(colorVisualDiv);

			for (var cc = 0; cc < colors.colors.length; cc++) {
				var color = colors.colors[cc];
				color.style = style;
				var template = Handlebars.compile('<a class="theme-roller-style-container">' + color.toString() + '</a>');

				var renderedTemplate = $(template(color)).editable({

				}).on('hidden', colorWidgetItemValueChanged).data("color", color);

				colorVisualDiv.append(renderedTemplate);
			}

			colorVisualDiv.fadeIn();
		};

		var getParentMatches = function  (elem) {
			if (!elem) return [];
			var e = $(elem).parent().get(0);
			var s = styleController.getCSSRuleMatches(e);

			if (s.length === 0) {
				return getParentMatches(e);
			} else {
				return s;
			}
		};

		var commandStartIntro = function(){

			var intro = Deep.Intro({
				steps: [
				{
					element: '#sheet-colors',
					intro: "help__text__1",
					position: 'left'
				},
				{
					element: '#theme-roller-source',
					intro: "help__text__2",
					position: 'right'
				},
				{
					element: '#sheet-colors-header-title',
					intro: "help__text__3",
					position: 'left'
				}
				]
			}).onchange(function function_name (targetElement) {
				if ($(targetElement).attr("id") === "theme-roller-source"){
					window.setTimeout(function () {
						$(targetElement).trigger("click");
						intro.refresh();
					},1500);
				}
			}).start();
		};

		var initializeMenu = function($el) {
			$el.find("#theme-roller-help, a.help").click(function() {
				commandStartIntro();
				return false;
			});

			var $contentArea = $el.find("#sheet-colors-content");
			$el.find("a.minimize").kick(
				function(){
					$(this).text(Deep.translate("Maximize")).toggleClass("active");
					$contentArea.slideUp();
					return false;
				},
				function(){
					$(this).text(Deep.translate("Minimize")).toggleClass("active");
					$contentArea.slideDown();
					return false;
				}
				);

			$el.find("a.save").click(function() {
				if ($(this).hasClass("disabled") || $(this).attr("disabled") === "disabled") return false;
				alert("not implemented yet");
				return false;
			});

			$el.find("a.undo").click(function() {
				if ($(this).hasClass("disabled") || $(this).attr("disabled") === "disabled") return false;
				alert("not implemented yet");
				return false;
			});

			$el.find("a.share").click(function() {
				if ($(this).hasClass("disabled") || $(this).attr("disabled") === "disabled") return false;
				alert("not implemented yet");
				return false;
			});

			$el.find("a.reset").click(function() {
				if ($(this).hasClass("disabled") || $(this).attr("disabled") === "disabled") return false;
				alert("not implemented yet");
				return false;
			});
		};

		styleController = new DynamicStyleController();
		styleController.init();
		Deep.on("sa.theme-roller.index.render", function(){

			var self = this;
			var $el = this.$el;
			console.log("Styles initialized", styleController.dynamicStylesCount, styleController.dynamicStyles);
			initializeMenu($el);
			// analyze each element and find dynamic style setting
			$el.find("*:not(#sheet-colors):not(#sheet-colors *)").filter(":not(#theme-roller-help)").click(function() {
				$el.find("#sheet-colors-content").empty();
				var styleRules = styleController.getCSSRuleMatches(this);
				var renderColorWidgets = function(styleRules) {
					for (var i = 0; i < styleRules.length; i++) {
						var r = styleRules[i];
						r.style.selectorText = r.style.selectorText;// + " - " + r.style.sortOrder; // + (styleRules.length>0 ? " < " + styleRules[0].style.selectorText + " &#8476; " + styleRules[0].el.nodeName : "");

						var colors = new CSSColorRow(r.style.styleName, r.style.originalStyleText);
						render(colors, $el, r.key, r.style);


					}
				};

				if (styleRules.length === 0) styleRules = getParentMatches(this);

				renderColorWidgets(styleRules);

				return false;
			});
		});
})(jQuery, window.Deep);