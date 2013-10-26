/**
	_moon.Popup_ is an <a href="#enyo.Popup">enyo.Popup</a> that appears at the
	bottom of the screen and takes up the full screen width.
*/
enyo.kind({
	name: "moon.Popup",
	kind: enyo.Popup,
	classes: "moon moon-neutral moon-popup",
	modal: true,
	floating: true,
	_spotlight: null,
	_bounds: null,
	spotlight: "container",
	handlers: {
		onSpotlightSelect: "spotSelect",
		onSpotlightUp: "spotlightUp",
		onSpotlightDown: "spotlightDown",
		onSpotlightLeft: "spotlightLeft",
		onSpotlightRight: "spotlightRight",
		onRequestScrollIntoView: "_preventEventBubble",
		ontransitionend: "animationEnd"
	},
	published: {
		/**
			Determines whether a scrim will appear when the dialog is modal.
			Note that modal scrims are transparent, so you won't see them.
		*/
		scrimWhenModal: true,
		//* Determines whether or not to display a scrim. Only displays scrims
		//* when floating.
		scrim: true,
		/**
			Optional class name to apply to the scrim. Be aware that the scrim
			is a singleton and you will be modifying the scrim instance used for
			other popups.
		*/
		scrimClassName: "",
		/**
			When true, spotlight cannot leave the constraints of the _moon.Popup_
			unless it is explicitly closed.
		*/
		spotlightModal: false,
		/**
			When false, _closeButton_ is hidden; when true, it is shown. When
			_showCloseButton_ is set to "auto" (the default), _closeButton_ is shown
			when _spotlightModal_ is true.
		*/
		showCloseButton: "auto",
		//* When true, popups will animate on/off screen
		animate: true
	},
	//* @protected
	tools: [
		{name: "client"},
		{name: "closeButton", kind: "moon.IconButton", classes: "moon-popup-close", ontap: "closePopup", spotlight: false}
	],
	statics: { count: 0 },
	defaultZ: 120,
	activator: null,
	//* Creates chrome
	initComponents: function() {
		this.createComponent({ name: "childwrapper", classes: "moon-neutral moon-popup-childwrapper", owner: this });
		this.$.childwrapper.createComponents(this.tools, {owner: this});
		this.inherited(arguments);
	},
	create: function () {
		this.inherited(arguments);
		this.animateChanged();
	},
	animateChanged: function() {
		if (this.animate) {
			this.animateShow();			
		}
		this.$.childwrapper.addRemoveClass("animate", this.animate);
		if (!this.animate) {
			this.$.childwrapper.applyStyle("top", null);
			enyo.dom.transform(this.$.childwrapper, {translateY: null});
		}
	},
	//* Renders _moon.Popup_, extending enyo.Popup
	render: function() {
		this.allowHtmlChanged();
		this.contentChanged();
		this.inherited(arguments);
		this._spotlight = this.spotlight;
	},
	rendered: function () {
		this.inherited(arguments);
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	},
	allowHtmlChanged: function() {
		this.$.client.setAllowHtml(this.allowHtml);
	},
	//* Sets _this.downEvent_ on _onSpotlightSelect_ event.
	spotSelect: function(inSender, inEvent) {
		this.downEvent = inEvent;
	},
	//* If _this.downEvent_ is set to a spotlight event, skips normal popup
	//* _tap()_ code.
	tap: function(inSender, inEvent) {
		if (!this.downEvent || (this.downEvent.type !== "onSpotlightSelect")) {
			return this.inherited(arguments);
		}
	},
	//* Determine whether to display closeButton
	configCloseButton: function() {
		if (!this.$.closeButton) {
			return;
		}
		
		if (this.showCloseButton === true || (this.spotlightModal === true && this.showCloseButton !== false)) {
			this.$.closeButton.show();
			this.$.closeButton.spotlight = true;
		} else {
			this.$.closeButton.hide();
			this.$.closeButton.spotlight = false;
		}
	},
	//* If _this.spotlightModal_ changes
	spotlightModalChanged: function() {
		this.configCloseButton();
	},
	//* If _this.showCloseButton_ changes
	showCloseButtonChanged: function() {
		this.configCloseButton();
	},
	showingChanged: function() {
		if (this.showing) {
			moon.Popup.count++;
			this.applyZIndex();
		}
		else {
			if(moon.Popup.count > 0) {
				moon.Popup.count--;
			}
			if (this.generated) {
				this.respotActivator();
			}
		}

		if (this.animate) {
			if (this.showing) {
				this.inherited(arguments);
				this.animateShow();
				this.animationEnd = enyo.nop;
			} else {
				this.animateHide();
				var args = arguments;
				this.animationEnd = enyo.bind(this, function() {
					this.inherited(args);
				});
			}
		} else {
			this.inherited(arguments);
		}
		
		this.showHideScrim(this.showing);
		if (this.showing) {
			this.activator = enyo.Spotlight.getCurrent();
			this.spotlight = this._spotlight;
			this.configCloseButton();
			var spottableChildren = enyo.Spotlight.getChildren(this).length;
			if (spottableChildren === 0) {
				this.spotlight = false;
			} else if ((this.spotlight) && (spottableChildren > 0)) {
				enyo.Spotlight.spot(enyo.Spotlight.getFirstChild(this));
			}
		}
	},
	getShowing: function() {
		//* Override default _getShowing()_ behavior to avoid setting _this.showing_ based on the CSS _display_ property
		if (this.animate) {
			return this.showing;
		} else {
			this.inherited(arguments);
		}
	},
	showHideScrim: function(inShow) {
		if (this.floating && (this.scrim || (this.modal && this.scrimWhenModal))) {
			var scrim = this.getScrim();
			if (inShow) {
				// move scrim to just under the popup to obscure rest of screen
				var i = this.getScrimZIndex();
				this._scrimZ = i;
				scrim.showAtZIndex(i);
			} else {
				scrim.hideAtZIndex(this._scrimZ);
			}
			enyo.call(scrim, "addRemoveClass", [this.scrimClassName, scrim.showing]);
		}
	},
	getScrimZIndex: function() {
		// Position scrim directly below popup
		return this.findZIndex()-1;
	},
	getScrim: function() {
		// show a transparent scrim for modal popups if scrimWhenModal is true
		// if scrim is true, then show a regular scrim.
		if (this.modal && this.scrimWhenModal && !this.scrim) {
			return moon.scrimTransparent.make();
		}
		return moon.scrim.make();
	},
	applyZIndex: function() {
		// Adjust the zIndex so that popups will properly stack on each other.
		this._zIndex = moon.Popup.count * 2 + this.findZIndex() + 1;
		// leave room for scrim
		this.applyStyle("z-index", this._zIndex);
	},
	findZIndex: function() {
		// a default z value
		var z = this.defaultZ;
		if (this._zIndex) {
			z = this._zIndex;
		} else if (this.hasNode()) {
			// Re-use existing zIndex if it has one
			z = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || z;
		}
		this._zIndex = z;
		return this._zIndex;
	},
	//* Removes focus style from closeButton & hides _moon.Popup_
	closePopup: function(inSender, inEvent) {
		if (this.$.closeButton) {
			this.$.closeButton.removeClass("pressed");
		}
		this.spotlight = false;
		this.hide();
	},
	//* Attempts to respot the _this.activator_ when _moon.Popup_ is hidden
	respotActivator: function() {
		var a = this.activator;
		// Attempt to identify and re-spot the activator if present
		if (a && a.destroyed === undefined) {
			enyo.Spotlight.spot(a);
			if (a instanceof moon.Button) {
				a.removeClass("pressed");
			}
		} else {
			// As a failsafe, attempt to spot the container if no activator is present
			enyo.Spotlight.spot(enyo.Spotlight.getFirstChild(this.container));
		}
		this.activator = null;
	},
	/**
		Check whether to allow spotlight to move to any given direction.
	*/
	spotChecker: function(inDirection) {
		var neighbor = enyo.Spotlight.NearestNeighbor.getNearestNeighbor(inDirection);
		if (!enyo.Spotlight.Util.isChild(this, neighbor)) {
			if (this.spotlightModal) {
				return true;
			} else {
				this.respotActivator();
				this.spotlight = false;
				this.hide();
			}
		}
	},
	/**
		When spotlight reaches top edge of popup, prevents user from
		continuing further.
	*/
	spotlightUp: function(inSender, inEvent) {
		return this.spotChecker("UP");
	},
	/**
		When spotlight reaches bottom edge of popup, prevents user from
		continuing further.
	*/
	spotlightDown: function(inSender, inEvent) {
		return this.spotChecker("DOWN");
	},
	/**
		When spotlight reaches left edge of popup, prevents user from
		continuing further.
	*/
	spotlightLeft: function(inSender, inEvent) {
		return this.spotChecker("LEFT");
	},
	/**
		When spotlight reaches right edge of popup, prevents user from
		continuing further.
	*/
	spotlightRight: function(inSender, inEvent) {
		return this.spotChecker("RIGHT");
	},
	//*@protected
	_preventEventBubble: function(inSender, inEvent) {
		return true;
	},
	animateShow: function () {
		this._bounds = this.getBounds();
		this.$.childwrapper.applyStyle("top", this._bounds.height + "px");
		enyo.dom.transform(this.$.childwrapper, {translateY: -this._bounds.height + "px"});
	},
	animateHide: function () {
		if (this._bounds) {
			var prevHeight = this._bounds.height;
			this._bounds = this.getBounds();
			enyo.dom.transform(this.$.childwrapper, {translateY: this._bounds.height - prevHeight + "px"});	
		}
	}
});
