/**
		Panel > Layers
		Shows a list of all the paths in a Glyph.
**/
import { getCurrentProject, getCurrentProjectEditor } from '../app/main.js';
import { addAsChildren, makeElement } from '../common/dom.js';
import { addChildActions, getActionData } from './actions.js';
import { eventHandlerData } from '../edit_canvas/events.js';

export function makePanel_Layers() {
	// log(`makePanel_Layers`, 'start');
	let rowsArea = makeElement({ className: 'panel__card full-width item-links__rows-area' });
	const editor = getCurrentProjectEditor();
	const project = getCurrentProject();
	let selected = editor.selectedItem;
	let paths = selected.shapes;

	if (eventHandlerData.newBasicPath) {
		let path = eventHandlerData.newBasicPath;
		let row = makeElement();
		row.setAttribute('class', 'item-link__row layer-panel__new-path');
		row.classList.add('layer-panel__selected');
		row.appendChild(
			makeElement({
				className: 'item-link__thumbnail',
				innerHTML: project.makeItemThumbnail(path),
			})
		);

		row.appendChild(
			makeElement({
				className: 'item-link__title',
				innerHTML: path.name,
			})
		);

		rowsArea.appendChild(row);
	}

	if (paths.length > 0) {
		for (let i = paths.length - 1; i >= 0; i--) {
			let item = paths[i];
			let row = makeElement({ attributes: { 'target-path-index': i } });

			if (item.objType === 'ComponentInstance') {
				row.setAttribute('class', 'item-link__row layer-panel__component-row');
			} else {
				row.setAttribute('class', 'item-link__row layer-panel__path-row');
			}

			if (editor.multiSelect.shapes.isSelected(item)) {
				row.classList.add('layer-panel__selected');
			}

			editor.subscribe({
				topic: 'whichPathIsSelected',
				subscriberID: `layersPanel.item-link-row-${i}`,
				callback: () => {
					// log(`Layer subscription callback for selectedPath`, 'start');

					let isSelected = editor.multiSelect.shapes.isSelected(item);
					// log(`isSelected: ${isSelected}`);
					// log(row.classList.toString());
					row.classList.toggle('layer-panel__selected', isSelected);
					// log(`Layer subscription callback for selectedPath`, 'end');
				},
			});

			row.addEventListener('click', () => {
				editor.multiSelect.shapes.select(item);
				editor.publish('whichPathIsSelected', item);
			});

			const thumbnail = makeElement({
				className: 'item-link__thumbnail',
				attributes: { 'target-path-index': i },
				innerHTML: project.makeItemThumbnail(item),
			});
			row.appendChild(thumbnail);

			row.appendChild(
				makeElement({
					className: 'item-link__title',
					innerHTML: `${item.name}`,
				})
			);

			let subtitle = 'Path';
			if (item.link) subtitle = `Component instance&emsp;|&emsp;${project.getItem(item.link).name}`;
			row.appendChild(
				makeElement({
					className: 'item-link__subtitle',
					innerHTML: subtitle,
				})
			);

			rowsArea.appendChild(row);
		}
	} else {
		rowsArea.appendChild(
			makeElement({
				content: `No paths exist yet.  You can create one with the New Path tools on the canvas, or by pressing "add new path" below.`,
			})
		);
	}

	// Overall, watch for changes:
	editor.subscribe({
		topic: ['currentPath', 'currentItem'],
		subscriberID: 'layersPanel',
		callback: () => {
			const editor = getCurrentProjectEditor();
			const project = getCurrentProject();
			const thumbs = document.querySelectorAll('.item-link__thumbnail');
			thumbs.forEach((thumb) => {
				const pathIndex = thumb.getAttribute('target-path-index');
				thumb.innerHTML = project.makeItemThumbnail(editor.selectedItem.shapes[pathIndex]);
			});
		},
	});

	// log(`makePanel_Layers`, 'end');
	return [rowsArea, makeActionArea_Layers()];
}

function makeActionArea_Layers() {
	const editor = getCurrentProjectEditor();

	let actionsCard = makeElement({
		className: 'panel__card full-width',
		content: '<h3>Actions</h3>',
	});

	let actionsArea = makeElement({
		tag: 'div',
		className: 'panel__actions-area',
	});
	addChildActions(actionsArea, getActionData('addShapeActions'));

	let selectedPaths = editor.multiSelect.shapes.members;
	let totalPaths = editor.selectedItem.shapes.length;
	if (totalPaths > 1 && selectedPaths.length === 1) {
		addChildActions(actionsArea, getActionData('layerActions'));
	}

	addAsChildren(actionsCard, actionsArea);
	return actionsCard;
}
