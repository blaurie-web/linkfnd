const { QnTree, clean } = require('qntree');

function Lfnd(origin) {
	if (!origin || origin === '') {
		origin = window.location.origin;
	}
	this.tree = new QnTree();

	this.origin = origin;

	this.updateElements();
}

Lfnd.prototype = {

	/**
	 * sets the location bar to the requested path and then resolves the request
	 * @param path
	 */
	location: function(path) {
		history.pushState({}, '', path);
		this.dispatch(path);
	},

	/**
	 * resolve the request against the provided routes.
	 *
	 * @param path Optional - The path to resolve. If not set, the location bar value is used.
	 */
	dispatch(path) {
		this.tree.match(path);
	},

	/**
	 * To attach links to the router, they should be written:
	 * <a href="/loc" data-routed>Link</a>
	 *
	 * You can also have router handle the click event for non-anchors using
	 * <div data-lfnd="/loc">... stuff ...</div>
	 *
	 * Note that for anchors, the "href" attribute value takes precedent.
	 *
	 * Also note that each time new links are added to the page,
	 * updateAnchors must be called.
	 */
	updateElements: function() {
		let self = this;

		document.querySelectorAll('[data-lfnd]').forEach(
			(el) => {
				if (!el.hasDispatcher) {
					el.qname = self._selectLinkQName(el);
					el.hasDispatcher = true;

					//todo: enable attaching to different event types
					el.addEventListener('click', function(evt) {
						evt.preventDefault();
						self.location(el.qname);
					});
				}
			}
		);
	},

	_selectLinkQName: function(el) {
		let qname = el.getAttribute('data-lfnd');

		if (el.tagName.toLowerCase() === 'a') {
			qname = el.getAttribute('href');
		}

		qname = this._clean(qname);

		return qname;
	},

	/**
	 * Does a little clean up and corrects a few possibly common mistakes. Egregious issues outside of the accepted pattern
	 * will need to be correct by the user.
	 *
	 * @param name The qualified name to clean up
	 * @returns {string} The cleaned up qualified name
	 */
	_clean: function(name) {
		return clean(name);
	}
}