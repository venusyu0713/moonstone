(function (enyo, scope) {
	/**
		_moon.Divider_ is a simple styled component that may be used as a separator
		between groups of components.

	* @class moon.Divider
	* @mixes moon.MarqueeSupport
	* @public
	*/
	enyo.kind(
		/** @lends moon.Divider.prototype */ {

		/**
		* @private
		*/
		name: 'moon.Divider',

		/**
		* @private
		*/
		classes: 'moon-divider moon-divider-text',

		/**
		* @private
		*/
		mixins: ['moon.MarqueeSupport', 'moon.MarqueeItem'],

		/**
		* @private
		*/
		marqueeOnSpotlight: false,

		/**
		* @private
		*/
		marqueeOnRender: true
	});

})(enyo, this);