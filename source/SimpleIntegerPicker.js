(function (enyo, scope) {
	/**
	* The extended [event]{@glossary:event} [object]{@link glossary Object} that is provided when 
	* the [onChange]{@link moon.SimpleIntegerPicker#event:onChange} and
	* [onSelect]{@link moon.SimpleIntegerPicker#event:onSelect} [events]{@glossary event} are fired.
	*
	* @typedef {Object} moon.SimpleIntegerPicker~SelectionEventObject
	* @property {String} value - The value of the currently selected item.
	* @property {String} content - The content of the currently selected item.
	* @public
	*/

	/**
	* Fires in response to "Return" keypress while the picker has focus in 
	* [Spotlight]{@link enyo.Spotlight} 5-way mode.
	*
	* @event moon.SimpleIntegerPicker#event:onSelect
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the [event]{@glossary event}.
	* @property {moon.SimpleIntegerPicker~SelectionEventObject} event - An 
	*	[object]{@glossary Object} containing [event]{@glossary event} information.
	* @public
	*/

	/**
	* _moon.SimpleIntegerPicker_ is a [control]{@link enyo.Control} that prompts the user to make a
	* selection from a range of integer-based options.
	* 
	* The picker may be changed programmatically by calling 
	* [_previous()_]{@link moon.SimpleIntegerPicker#previous} or 
	* [_next()_]{@link moon.SimpleIntegerPicker#next}, or by modifying the published property 
	* [_value_]{@link moon.SimpleIntegerPicker#value}.
	*
	* @ui
	* @class moon.SimpleIntegerPicker
	* @extends enyo.Control
	* @public
	*/
	enyo.kind(
		/** @lends moon.SimpleIntegerPicker.prototype */ {

		/**
		* @private
		*/
		name: 'moon.SimpleIntegerPicker',

		/**
		* @private
		*/
		kind: 'moon.IntegerPicker',
		
		/**
		* @private
		*/
		classes: 'moon-simple-integer-picker',

		/**
		* @private
		*/
		spotlight:true,
		
		/**
		* @private
		*/
		events: {
			onSelect: ''
		},
		
		/**
		* @private
		*/
		handlers: {
			onSpotlightUp: null,
			onSpotlightDown: null,
			onSpotlightRight: 'spotRight',
			onSpotlightLeft: 'spotLeft',
			onSpotlightSelect: 'fireSelectEvent'
		},
		
		/**
		* @private
		*/
		published: 
			/** @lends moon.SimpleIntegerPicker.prototype */ {
			
			/** 
			* Unit label to be appended to the value for display.
			*
			* @type {String}
			* @default 'sec'
			* @public
			*/
			unit: 'sec'
		},

		pickerPadding: 50,

		/**
		* @private
		*/
		components: [
			{name: 'bottomOverlay', classes: 'moon-simple-integer-picker-button left', ondown: 'downPrevious', onholdpulse:'previous', components: [
				{classes: 'moon-simple-integer-picker-button-tap-area'}
			]},
			{kind: 'enyo.Scroller', thumb:false, touch:true, useMouseWheel: false, rtl: false, classes: 'moon-simple-integer-picker-client', components:[
				{name:'repeater', kind:'enyo.FlyweightRepeater', ondragstart: 'dragstart', onSetupItem: 'setupItem', orient: 'h', clientClasses: 'moon-simple-integer-picker-item', classes: 'repeater', components: [
					{name: 'item'}
				]}
			]},
			{name: 'topOverlay', classes: 'moon-simple-integer-picker-button right', ondown: 'downNext', onholdpulse:'next', components: [
				{classes: 'moon-simple-integer-picker-button-tap-area'}
			]}
		],

		labelForValue: enyo.inherit(function (sup) {
			return function (value) {
				var content = sup.apply(this, arguments);
				return this.unit? content + " " + this.unit : content;
			}
		}),

		updateRepeater: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);

				if(!this.width) {
					var ib;
					this.$.repeater.performOnRow(this.$.repeater.rowOffset, function() {
						// have to reset to natural width before getting bounds
						this.$.item.setStyle('width: auto');
						ib = this.$.item.getBounds();
					}, this);

					// var lb = this.$.bottomOverlay.getBounds();
					// var rb = this.$.bottomOverlay.getBounds();

					this.width = Math.round(ib.width + this.pickerPadding);
					this.applyStyle('width', this.width + 'px');
					this.$.item.setStyle('width: ' + this.width + 'px');
				};
			}
		}),

		spotRight: function(sender, event) {
			if(this.rtl) {
				this.previous(sender, event);
			} else {
				this.next(sender, event);
			}

			return true;
		},

		spotLeft: function(sender, event) {
			if(this.rtl) {
				this.next(sender, event);
			} else {
				this.previous(sender, event);
			}

			return true;
		},


		/**
		* @fires moon.SimpleIntegerPicker#event:onSelect
		* @private
		*/
		fireSelectEvent: function () {
			if (this.hasNode()) {
				this.doSelect({content: this.getContent(), value: this.value});
			}
		},

		reflow: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.width = 0;
				this.scrollToValue();
			};
		})

	});

})(enyo, this);
