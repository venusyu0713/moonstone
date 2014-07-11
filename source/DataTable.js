(function (enyo, scope) {
	/**
		_moon.DataTable_ is an [enyo.DataTable](#enyo.DataTable) with Moonstone visual
		styling applied.

	* @class moon.DataTable
	* @extends enyo.DataTable
	* @public
	*/
	enyo.kind(
		/** @lends moon.DataTable.prototype */ {

		/**
		* @private
		*/
		name: 'moon.DataTable',

		/**
		* @private
		*/
	   kind: 'enyo.DataTable',

	   //* @protected
		/**
		* @private
		*/
	   defaultKind: 'moon.TableRow',

		/**
		* @private
		* @method
		*/
		reset: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.container.resize();
			};
		})
	});

})(enyo, this);
