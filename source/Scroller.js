
enyo.kind({
	name: "moon.Scroller",
	kind: "enyo.Scroller",
	spotlight: "container",
	published: {
		//* Percent of scroller client area to jump when paging
		pagePercent: 40,
		//* Hide the paging controls if a key is pressed (5 way mode)
		hidePagingOnKey: true,
		//* Only show the paging controls if user is hovering the pointer above this control
		hoverPagingOnly: true
	},
	horizonalPageControls: [
		{name: "pageLeftControl", kind: "moon.PagingControl", side: "left"},
		{name: "pageRightControl", kind: "moon.PagingControl", side: "right"}
	],
	verticalPageControls: [
		{name: "pageUpControl", kind: "moon.PagingControl", side: "top"},
		{name: "pageDownControl", kind: "moon.PagingControl", side: "bottom"}
	],
	// Are the page controls currently hidden
	pageControlsHidden: true,	
	// Is the pointer hovering over this control
	hovering: false,
	components: [
		{kind: "Signals", onSpotlightModeChanged: "spotlightModeChanged"}
	],
	handlers: {
		onSpotlightFocused: "spotFocused",
		onRequestScrollIntoView: "requestScrollIntoView",
		onScrollStop: "updatePageControls",
		onenter: "enter",
		onleave: "leave",
		onPaginate: "paginate"
	},
	create: function() { 
		this.inherited(arguments);
	},
	initComponents: function() {
		this.createPageControls();
		this.inherited(arguments);
	},
	createPageControls: function() {
		if(this.getHorizontal() !== "hidden") {
			this.createChrome(this.horizonalPageControls);
		}
		if(this.getVertical() !== "hidden") {
			this.createChrome(this.verticalPageControls);
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.updatePageControls();
	},
	spotFocused: function(inSender, inEvent) {
		if (inEvent.originator === this) {
			return;
		}
		
		if (!this.$.strategy.isInView(inEvent.originator.hasNode())) {
			this.animateToControl(inEvent.originator);
		}
	},
	requestScrollIntoView: function(inSender, inEvent) {
		this.animateToControl(inEvent.originator);
		return true;
	},
	updatePageControls: function() {
		if (this.pageControlsHidden) {
			return;
		}
		
		if (this.getHorizontal() !== "hidden") {
			this.updateHorizontalPageControls();
		}
		
		if (this.getVertical() !== "hidden") {
			this.updateVerticalPageControls();
		}
	},
	updateHorizontalPageControls: function() {
		var sb = this.getScrollBounds();
		
		// Hide horizontal controls if no room to scroll
		if (sb.clientWidth >= sb.width) {
			this.$.pageLeftControl.hide();
			this.$.pageRightControl.hide();
			return;
		}
		
		this.showHidePageControls(this.getScrollLeft(), sb.maxLeft, this.$.pageLeftControl, this.$.pageRightControl);
	},
	updateVerticalPageControls: function() {
		var sb = this.getScrollBounds();
		
		// Hide vertical controls if no room to scroll
		if (sb.clientHeight >= sb.height) {
			this.$.pageUpControl.hide();
			this.$.pageDownControl.hide();
			return;
		}
		
		this.showHidePageControls(this.getScrollTop(), sb.maxTop, this.$.pageUpControl, this.$.pageDownControl);
	},
	showHidePageControls: function(inPos, inBoundary, inControlBack, inControlForward) {
		// If we are beyond the back edge, show and position back control
		if (!inControlBack.getShowing() && (inPos > 0)) {
			inControlBack.show();
			this.positionPageControl(inControlBack);
		} else if (inPos === 0) {
			inControlBack.hide();
		}
		
		// If we are beyond the forward edge, show and position forward control
		if (!inControlForward.getShowing() && (inPos < inBoundary)) {
			inControlForward.show();
			this.positionPageControl(inControlForward);	
		} else if (inPos === inBoundary) {
			inControlForward.hide();
		}
	},
	//* Position _inControl_ based on it's _side_ value (top, right, bottom, or left)
	positionPageControl: function(inControl) {
		var sb = this.getScrollBounds(),
			cb = inControl.getBounds(),
			side = inControl.getSide(),
			attribute,
			position;
		
		if (side === "top" || side === "bottom") {
			attribute = "left";
			position = sb.clientWidth/2 - cb.width/2;
		} else {
			attribute = "top";
			position = sb.clientHeight/2 - cb.height/2;
		}
		
		inControl.applyStyle(attribute,position+"px");
	},
	enter: function(){
		if (this.hoverPagingOnly) {
			this.pageControlsHidden = false;
			this.hovering = true;
			this.updatePageControls();
		}
	},
	leave: function(){
		if (this.hoverPagingOnly) {
			this.hovering = false;
			this.hidePageControls();
		}
	},
	hidePageControls: function() {
		this.pageControlsHidden = true;
		this.$.pageUpControl.hide();
		this.$.pageDownControl.hide();
		this.$.pageLeftControl.hide();
		this.$.pageRightControl.hide();
	},
	animateToControl: function(inControl) {
		var controlBounds = inControl.getAbsoluteBounds(),
			absoluteBounds = this.getAbsoluteBounds(),
			scrollBounds = this.$.strategy.getScrollBounds(),
			offsetTop = controlBounds.top - absoluteBounds.top,
			offsetLeft = controlBounds.left - absoluteBounds.left,
			offsetHeight = controlBounds.height,
			offsetWidth = controlBounds.width,
			xDir,
			yDir,
			x,
			y;
		
		// 0: currently visible, 1: right of viewport, -1: left of viewport
		xDir = (offsetLeft >= scrollBounds.left && offsetLeft + offsetWidth <= scrollBounds.left + scrollBounds.clientWidth)
			?	0
			:	offsetLeft - scrollBounds.left > 0 ? 1 : offsetLeft - scrollBounds.left < 0 ? -1 : 0;
		// 0: currently visible, 1: below viewport, -1: above viewport
		yDir = (offsetTop >= scrollBounds.top && offsetTop + offsetHeight <= scrollBounds.top + scrollBounds.clientHeight)
			?	0
			:	offsetTop - scrollBounds.top > 0 ? 1 : offsetTop - scrollBounds.top < 0 ? -1 : 0;
		
		switch (xDir) {
			case 0:
				x = this.getScrollLeft();
				break;
			case 1:
				x = (offsetWidth > scrollBounds.clientWidth) ? offsetLeft : offsetLeft - scrollBounds.clientWidth + offsetWidth;
				break;
			case -1:
				x = offsetLeft;
				break;
		}
		
		switch (yDir) {
			case 0:
				y = this.getScrollTop();
				break;
			case 1:
				y = (offsetHeight > scrollBounds.clientHeight) ? offsetTop : offsetTop - scrollBounds.clientHeight + offsetHeight;
				break;
			case -1:
				y = offsetTop;
				break;
		}
		
		// If x or y changed, scroll to new position
		if (x !== this.getScrollLeft() || y !== this.getScrollTop()) {
			this.scrollTo(x,y);
		}
	},
	spotlightModeChanged: function(inSender, inEvent) {
		if (inEvent.pointerMode && (!this.hoverPagingOnly || this.hovering)) {
			this.pageControlsHidden = false;
			this.updatePageControls();	
		} else if (this.hidePagingOnKey) {
			this.hidePageControls();			
		}
	},
	//* Handle paginate event sent from PagingControl buttons
	paginate: function(inSender, inEvent) {
		var sb = this.getScrollBounds(),
			side = inEvent.side;
		
		switch (side) {
			case "top":
				this.scrollTo(this.getScrollLeft() ,sb.top - sb.maxTop * (this.pagePercent/100));
				break;
			case "right":
				this.scrollTo(sb.left + sb.maxLeft * (this.pagePercent/100), this.getScrollTop());
				break;
			case "bottom":
				this.scrollTo(this.getScrollLeft(), sb.top + sb.maxTop * (this.pagePercent/100));
				break;
			case "left":
				this.scrollTo(sb.left - sb.maxLeft * (this.pagePercent/100), this.getScrollTop());
				break;
		}
	}
});

/**
	Paging control button kind
**/
enyo.kind({
	name: "moon.PagingControl",
	kind: "moon.IconButton",
	classes: "moon-paging-button",
	spotlight: true,
	showing: false,
	published: {
		side: null
	},
	handlers: {
		onSpotlightFocused: "noop",
		ontap: "tap"
	},
	events: {
		onPaginate: ""
	},
	create: function() {
		this.inherited(arguments);
		this.sideChanged();
	},
	//* Set this control's css class based on side
	sideChanged: function() {
		var s = this.getSide();
		if (s === "top") {
			this.addClass("top");
		} else {
			this.removeClass("top");
		}
		if (s === "right") {
			this.addClass("right");
		} else {
			this.removeClass("right");
		}
		if (s === "bottom") {
			this.addClass("bottom");
		} else {
			this.removeClass("bottom");
		}
		if (s === "left") {
			this.addClass("left");
		} else {
			this.removeClass("left");
		}
	},
	//* When button is tapped, bubble a paginate event
	tap: function() {
		this.doPaginate({side: this.getSide()});
	},
	//* Override default focused handling to make sure scroller doesn't scroll to this button
	noop: function() { return true; }
});
