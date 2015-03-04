module.exports = function() {
	var React = require("react"),
		Endless = require("../../bower_components/endless/endless.js"),
		ListView;

	/**
	 * ListView component.
	 *
	 * sections: [
	 * 	{
	 * 		key: "somekey",
	 * 		header: "Some header",
	 * 		items: [{
	 * 			key: "somekey"
	 * 			elem: reactelem
	 * 		}]
	 * 	},
	 * 	{
	 * 		key: "otherkey",
	 * 		header: "Another header"
	 * 		items: [{
	 * 			key: "somekey"
	 * 			elem: reactelem
	 * 		}]
	 * 	}
	 * ]
	 *
	 * endless = false
	 */

	ListView = React.createClass({
		render: function() {
			var sections = this.props.sections,
				listview = [],
				content, items;

			for (var i = 0, l = sections.length; i < l; i++) {
				if (sections[i].header) {
					listview.push(<h3 key={"header-" + sections[i].key} className="list-header">{sections[i].header}</h3>);
				}

				if (sections[i].items) {
					items = [];

					for (var j = 0, m = sections[i].items.length; j < m; j++) {
						items.push(<li key={sections[i].items[j].key + "-" + sections[i].items[j].elem.key} className="list-item" tabIndex="1">{sections[i].items[j].elem}</li>);
					}

					if (this.props.endless) {
						content = <Endless items={items} onScroll={this.props.onScroll} atTop={this.props.atTop} atBottom={this.props.atBottom} />;
					} else {
						content = items;
					}

					listview.push(<ul key={"section-" + sections[i].key} className="list-section">{content}</ul>);
				}
			}

			return (<div className="list-view">{listview}</div>);
		}
	});

	return ListView;
};
