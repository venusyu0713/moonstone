enyo.kind({
	name: "moon.sample.IntegerPickerSample",
	kind: "FittableRows",
	classes: "moon enyo-unselectable enyo-fit",
	components: [
		{kind: "moon.Scroller", fit:true, components: [
			{classes: "moon-hspacing", components: [
				{components: [
					{kind: "moon.Divider", content: "Integer Picker"},
					{kind: "moon.IntegerPicker", value: 2013, min: 1900, max: 2100, onChange: "changed"}
				]},
				{components: [
					{kind: "moon.Divider", content: "Direct Integer Picker"},
					{kind: "moon.IntegerPicker", value: 2013, min: 1900, max: 2100, animate: false, onChange: "changed"},
				]},
				{components: [
					{kind: "moon.Divider", content: "Stepped Picker"},
					{kind: "moon.IntegerPicker", value: 2012, min: 1900, max: 2100, step: 4, onChange: "changed"}
				]},
				{components: [
					{kind: "moon.Divider", content: "Wrapping Picker"},
					{kind: "moon.IntegerPicker", value: 0, min: -10, max: 10, wrap: true, onChange: "changed"}
				]}
			]}
		]},
		{kind: "moon.Divider", content: "Result"},
		{kind: "moon.BodyText", name: "value", content: "No change yet"}
	],
	changed: function(inSender, inEvent) {
		if (this.$.value){
			this.$.value.setContent(inEvent.name + " changed to " + inEvent.value);
		}
	}
});