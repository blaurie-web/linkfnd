const assert = require("assert");

const { Qntree } = require("../src/qntree");
const {describe} = require("mocha");

function one() { return 1; }
function two() { return 2; }
function three() { return 3; }
function four() { return 4; }

function parmone(state) { return '1' + state.parm; }
function parmtwo(state) { return '2' + state.parm; }
function parmnext(state) { return state.parm + state.next; }
function lvltwo(state) { return state.lvltwo; }

describe('Root tests', function() {

	it('Add Root dispatch', () => {
		let tree = new Qntree();

		tree.patch('\\', one);

		let fn = tree.root.callback;
		assert(fn() === 1);

	});

	it('Patch Root dispatch', function() {
		let tree = new Qntree();

		tree.patch('/', one);
		tree.patch('/', two);

		let fn = tree.root.callback;
		assert(fn() === 2);
	});

	it('rewrite empty to root', function() {
		let tree = new Qntree();

		tree.patch('', one);

		let fn = tree.root.callback;
		assert(fn() === 1);
	});

	it('rewrite double slash to root', function() {
		let tree = new Qntree();

		tree.patch('//', one);

		let fn = tree.root.callback;
		assert(fn() === 1);
	});

});

describe('level 1 tests', function() {
	it('add one level 1 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one', one);

		assert(tree.root.children['one']);
		let fn = tree.root.children['one'].callback;
		assert(fn() === 1);
	});

	it('patch one level 1 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one', one);
		tree.patch('/one', two);

		assert(tree.root.children['one']);
		let fn = tree.root.children['one'].callback;
		assert(fn() === 2);
	});

	it('add second level 1 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one', one);
		tree.patch('/two', two);

		assert(tree.root.children['one']);
		assert(tree.root.children['two']);

		let fn1 = tree.root.children['one'].callback;
		let fn2 = tree.root.children['two'].callback;
		assert(fn1() === 1);
		assert(fn2() === 2);
	});

	it('patch multiple level 1 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one', one);
		tree.patch('/two', two);

		tree.patch('/one', three);
		tree.patch('/two', four);

		assert(tree.root.children['one']);
		assert(tree.root.children['two']);

		let fn1 = tree.root.children['one'].callback;
		let fn2 = tree.root.children['two'].callback;
		assert(fn1() === 3);
		assert(fn2() === 4);
	});

	it('end slash ignored', function() {
		let tree = new Qntree();

		tree.patch('/one/', one);

		assert(!tree.root.children['one'].children['']);
	});
});

describe('level 2 tests', function() {
	it('add one level 2 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one/one', one);

		assert(!tree.root.children['one'].callback)
		assert(tree.root.children['one'].children['one']);
		let fn = tree.root.children['one'].children['one'].callback;
		assert(fn() === 1);
	});

	it('patch one level 2 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one/one', one);
		tree.patch('/one/one', two);

		assert(!tree.root.children['one'].callback)
		assert(tree.root.children['one'].children['one']);
		let fn = tree.root.children['one'].children['one'].callback;
		assert(fn() === 2);
	});

	it('add second level 2 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one/one', one);
		tree.patch('/one/two', two);

		assert(tree.root.children['one'].children['one']);
		assert(tree.root.children['one'].children['two']);

		let fn1 = tree.root.children['one'].children['one'].callback;
		let fn2 = tree.root.children['one'].children['two'].callback;
		assert(fn1() === 1);
		assert(fn2() === 2);
	});

	it('patch multiple level 2 dispatch', () => {
		let tree = new Qntree();

		tree.patch('/one/one', one);
		tree.patch('/one/two', two);

		tree.patch('/one/one', three);
		tree.patch('/one/two', four);

		assert(tree.root.children['one'].children['one']);
		assert(tree.root.children['one'].children['two']);

		let fn1 = tree.root.children['one'].children['one'].callback;
		let fn2 = tree.root.children['one'].children['two'].callback;
		assert(fn1() === 3);
		assert(fn2() === 4);
	});
});

describe('parametric tests', function() {

	describe('level 1 tests', function() {
		it('level 1 parametric test', () => {
			let tree = new Qntree();

			tree.patch('/:parm', one);

			assert(tree.root.parametric);
			assert(!tree.root.children[':parm']);
			assert(tree.root.parametric.qname === 'parm');
			let fn = tree.root.parametric.callback;
			assert(fn() === 1);
		});

		it('level 1 parametric patch', () => {
			let tree = new Qntree();

			tree.patch('/:parm', one);
			tree.patch('/:parm', two);

			assert(!tree.root.children[':parm']);
			assert(tree.root.parametric)
		});

		it('level 1 parametric override', function() {
			let tree = new Qntree();

			tree.patch('/:parm', one);
			tree.patch('/:parmtwo', two);

			assert(tree.root.parametric.qname === 'parm');

			let fn = tree.root.parametric.callback;
			assert(fn() === 2);
		});
	});

	describe('level 2 tests', function() {

		it('level 2 parametric', () => {
			let tree = new Qntree();

			tree.patch('/base/:parm', one);

			assert(!tree.root.children['base'].children[':parm']);
			assert(tree.root.children['base'].parametric);
			assert(tree.root.children['base'].parametric.qname === 'parm');
		});

		it('level 2 parametric override', () => {
			let tree = new Qntree();

			tree.patch('/base/:parm', one);
			tree.patch('/base/:parmtwo', two);

			assert(tree.root.children['base'].parametric);
			assert(tree.root.children['base'].parametric.qname === 'parm');
		});

		it('parm then name', () => {
			let tree = new Qntree();

			tree.patch('/:parm/one', one);

			assert(tree.root.parametric.children['one']);

			let fn = tree.root.parametric.children['one'].callback;
			assert(fn() === 1);
		});

		it('parm with 2 children', () => {
			let tree = new Qntree();

			tree.patch('/:parm/one', one);
			tree.patch('/:parm/two', two);

			assert(tree.root.parametric.children['one']);
			assert(tree.root.parametric.children['two']);

			let fn = tree.root.parametric.children['one'].callback;
			let fn2 = tree.root.parametric.children['two'].callback;
			assert(fn() === 1);
			assert(fn2() === 2);
		});
	});
});

describe('match tests', function() {

	let tree = new Qntree();
	tree.patch('/one', one);
	tree.patch('/two', two);
	tree.patch('/:parm/one', parmone);
	tree.patch('/:parm/two', parmtwo);
	tree.patch('/:parm/:next', parmnext);
	tree.patch('/one/:lvltwo', lvltwo);

	it('match /one', () => {
		assert(tree.match('/one') === 1);
	});

	it('match /two', () => {
		assert(tree.match('/two') === 2);
	});

	it('match /:parm', () => {
		assert(tree.match('/3') === undefined);
	});

	it('match /:parm/one', () => {
		assert(tree.match('/10/one') === '110');
	});

	it('match /:parm/one', () => {
		assert(tree.match('/10/two') === '210');
	});

	it('match /:parm/:next', () => {
		let ret = tree.match('/3/1');
		assert(ret === '31');
	});

	it('match /one/:lvltwo', () => {
		assert(tree.match('/one/woo!') === 'woo!');
	});
});