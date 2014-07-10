(function (enyo, scope) {
	/**
	* @typedef {Object} moon.BreadcrumbArranger~PanelInfoObject
	* @property {Boolean} breadcrumb - reports whether panel is in breadcrumb (collapsed) form
	* @property (Boolean) offscreen - reports whether a panel is is offscreen
	* public
	*/

	/**
	* _moon.BreadcrumbArranger_ is an {@link: enyo.Arranger}
	* that displays the active control, along with some number of breadcrumbs on the
	* right side. This is the default arranger for both the 'Always Viewing' and
	* 'Activity' patterns; if you are using {@link: moon.Panel}
	* with either of these patterns, you don't need to specify an arranger
	* explicitly.
	*
	* The breadcrumbs reflect the sequence of panels that the user has already seen.
	*
	* Transitions between arrangements are handled by sliding the new control	in
	* from the right. If the old controls can fit within the width of the	container,
	* they will slide to the left; if not, they will collapse to the left.
	*
	* The control's child components may be of any kind; by default, they are
	* instances of {@link: moon.Panel}.
	*
	* ```
	* {name: 'panels', kind: 'moon.Panels', pattern: 'alwaysviewing', classes: 'enyo-fit', components: [
	* 	{title: 'First', components: [
	*  	{kind: 'moon.Item', style: 'margin-top:20px;', content: 'Item One'},
	* 		{kind: 'moon.Item', content: 'Item Two'},
	* 		{kind: 'moon.Item', content: 'Item Three'},
	* 		{kind: 'moon.Item', content: 'Item Four'},
	* 		{kind: 'moon.Item', content: 'Item Five'}
	*	]},
	* 	{title: 'Second', joinToPrev: true, components: [
	* 		{kind: 'moon.Item', style: 'margin-top:20px;', content: 'Item One'},
	* 		{kind: 'moon.Item', content: 'Item Two'},
	* 		{kind: 'moon.Item', content: 'Item Three'},
	* 		{kind: 'moon.Item', content: 'Item Four'},
	* 		{kind: 'moon.Item', content: 'Item Five'}
	* 	]}
	* ]}
	* ```
	*
	* @class moon.BreadcrumbArranger
	* @extends enyo.DockRightArranger
	* @public
	*/
	enyo.kind(
		/** @lends moon.BodyText.prototype */ {

		/**
		* @private
		*/
		name: 'moon.BreadcrumbArranger',

		/**
		* @private
		*/
		kind: 'enyo.DockRightArranger',

		/**
		* Returns an object containing information about the state
		* of a given panel (identified by _inPanelIndex_) within a
		* given arrangement (identified by _inActiveIndex_).
		*
		* Specifically, _moon.BreadcrumbArranger_ reports whether a panel
		* is offscreen, and whether it is in breadcrumb (collapsed) form.
		*
		* @param {Number} inPanelIndex index of the panel for which to get info
		* @param (Number) inActiveIndex index of the arranger the panel is in
		* @returns {moon.BreadcrumbArranger~PanelInfoObject}
		* @public
		*/
		getPanelInfo: function (inPanelIndex, inActiveIndex) {
			return {
				breadcrumb: this.isBreadcrumb(inPanelIndex, inActiveIndex),
				offscreen: this.isOffscreen(inPanelIndex, inActiveIndex)
			};
		},

		/**
		* @private
		*/
		breadcrumbWidth: 230,

		/**
		* @private
		*/
		debug: false,

		/**
		* @private
		*/
		size: function() {
			var containerWidth = this.getContainerWidth(),
				panels = this.container.getPanels(),
				i;

			// Set up default widths for each panel
			for (i = 0; i < panels.length; i++) {
				// If panels have already been stretched, unstretch them before doing calculations
				if (panels[i].actualWidth) {
					panels[i].applyStyle('width', panels[i].width + 'px');
				}

				panels[i].actualWidth = null;
				panels[i].width = panels[i].getBounds().width;
			}

			// Calculate which panels will be joined
			this.joinedPanels = this.calculateJoinedPanels(containerWidth);

			// Stretch all panels to fit vertically
			this.applyVerticalFit();

			// Reset panel arrangement positions
			this.container.transitionPositions = this.calculateTransitionPositions(containerWidth, this.joinedPanels);
			this.adjustTransitionPositionsForJoinedPanels(this.joinedPanels);

			// Update individual panel widths to account for _joinedPanels_
			this.updateWidths(containerWidth, this.joinedPanels);
			this.applyUpdatedWidths();

			// Calculate _this.breadcrumbPositions_
			this.calcBreadcrumbPositions(this.joinedPanels);

			if (this.debug) {
				enyo.log('transitionPositions:', this.container.transitionPositions);
				enyo.log('breadcrumbPositions:', this.breadcrumbPositions);
			}
		},

		/**
		* @private
		*/
		calculateJoinedPanels: function (inContainerWidth) {
			inContainerWidth = inContainerWidth || this.getContainerWidth();

			var panels = this.container.getPanels(),
				joinedPanels = {};

			for (var panelIndex = 0; panelIndex < panels.length; panelIndex++) {
				for (var index = 0; index < panels.length; index++) {
					if (panelIndex > index) {
						joinedPanels[panelIndex + '.' + index] = this.isPanelJoined(panelIndex, index, inContainerWidth);
					}
				}
			}

			return this.formatJoinedPanels(joinedPanels);
		},

		/**
		* @private
		*/
		isPanelJoined: function (inPanelIndex, inIndex, inContainerWidth) {
			inContainerWidth = inContainerWidth || this.getContainerWidth();

			var panels = this.container.getPanels(),
				xPos = this.getBreadcrumbEdge(inIndex),
				i = inPanelIndex;

			while(i > inIndex) {
				if (!panels[i].joinToPrev) {
					return false;
				}

				xPos += panels[i].width;
				i--;
			}

			if(xPos + panels[inIndex].width > inContainerWidth) {
				return false;
			}

			return true;
		},

		/**
		* @private
		*/
		formatJoinedPanels: function (inJoinedPanels) {
			var panels = this.container.getPanels(),
				ret = [], i, j;

			for (i = 0; i < panels.length; i++) {
				for (j = 0; j < panels.length; j++) {
					if (!inJoinedPanels[i+'.'+j]) {
						continue;
					}

					ret[i] = ret[i] || [];
					ret[i].push(j);
				}
			}

			return ret;
		},

		/**
		* @private
		*/
		calculateTransitionPositions: function (inContainerWidth, inJoinedPanels) {
			var panels = this.container.getPanels(),
				tp = {};

			for (var panelIndex = 0; panelIndex < panels.length; panelIndex++) {
				for (var index = 0; index < panels.length; index++) {
					tp[panelIndex + '.' + index] = this.calculateXPos(panelIndex, index, inContainerWidth, inJoinedPanels);
				}
			}

			return tp;
		},

		/**
		* @private
		*/
		calculateXPos: function (inPanelIndex, inIndex, inContainerWidth, inJoinedPanels) {
			var breadcrumbEdge = this.getBreadcrumbEdge(inIndex),
				panels = this.container.getPanels(),
				xPos,
				i,
				patternOffset = 0;

			if (this.container.pattern == 'activity') {
				// add some positional sugar just for the activity breadcrumbs
				if (inIndex === 0) {
					patternOffset = breadcrumbEdge;
				}
				else {
					patternOffset = breadcrumbEdge - this.breadcrumbWidth;
				}
				patternOffset/= 2;
			}

			// each active item should be at _breadcrumbEdge_
			if (inIndex === inPanelIndex) {
				return breadcrumbEdge + this.getBreadcrumbGap()/2 - patternOffset;

			// breadcrumbed panels should be positioned to the left
			} else if (inIndex > inPanelIndex) {
				return breadcrumbEdge - (inIndex - inPanelIndex) * this.breadcrumbWidth - this.getBreadcrumbGap()/2 - patternOffset;

			// upcoming panels should be layed out to the right if _joinToPrev_ is true
			} else {
				// If this panel is not joined at this index, put it off the screen to the right
				if (!inJoinedPanels[inPanelIndex] || inJoinedPanels[inPanelIndex].indexOf(inIndex) === -1) {
					return inContainerWidth;
				}

				xPos = breadcrumbEdge;

				i = inPanelIndex;
				while (i > inIndex) {
					if (panels[i - 1]) {
						xPos += panels[i - 1].width - patternOffset;
					}
					i--;
				}

				return xPos;
			}
		},

		/**
		* @private
		*/
		recalculatePanelTransitionPositions: function (inPanelIndex, inContainerWidth, inJoinedPanels) {
			var panels = this.container.getPanels();
			for (var i = 0; i < panels.length; i++) {
				this.container.transitionPositions[inPanelIndex + '.' + i] = this.calculateXPos(inPanelIndex, i, inContainerWidth, inJoinedPanels);
			}
		},

		/**
		* @private
		*/
		adjustTransitionPositionsForJoinedPanels: function (inJoinedPanels) {
			var tp = this.container.transitionPositions,
				panels = this.container.getPanels();

			for (var i = panels.length; i >= 0; i--) {
				if (!inJoinedPanels[i]) {
					continue;
				}

				for (var j = inJoinedPanels[i].length - 1; j >= 0; j--) {
					for (var k = 0; k < panels.length; k++) {
						tp[k+'.'+i] = tp[k+'.'+inJoinedPanels[i][j]];
					}
				}
			}
		},

		/**
		* @private
		*/
		updateWidths: function (inContainerWidth, inJoinedPanels) {
			var panels = this.container.getPanels(),
				diff,
				i, j;

			// Calculate stretched widths for panels at the end of given index
			for (i = 0; i < inJoinedPanels.length; i++) {
				if (!inJoinedPanels[i]) {
					continue;
				}

				var totalWidth = panels[i].width +
					this.getBreadcrumbEdge(inJoinedPanels[i][0]) +
					this.getBreadcrumbGap();

				// Add the width of each additional panel that is visible at this index
				for (j = 0; j < inJoinedPanels[i].length; j++) {
					// If this panel is joined with another one that has already been stretched, reposition
					// it so everything is kosher. TODO - this is a strange edge case, needs to be discussed.
					if (panels[inJoinedPanels[i][j]].actualWidth) {
						totalWidth += panels[inJoinedPanels[i][j]].actualWidth;
						// TODO - this.recalculatePanelTransitionPositions(i, inContainerWidth, inJoinedPanels);
					} else {
						totalWidth += panels[inJoinedPanels[i][j]].width;
					}
				}

				diff = inContainerWidth - totalWidth;
				panels[i].actualWidth = panels[i].width + diff;

				if (this.debug) {
					enyo.log(i, panels[i].width, '-->', panels[i].actualWidth);
				}
			}

			// Stretch all panels that should fill the whole width
			for (i = 0; i < panels.length; i++) {
				if (!panels[i].actualWidth) {
					var match = false;
					for (j = 0; j < inJoinedPanels.length; j++) {
						if (inJoinedPanels[j] && inJoinedPanels[j].indexOf(i) >= 0) {
							match = true;
						}
					}
					panels[i].actualWidth = (match) ?
						panels[i].width :
						inContainerWidth - this.getBreadcrumbEdge(i) - this.getBreadcrumbGap();
				}
			}
		},

		/**
		* @private
		*/
		applyUpdatedWidths: function () {
			var panels = this.container.getPanels();
			for (var i = 0; i < panels.length; i++) {
				panels[i].applyStyle('width', panels[i].actualWidth + 'px');
			}
		},

		/**
		* @private
		*/
		calcBreadcrumbPositions: function (inJoinedPanels) {
			var panels = this.container.getPanels(),
				isBreadcrumb,
				index,
				i;

			this.breadcrumbPositions = {};

			for (i = 0; i < panels.length; i++) {
				for (index = 0; index < panels.length; index++) {
					isBreadcrumb = false;

					if (index > i) {
						isBreadcrumb = !(inJoinedPanels[index] && inJoinedPanels[index].indexOf(i) > -1);
					}

					this.breadcrumbPositions[i+'.'+index] = isBreadcrumb;
				}
			}
		},

		/**
		* @private
		*/
		start: function () {
			this.inherited(arguments);

			var tp = this.container.transitionPositions;
			var panels = this.container.getPanels();
			var panel;
			var hiding = [];
			for(var i=0;(panel = panels[i]);i++) {
				if (tp[i+'.'+this.container.toIndex] === 0) {
					var width = panel.getBounds().width;
					var nextTp = tp[i+1+'.'+this.container.toIndex];
					if (width > nextTp) {
						hiding.push(i);
					}
				}
			}

			this.container.hiddenPanels = hiding;
		},

		/**
		* @private
		*/
		arrange: function (inC, inName) {
			var c$ = this.container.getPanels();
			var s = this.container.clamp(inName);
			var i, c, xPos;

			for (i=0; (c=c$[i]); i++) {
				xPos = this.container.transitionPositions[i + '.' + s];
				// If the panel is even a little off the screen,
				if (xPos < 0) {
					// lets check if its fully off.
					var containerPadding = this.getContainerPadding();
					if (xPos <= ((this.breadcrumbWidth - containerPadding.left) * -1)) {
						// Its visible portion is, so lets nudge it off entirely so it can't be highlighted using just its non-visible edge
						xPos -= containerPadding.right;
					}
				}
				this.arrangeControl(c, {left: xPos});
			}
		},

		/**
		* @private
		*/
		isOffscreen: function (inPanelIndex, inActiveIndex) {
			if (!this.container.transitionPositions) {
				return;
			}
			var transitionPosition = this.container.transitionPositions[inPanelIndex + '.' + inActiveIndex];
			var screenEdge = this.container.panelCoverRatio == 1 ? this.getBreadcrumbEdge(inPanelIndex) : 0;
			if (transitionPosition < 0) {
				return transitionPosition + this.breadcrumbWidth <= screenEdge;
			} else {
				return transitionPosition >= this.containerBounds.width;
			}
		},

		/**
		* @private
		*/
		isBreadcrumb: function (inPanelIndex, inActiveIndex) {
			return this.breadcrumbPositions && this.breadcrumbPositions[inPanelIndex + '.' + inActiveIndex];
		},

		/**
		* @private
		*/
		calcBreadcrumbEdges: function () {
			this.breadcrumbEdges = [];
			for (var i = 0, panel; (panel = this.container.getPanels()[i]); i++) {
				this.breadcrumbEdges[i] = (i === 0) ? 0 : this.breadcrumbWidth;
			}
		},

		/**
		* @private
		*/
		getContainerWidth: function () {
			return this.containerBounds.width;
		},

		/**
		* @private
		*/
		getBreadcrumbGap: function () {
			return this.container.breadcrumbGap || 0;
		},

		/**
		* @private
		*/
		getBreadcrumbEdge: function (inIndex) {
			var leftMargin = this.getContainerWidth() * (1 - this.container.panelCoverRatio);
			if (this.container.panelCoverRatio == 1) {
				var containerPadding = this.getContainerPadding();
				leftMargin += containerPadding.left + containerPadding.right;
			}
			if (this.container.showFirstBreadcrumb && inIndex !== 0) {
				leftMargin += this.breadcrumbWidth;
			}
			return leftMargin;
		},

		/**
		* Sets bounds for each panel to fit vertically.
		* @private
		*/
		applyVerticalFit: function () {
			var panels = this.container.getPanels(),
				padding = this.getContainerPadding();

			for (var i = 0, panel; (panel = panels[i]); i++) {
				panel.setBounds({top: padding.top, bottom: padding.bottom});
			}
		},

		/**
		* @private
		*/
		getContainerPadding: function () {
			return this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {};
		},

		/**
		* Return _true_ if any panels will move in the transition from _inFromIndex_ to _inToIndex_
		* @private
		*/
		shouldArrange: function (inFromIndex, inToIndex) {
			if (!(inFromIndex >= 0 && inToIndex >= 0)) {
				return;
			}

			var transitionPositions = this.container.transitionPositions,
				panelCount = this.container.getPanels().length,
				panelIndex,
				from,
				to;

			for (panelIndex = 0; panelIndex < panelCount; panelIndex++) {
				from = transitionPositions[panelIndex + '.' + inFromIndex];
				to = transitionPositions[panelIndex + '.' + inToIndex];

				if (from !== to) {
					return true;
				}
			}

			return false;
		}
	});

})(enyo, this);
