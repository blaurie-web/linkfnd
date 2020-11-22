
function Node() {
	let o = Object.create(null);
	o.children = Object.create(null);
	o.parametric = undefined;
	o.callback = undefined;

	return o;
}


/**
 * Does a little clean up and corrects a few possibly common mistakes. Egregious issues outside of the accepted pattern
 * will need to be correct by the user.
 *
 * @param name The qualified name to clean up
 * @returns {string} The cleaned up qualified name
 */
function clean(name) {
	if (name === '') {
		name = '/';
	}

	name = name.replace('\\', '/');

	if (name.charAt(0) !== '/') {
		name = '/' + name;
	}

	if (name.length !== 1 && name.charAt(name.length - 1) === '/') {
		name = name.substr(0, name.length - 1);
	}

	return name;
}

function Qntree() {
	this.root = Node();
}

Qntree.prototype = {
	/**
	 * This method adds or patches a dispatch.
	 *
	 * You may have one (1) parameterized spot per child. ex:
	 * /base/next
	 * /base/:parm
	 * /:parm
	 *
	 * Are all valid names which can be matched.
	 *
	 * Also note that you cannot rename or override a parameterized dispatch. A parameterized dispatch is determined
	 * by looking at the first character of the current name fragment for a colon (:). ex:
	 * /base/:param
	 * /base/:newname
	 *
	 * Would *NOT* result in the second level dispatch being renamed to :newname. Additionally, a new node *will not*
	 * be created, meaning that adding child dispatchers using the new parameter name will add children to the existing
	 * parameterized dispatcher. ex:
	 * /base/:param/addone
	 * /base/:newname/addtwo
	 *
	 * Will result in the dispatchers:
	 * /base/:param/{addone, addtwo}
	 *
	 * As a result of the above, one should take care with when and where dispatches are patched. Ideally, every
	 * anticipated dispatch should be forward declared in one visible location.
	 *
	 * Wildcards are *not* supported. However, parameterized dispatches act like wildcards anyway. Ensure that your
	 * names are well thought out and accurately reflect what you want and need to do.
	 *
	 * @param name
	 * @param callback
	 */
	patch(name, callback) {
		let self = this;
		let curr = self.root;
		name = clean(name);
		let fragments = name.split('/');

		for (let i = 1; i < fragments.length; i++) {
			let fragment = fragments[i];
			if (fragment === '') {
				continue;
			}

			let fc = fragment.charAt(0);

			switch (fc) {
				case ':':
					if (!curr.parametric) {
						curr.parametric = Node();
						curr.parametric['qname'] = fragment.substring(1, fragment.length);
					}

					curr = curr.parametric;
					break;
				default:
					if (!curr.children[fragment]) {
						curr.children[fragment] = Node();
					}
					curr = curr.children[fragment];
					break;
			}
		}

		curr.callback = callback;
	},

	/**
	 * Note that the prioritization for matching *per child* is:
	 *  	1) Hard matched name
	 * 		2) If no name is matched, then use the parametized
	 *
	 * @param name
	 * @param not_found_callback
	 * @returns {*}
	 */
	match(name, not_found_callback) {
		let self = this;
		let curr = self.root;
		let state = Object.create(null);
		name = clean(name);
		let fragments = name.split('/');

		for (let i = 1; i < fragments.length; i++) {
			let fragment = fragments[i];
			if (fragment === '') {
				continue;
			}

			if (curr.children[fragment]) {
				curr = curr.children[fragment];
			} else if (curr.parametric) {
				curr = curr.parametric;
				state[curr.qname] = fragment;
			} else {
				return not_found_callback;
			}
		}

		return (curr.callback)? curr.callback(state): undefined;
	},

};

module.exports = { Qntree, clean };