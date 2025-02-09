import { getCurrentProjectEditor } from '../app/main.js';
import { addAsChildren, makeElement } from '../common/dom.js';
import { makeKernGroupCharChips } from '../pages/kerning.js';
import { makeActionsArea_KernGroup } from './actions.js';
import { makeSingleInput, makeSingleLabel, rowPad } from './cards.js';

// --------------------------------------------------------------
// Kern Group attributes
// --------------------------------------------------------------

export function makeCard_kernGroup(kernGroup) {
	// log(`makeCard_kernGroup`, 'start');
	// log(kernGroup);

	let kernGroupCard = makeElement({
		tag: 'div',
		className: 'panel__card',
		innerHTML: '<h3>Kern Group</h3>',
	});

	let valueLabel = makeSingleLabel('Value');
	let valueInput = makeSingleInput(kernGroup, 'value', 'currentKernGroup', 'input-number');

	let leftLabel = makeSingleLabel('Left group');
	let leftInput = makeKernGroupCharChips(kernGroup.leftGroup);

	let rightLabel = makeSingleLabel('Right group');
	let rightInput = makeKernGroupCharChips(kernGroup.rightGroup);

	// Put it all together
	addAsChildren(kernGroupCard, [
		valueLabel,
		valueInput,
		leftLabel,
		leftInput,
		rightLabel,
		rightInput,
	]);

	addAsChildren(kernGroupCard, rowPad());
	addAsChildren(kernGroupCard, makeActionsArea_KernGroup());

	// log(`makeCard_kernGroup`, 'end');
	return kernGroupCard;
}
