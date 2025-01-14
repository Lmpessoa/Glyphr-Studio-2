import { getCurrentProjectEditor } from '../app/main.js';
import { makeActionButton } from './action_buttons.js';
import { addAsChildren, makeElement } from '../common/dom.js';
import { saveFile } from '../project_editor/saving.js';
import { rectPathFromMaxes } from '../edit_canvas/tools/new_basic_path.js';
import { Path } from '../project_data/path.js';
import { ComponentInstance } from '../project_data/component_instance.js';
import {
	closeEveryTypeOfDialog,
	showError,
	showModalDialog,
	showToast,
} from '../controls/dialogs/dialogs.js';
import { makeAllItemTypeChooserContent } from './item_chooser.js';
import {
	addLinkToUsedIn,
	canAddComponent,
	makeGlyphSVGforExport,
	removeLinkFromUsedIn,
} from '../project_editor/cross_item_actions.js';
import { Glyph } from '../project_data/glyph.js';
import { addComponent } from '../pages/components.js';
import { countItems, trim } from '../common/functions.js';
import { eventHandlerData } from '../edit_canvas/events.js';
import { showAddEditKernGroupDialog } from '../pages/kerning.js';

// --------------------------------------------------------------
// Define action button data
// --------------------------------------------------------------

/**
 * Data format for creating action buttons:
 * ----------------------------------------
 * iconName = 'default',
 * iconOptions = false,
 * title = '',
 * disabled = false,
 * onClick = false
 */

export function getActionData(name) {
	const editor = getCurrentProjectEditor();
	let selectedPaths = editor.multiSelect.shapes.members;
	let selectedPoints = editor.multiSelect.points.members;
	let data = {};
	let clipBoardShapes = editor.clipboard.shapes;
	let clipBoardPathCount = clipBoardShapes ? clipBoardShapes.length : 0;
	let historyLength = editor.history.queue.length;

	// UNIVERSAL ACTIONS
	data.allActions = [
		{
			iconName: 'copy',
			iconOptions: !clipBoardShapes,
			title: `Copy\nAdds the selected shape(s) to the clipboard.`,
			disabled: !editor.multiSelect.shapes.length,
			id: 'actionButtonCopy',
			onClick: clipboardCopy,
		},
		{
			iconName: 'paste',
			iconOptions: !clipBoardShapes,
			title: makeActionButtonPasteTooltip(clipBoardPathCount),
			disabled: !clipBoardShapes,
			id: 'actionButtonPaste',
			onClick: clipboardPaste,
		},
		{
			iconName: 'undo',
			iconOptions: !historyLength,
			title: `Undo\nStep backwards in time one action.`,
			disabled: !historyLength,
			id: 'actionButtonUndo',
			onClick: () => {
				editor.history.restoreState();
			},
		},
	];

	if (editor.nav.page === 'Components') {
		data.allActions.push({
			iconName: 'linkToGlyph',
			title: `Link to Glyph\nChoose a glyph, and add this Component to that glyph as a Component Instance.`,
			onClick: () => {
				showDialogChooseOtherItem('linkAsComponent');
			},
		});
	}

	// ADDING PATH STUFF
	data.addShapeActions = [
		{
			iconName: 'addPath',
			iconOptions: false,
			title: `Add Path\nCreates a new default path and adds it to this glyph.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let newPath = editor.selectedItem.addOneShape(rectPathFromMaxes());
				editor.history.addState(`Added a default rectangle path`);
				editor.multiSelect.shapes.select(newPath);
				editor.publish('whichPathIsSelected', newPath);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'addPath',
			iconOptions: true,
			title: `Add Component Instance\nChoose another Component or Glyph, and use it as a Component Instance in this glyph.`,
			onClick: () => {
				showDialogChooseOtherItem('addAsComponentInstance');
			},
		},
		{
			iconName: 'pastePathsFromAnotherGlyph',
			title: `Get Paths\nChoose another Glyph, and copy all the paths from that glyph to this one.`,
			onClick: () => {
				showDialogChooseOtherItem('copyPaths');
			},
		},
	];

	// GLYPH
	data.glyphActions = [
		{
			iconName: 'flipHorizontal',
			title: `Flip Vertical\nReflects the glyph vertically.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				editor.selectedItem.flipEW();
				editor.history.addState(`Flipped all shapes in this glyph vertically`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'flipVertical',
			title: `Flip Horizontal\nReflects the glyph horizontally.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				editor.selectedItem.flipNS();
				editor.history.addState(`Flipped all shapes in this glyph horizontally`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'round',
			title: `Round all path point and handle position values\nIf a x or y value for any point or a handle in the path has decimals, it will be rounded to the nearest whole number.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				editor.selectedItem.roundAll();
				editor.history.addState(
					`Rounded all the path point and handle position values in this glyph`
				);
				editor.publish('currentItem', editor.selectedItem);
				showToast('Values were rounded for all path points in this glyph.');
			},
		},
		{
			iconName: 'combine',
			title: `Combine all paths\nCombines the paths of all paths with the same winding into as few paths as possible.`,
			disabled: true,
		},
		{
			iconName: 'deleteGlyph',
			title: `Delete Glyph\nRemove this Glyph from the project. ${
				editor.selectedItem?.usedIn?.length
					? `\nGlyphs that are used as a root component (like this one) cannot be deleted. Delete or un-link the component instances first.`
					: `\nDon't worry, you can undo this action.`
			}`,
			disabled: editor.selectedItem?.usedIn?.length,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const name = editor.selectedItem.name;
				editor.deleteSelectedItemFromProject();
				editor.history.addState(`Automatically navigated to ${editor.selectedItem.name}`);
				// log(`New item id: ${editor.selectedItemID}`);
				editor.publish('whichGlyphIsSelected', editor.selectedItemID);
				showToast(`Deleted ${name}.<br>(Don't worry, this action can be undone)`);
			},
		},
		{
			iconName: 'exportGlyphSVG',
			title: `Export glyph SVG File\nGenerate a SVG file that only includes the SVG outline for this glyph. This file can be dragged and dropped directly to another Glyphr Studio project edit canvas, allowing for copying glyph paths between projects.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let content = makeGlyphSVGforExport(editor.selectedItem);
				let name = editor.selectedItem.name;
				saveFile(name + '.svg', content);
			},
		},
	];

	// PATH
	data.shapeActions = [
		{
			iconName: 'copy',
			iconOptions: !clipBoardShapes,
			title: `Copy\nAdds the selected shape(s) to the clipboard.`,
			id: 'actionButtonCopyPath',
			onClick: clipboardCopy,
		},
		{
			iconName: 'deletePath',
			title: 'Delete\nRemoves the currently selected shape(s) from this glyph.',
			onClick: deleteSelectedPaths,
		},
		{
			iconName: 'switchPathComponent',
			iconOptions: false,
			title: `Turn Path into a Component Instance\nTakes the selected path and creates a Component out of it,\nthen links that Component to this glyph as a Component Instance.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const newComponent = new Glyph({
					objType: 'Component',
					name: `Component ${countItems(editor.project.components)}`,
				});
				editor.multiSelect.shapes.members.forEach((shape) => {
					if (shape.objType === 'Path') {
						newComponent.addOneShape(new Path(shape));
					} else if (shape.objType === 'ComponentInstance') {
						newComponent.addOneShape(new ComponentInstance(shape));
					}
					name += ' ' + shape.name;
				});
				const addedComponent = addComponent(newComponent);
				addLinkToUsedIn(addedComponent, editor.selectedItemID);
				const newShape = editor.selectedItem.addOneShape(
					new ComponentInstance({
						link: addedComponent.id,
					})
				);
				editor.multiSelect.shapes.deleteShapes();
				editor.history.addState('Turned a path into a component');
				editor.multiSelect.shapes.select(newShape);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'flipHorizontal',
			title: 'Flip Horizontal\nReflects the currently selected shape(s) horizontally.',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let shape = editor.multiSelect.shapes.virtualGlyph;
				shape.flipEW();
				editor.history.addState(`Flipped shape ${shape.name} horizontally`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'flipVertical',
			title: 'Flip Vertical\nReflects the currently selected shape(s) vertically',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let shape = editor.multiSelect.shapes.virtualGlyph;
				shape.flipNS();
				editor.history.addState(`flipped shape ${shape.name} vertically`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'round',
			title: `Round all path point and handle position values\nIf a x or y value for any point or a handle in the path has decimals, it will be rounded to the nearest whole number.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let shape = editor.multiSelect.shapes.virtualGlyph;
				shape.roundAll();
				editor.history.addState(
					`Rounded all the path point and handle position values in this shape`
				);
				editor.publish('currentItem', editor.selectedItem);
				showToast('Values were rounded for all the path points in the selected paths.');
			},
		},
	];

	// COMPONENT INSTANCE
	data.componentInstanceActions = [
		{
			iconName: 'switchPathComponent',
			iconOptions: true,
			title: `Turn Component Instance into a Path\nTakes the selected Component Instance, and un-links it from its Root Component,\nthen adds copies of all the Root Component's paths as regular Paths to this glyph.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let newShapes = [];
				editor.multiSelect.shapes.members.forEach((shape) => {
					if (shape.objType === 'ComponentInstance') {
						const sourceItem = editor.project.getItem(shape.link);
						newShapes = newShapes.concat(
							copyShapesFromTo(shape.transformedGlyph, editor.selectedItem)
						);
						removeLinkFromUsedIn(sourceItem, editor.selectedItemID);
					}
				});
				editor.multiSelect.shapes.deleteShapes();
				newShapes.forEach((shape) => editor.multiSelect.shapes.add(shape));
				editor.history.addState('Turned a component instance into a path');
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'deletePath',
			iconOptions: true,
			title: 'Delete\nRemoves the currently selected component instance from this glyph.',
			onClick: deleteSelectedPaths,
		},
	];

	// KERN GROUP
	data.kernGroupActions = [
		{
			iconName: 'edit',
			title: 'Edit this kern group',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				showAddEditKernGroupDialog(editor.selectedKernGroup);
			},
		},
		{
			iconName: 'delete',
			title: 'Delete this kern group',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const name = editor.selectedKernGroupID;
				editor.deleteSelectedItemFromProject();
				editor.history.addState(`Automatically navigated to ${editor.selectedItemID}`);
				editor.publish('whichKernGroupIsSelected', editor.selectedItemID);
				showToast(`Deleted ${name}.<br>(Don't worry, this action can be undone)`);
			},
		},
	];

	// LAYERS
	data.layerActions = [
		{
			iconName: 'moveLayerUp',
			title: `Move Path Up\nMoves the path up in the path layer order.`,
			disabled: selectedPaths.length !== 1,
			onClick: () => {
				moveLayer('up');
				const editor = getCurrentProjectEditor();
				editor.history.addState(`Moved layer up`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'moveLayerDown',
			title: `Move Path Down\nMoves the path down in the path layer order.`,
			disabled: selectedPaths.length !== 1,
			onClick: () => {
				moveLayer('down');
				const editor = getCurrentProjectEditor();
				editor.history.addState(`Moved layer down`);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
	];

	// ALIGN
	data.alignActions = [
		{
			title: `Align Left\nMoves all the selected shape so they are left aligned with the leftmost shape.`,
			iconName: 'align',
			iconOptions: 'left',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('left');
				editor.history.addState(`Left aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
		{
			title: `Align Center\nMoves all the selected shapes so they are center aligned between the leftmost and rightmost shape.`,
			iconName: 'align',
			iconOptions: 'center',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('center');
				editor.history.addState(`Center aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
		{
			title: `Align Right\nMoves all the selected shapes so they are right aligned with the rightmost shape.`,
			iconName: 'align',
			iconOptions: 'right',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('right');
				editor.history.addState(`Right aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
		{
			title: `Align Top\nMoves all the selected shapes so they are top aligned with the topmost shape.`,
			iconName: 'align',
			iconOptions: 'top',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('top');
				editor.history.addState(`Top aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
		{
			title: `Align Middle\nMoves all the selected shapes so they are middle aligned between the topmost and bottommost shape.`,
			iconName: 'align',
			iconOptions: 'middle',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('middle');
				editor.history.addState(`Middle aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
		{
			title: `Align Bottom\nMoves all the selected shapes so they are bottom aligned with the bottommost shape.`,
			iconName: 'align',
			iconOptions: 'bottom',
			onClick: () => {
				const editor = getCurrentProjectEditor();
				const vGlyph = editor.multiSelect.shapes;
				vGlyph.align('bottom');
				editor.history.addState(`Bottom aligned ${editor.multiSelect.shapes.length} shapes`);
				editor.publish('currentItem', vGlyph);
			},
		},
	];

	// COMBINE
	data.boolActions = [
		{
			iconName: 'combine',
			disabled: true,
			title: `Combine\nSelect two paths, and combine their paths into a single path.`,
		},
		{
			iconName: 'subtractUsingTop',
			disabled: true,
			title: `Subtract Using Upper\nSelect two paths, and the upper path will be used to cut out an area from the lower path.`,
		},
		{
			iconName: 'subtractUsingBottom',
			disabled: true,
			title: `Subtract Using Lower\nSelect two paths, and the lower path will be used to cut out an area from the upper path.`,
		},
	];

	// PATH POINT
	data.pointActions = [
		{
			iconName: 'insertPathPoint',
			title: `Insert Path Point\nAdds a new Path Point half way between the currently-selected point, and the next one.`,
			disabled: selectedPoints.length !== 1,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let newPoint = editor.multiSelect.shapes.singleton.insertPathPoint(
					selectedPoints[0].pointNumber
				);
				editor.history.addState(`Inserted a new path point at position ${newPoint.pointNumber}`);
				editor.multiSelect.points.select(newPoint);
				// editor.publish('currentPathPoint', editor.multiSelect.points.singleton);
			},
		},
		{
			iconName: 'deletePathPoint',
			title: `Delete Path Point\nRemoves the currently selected point or points from the path.`,
			disabled: selectedPaths.length === 0,
			onClick: deleteSelectedPoints,
		},
		{
			iconName: 'resetPathPoint',
			title: `Reset Handles\nMoves the handles of the currently selected point or points to default locations.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				editor.multiSelect.points.resetHandles();
				editor.history.addState(
					`Reset the handles for ${editor.multiSelect.points.length} path point(s)`
				);
				editor.publish('currentItem', editor.selectedItem);
			},
		},
		{
			iconName: 'round',
			title: `Round path point and handle position values\nIf a x or y value for the point or a handle has decimals, it will be rounded to the nearest whole number.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				editor.multiSelect.points.roundAll(0);
				editor.history.addState(
					`Rounded path point and handle position values for ${editor.multiSelect.points.length} path point(s)`
				);
				editor.publish('currentItem', editor.selectedItem);
				showToast('Values were rounded for the selected path points.');
			},
		},
		{
			iconName: 'selectNextPathPoint',
			disabled: editor.multiSelect.points.hasMultipleParents,
			title: `Select next Path Point\nSelect the path point that comes after the currently selected path point.\nHold [Ctrl] to add the next path point to the selection.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let msPoints = editor.multiSelect.points;
				let path = msPoints.members[0].parent;
				let thisIndex = msPoints.highestSelectedPointNumber;
				let nextIndex = path.getNextPointNum(thisIndex);
				// log(`eventHandlerData.isCtrlDown: ${eventHandlerData.isCtrlDown}`);

				if (eventHandlerData.isCtrlDown) {
					msPoints.add(path.pathPoints[nextIndex]);
				} else {
					msPoints.select(path.pathPoints[nextIndex]);
				}
				editor.publish('whichPathPointIsSelected', path.pathPoints[nextIndex]);
			},
		},
		{
			iconName: 'selectPreviousPathPoint',
			disabled: editor.multiSelect.points.hasMultipleParents,
			title: `Select pervious Path Point\nSelect the path point that comes before the currently selected path point.\nHold [Ctrl] to add the previous path point to the selection.`,
			onClick: () => {
				const editor = getCurrentProjectEditor();
				let msPoints = editor.multiSelect.points;
				let path = msPoints.members[0].parent;
				let thisIndex = msPoints.lowestSelectedPointNumber;
				let previousIndex = path.getPreviousPointNum(thisIndex);
				// log(`eventHandlerData.isCtrlDown: ${eventHandlerData.isCtrlDown}`);

				if (eventHandlerData.isCtrlDown) {
					msPoints.add(path.pathPoints[previousIndex]);
				} else {
					msPoints.select(path.pathPoints[previousIndex]);
				}
				editor.publish('whichPathPointIsSelected', path.pathPoints[previousIndex]);
			},
		},
	];

	return data[name];
}

// --------------------------------------------------------------
// Individual actions areas
// --------------------------------------------------------------

export function addChildActions(parent, actionsArray) {
	addAsChildren(
		parent,
		actionsArray.map((iconData) => makeActionButton(iconData))
	);
	return parent;
}

// Universal actions
export function makeActionsArea_Universal() {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });

	addChildActions(actionsArea, getActionData('allActions'));
	addChildActions(actionsArea, getActionData('addShapeActions'));

	// Dev actions for testing
	/*
	let dev = getGlyphrStudioApp().settings.dev;
	if (dev.testActions.length) {
		// DEV
		let devActions = [];
		if (dev.mode) {
			for (let a = 0; a < dev.testActions.length; a++) {
				devActions.push({
					iconName: 'test',
					title: dev.testActions[a].name,
					onClick: dev.testActions[a].onclick,
				});
			}
		}
		// actionsArea.appendChild(makeElement({tag:'h4', content:'test'}));
		addChildActions(actionsArea, getActionData('devActions'));
	}
	*/
	return actionsArea;
}

// Glyph actions
export function makeActionsArea_Glyph() {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });
	addChildActions(actionsArea, getActionData('glyphActions'));
	return actionsArea;
}

// Path actions
export function makeActionsArea_Path(test = false) {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });
	let alignActions = false;
	let selectedPaths = getCurrentProjectEditor().multiSelect.shapes.members;

	if (selectedPaths.length > 0 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'paths'}));
		addChildActions(actionsArea, getActionData('shapeActions'));
	}

	// Boolean combine actions
	if (selectedPaths.length > 1 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'path combine'}));
		addChildActions(actionsArea, getActionData('boolActions'));
	}

	// Layer actions
	if (selectedPaths.length === 1 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'path layers'}));
		addChildActions(actionsArea, getActionData('layerActions'));
	}

	// Path align actions
	if (selectedPaths.length > 1 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'align paths'}));
		alignActions = makeElement({ tag: 'div', className: 'panel__actions-area' });
		addChildActions(alignActions, getActionData('alignActions'));
	}

	return alignActions ? [actionsArea, alignActions] : actionsArea;
}

export function makeActionsArea_ComponentInstance(test = false) {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });
	let alignActions = false;
	let selectedPaths = getCurrentProjectEditor().multiSelect.shapes.members;

	if (selectedPaths.length > 0 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'paths'}));
		addChildActions(actionsArea, getActionData('componentInstanceActions'));
	}

	// Layer actions
	if (selectedPaths.length === 1 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'path layers'}));
		addChildActions(actionsArea, getActionData('layerActions'));
	}

	// Path align actions
	if (selectedPaths.length > 1 || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'align paths'}));
		alignActions = makeElement({ tag: 'div', className: 'panel__actions-area' });
		addChildActions(alignActions, getActionData('alignActions'));
	}

	return alignActions ? [actionsArea, alignActions] : actionsArea;
}

// Point actions
export function makeActionsArea_PathPoint(test = false) {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });
	let selectedPoints = getCurrentProjectEditor().multiSelect.points;
	let isPointSelected = false;
	if (selectedPoints.length > 0) isPointSelected = true;
	// if (_UI.selectedTool !== 'pathEdit') isPointSelected = false;
	if (isPointSelected || test) {
		// actionsArea.appendChild(makeElement({tag:'h4', content:'path point'}));
		addChildActions(actionsArea, getActionData('pointActions'));
	}

	return actionsArea;
}

// Kern Group actions
export function makeActionsArea_KernGroup() {
	let actionsArea = makeElement({ tag: 'div', className: 'panel__actions-area' });
	addChildActions(actionsArea, getActionData('kernGroupActions'));
	return actionsArea;
}

// --------------------------------------------------------------
// Delete selected path / point
// --------------------------------------------------------------

export function deleteSelectedPaths() {
	const editor = getCurrentProjectEditor();
	let msShapes = editor.multiSelect.shapes;

	let historyTitle;
	if (msShapes.length > 1) {
		historyTitle = `Deleted ${msShapes.length} paths`;
	} else {
		historyTitle = `Deleted path: ${msShapes.singleton.name}`;
	}

	msShapes.deleteShapes();
	editor.history.addState(historyTitle);
	editor.publish('currentItem', editor.multiSelect.shapes.virtualGlyph);
}

export function deleteSelectedPoints() {
	const editor = getCurrentProjectEditor();
	let msPoints = editor.multiSelect.points;

	let historyTitle;
	if (msPoints.length > 1) {
		historyTitle = `Deleted ${msPoints.length} path points`;
	} else {
		historyTitle = `Deleted path point: ${msPoints.singleton.pointNumber}`;
	}

	let minDeletedPoint = msPoints.deleteShapesPoints();
	editor.history.addState(historyTitle);
	let pathSingleton = editor.multiSelect.shapes.singleton;
	if (pathSingleton) {
		msPoints.select(pathSingleton.pathPoints[pathSingleton.getPreviousPointNum(minDeletedPoint)]);
	} else {
		editor.publish('whichPathPointIsSelected', editor.multiSelect.shapes);
	}
}

// --------------------------------------------------------------
// Layers
// --------------------------------------------------------------

function moveLayer(direction = 'up') {
	const editor = getCurrentProjectEditor();
	const selectedPath = editor.multiSelect.shapes.singleton;
	const itemPaths = editor.selectedItem.shapes;
	const currentIndex = itemPaths.indexOf(selectedPath);
	let tempPath;

	if (direction === 'down') {
		if (currentIndex > 0 && currentIndex < itemPaths.length) {
			tempPath = itemPaths[currentIndex - 1];
			itemPaths[currentIndex - 1] = itemPaths[currentIndex];
			itemPaths[currentIndex] = tempPath;
		}
	} else {
		if (currentIndex > -1 && currentIndex < itemPaths.length - 1) {
			tempPath = itemPaths[currentIndex + 1];
			itemPaths[currentIndex + 1] = itemPaths[currentIndex];
			itemPaths[currentIndex] = tempPath;
		}
	}
}

// --------------------------------------------------------------
// Combine
// --------------------------------------------------------------
// TODO boolean combine
/*
function combineSelectedPaths() {
	showToast('Combining selected paths... ', 100);
	const editor = getCurrentProjectEditor();
	setTimeout(function () {
		editor.multiSelect.shapes.combine();
		editor.history.addState('combine selected paths');
		// redraw({ calledBy: 'actions panel' });
	}, 200);
}

function combineAllGlyphPaths() {
	showToast('Combining all glyph paths... ', 100);
	const editor = getCurrentProjectEditor();
	setTimeout(function () {
		editor.selectedItem.combineAllShapes(true);
		editor.history.addState('combine all glyph paths');
		// redraw({ calledBy: 'actions panel' });
	}, 200);
}
*/

// --------------------------------------------------------------
// Copy Paste
// --------------------------------------------------------------
export function clipboardCopy() {
	// log(`clipboardCopy`, 'start');

	const editor = getCurrentProjectEditor();
	let selPaths = [];
	let button = document.getElementById('actionButtonPaste');

	editor.multiSelect.shapes.members.forEach((shape) => {
		selPaths.push(shape.save(true));
	});

	if (selPaths.length) {
		editor.clipboard = {
			shapes: selPaths,
			sourceID: editor.selectedItemID,
			dx: 0,
			dy: 0,
		};
		button.removeAttribute('disabled');
	} else {
		editor.clipboard = false;
		button.setAttribute('disabled', 'disabled');
	}

	button.setAttribute('title', makeActionButtonPasteTooltip(selPaths.length));
	// log(editor.clipboard);
	// log(`clipboardCopy`, 'end');
}

export function clipboardPaste() {
	// log('clipboardPaste', 'start');
	const editor = getCurrentProjectEditor();
	let clipboard = editor.clipboard;
	let offsetPaths = clipboard.sourceID === editor.selectedItemID;

	if (clipboard && offsetPaths) {
		clipboard.dx += 20;
		clipboard.dy -= 20;
	}

	if (clipboard && clipboard.shapes.length) {
		let newShapes = [];

		let newShape, newName, newSuffix, caret, suffix;
		clipboard.shapes.forEach((shape) => {
			if (shape.objType === 'ComponentInstance') {
				newShape = new ComponentInstance(shape);
			} else {
				newShape = new Path(shape);
			}

			if (offsetPaths) {
				newShape.updateShapePosition(clipboard.dx, clipboard.dy, true);
			}

			newName = newShape.name;
			newSuffix = ' (copy)';
			caret = newShape.name.lastIndexOf('(copy');

			if (caret > 0) {
				suffix = newName.substring(caret + 5);
				newName = newName.substring(0, caret);
				if (suffix === ')') {
					newSuffix = '(copy 2)';
				} else {
					// log("\t - suffix " + suffix);
					suffix = suffix.substring(1);
					// log("\t - suffix " + suffix);
					suffix = suffix.substring(0, suffix.length - 1);
					// log("\t - suffix " + suffix);
					newSuffix = '(copy ' + (parseInt(suffix) + 1) + ')';
					// log("\t - newSuffix " + newSuffix);
				}
			}
			newShape.name = newName + newSuffix;

			if (newShape.objType === 'ComponentInstance') {
				addLinkToUsedIn(editor.project.getItem(newShape.link), editor.selectedItemID);
			}

			newShapes.push(newShape);
		});

		// log(`New paths that have been copied`);
		// log(newShapes);

		editor.multiSelect.shapes.clear();
		editor.multiSelect.points.clear();

		const addedShapes = [];
		newShapes.forEach((shape) => {
			addedShapes.push(editor.selectedItem.addOneShape(shape));
		});

		addedShapes.forEach((shape) => editor.multiSelect.shapes.add(shape));

		clipboard.sourceID = editor.selectedItemID;

		let len = newShapes.length;
		editor.history.addState(len === 1 ? 'Pasted Path' : `Pasted ${len} Paths`);
		editor.publish('currentItem', editor.selectedItem);
	}
	// log('clipboardPaste', 'end');
}

export function makeActionButtonPasteTooltip(clipBoardPathCount) {
	let re = `Paste\nAdds the previously-copied shape(s) into this glyph.\n\n`;
	re += `Currently ${clipBoardPathCount} Path${
		clipBoardPathCount === 1 ? '' : 's'
	} on the clipboard.`;
	return re;
}

function showDialogChooseOtherItem(type) {
	// log(`showDialogChooseOtherItem`, 'start');
	// log(`type: ${type}`);

	let content = makeElement({
		innerHTML: '<h2>Choose another glyph</h2>',
	});
	let onClick = false;

	if (type === 'copyPaths') {
		content.innerHTML += `All the paths from the glyph you select will be copied and pasted into this glyph.<br><br>`;
		onClick = (itemID) => {
			const editor = getCurrentProjectEditor();
			const otherItem = editor.project.getItem(itemID);
			const thisItem = editor.selectedItem;
			const newShapes = copyShapesFromTo(otherItem, thisItem, false);
			editor.multiSelect.shapes.clear();
			newShapes.forEach((shape) => editor.multiSelect.shapes.add(shape));
			editor.publish('currentItem', thisItem);
			editor.history.addState(`Paths were copied from ${otherItem.name}.`);
			closeEveryTypeOfDialog();
			showToast(`${otherItem.shapes.length} paths copied from<br>${otherItem.name}`);
		};
	}

	if (type === 'addAsComponentInstance') {
		content.innerHTML += `The glyph you select will be treated as a root component, and added to this glyph as a component instance.<br><br>`;
		onClick = (itemID) => {
			const editor = getCurrentProjectEditor();
			let otherItem = editor.project.getItem(itemID);
			if (!otherItem) {
				editor.project.addNewItem(new Glyph({}), 'Glyph', itemID);
				otherItem = editor.project.getItem(itemID);
			}
			const thisItem = editor.selectedItem;
			const newInstance = linkComponentFromTo(otherItem, thisItem);
			if (newInstance) {
				editor.publish('currentItem', thisItem);
				editor.multiSelect.shapes.add(newInstance);
				editor.history.addState(`Component instance was linked from ${otherItem.name}.`);
				closeEveryTypeOfDialog();
				showToast(`Component instance linked from<br>${otherItem.name}`);
			} else {
				closeEveryTypeOfDialog();
				showError(`
					Cannot add ${thisItem.name} to ${otherItem.name} as a component instance.
					<br>
					This is usually because adding the link would create a circular reference.
					`);
			}
		};
	}

	if (type === 'linkAsComponent') {
		content.innerHTML += `This component will be linked to the glyph you select as a component instance.<br><br>`;
		onClick = (itemID) => {
			const editor = getCurrentProjectEditor();
			let destinationItem = editor.project.getItem(itemID);
			if (!destinationItem) {
				editor.project.addNewItem(new Glyph({}), 'Glyph', itemID);
				destinationItem = editor.project.getItem(itemID);
			}
			const thisItem = editor.selectedItem;
			const newInstance = linkComponentFromTo(thisItem, destinationItem);
			if (newInstance) {
				editor.publish('currentItem', thisItem);
				editor.history.addState(`Component was linked to ${destinationItem.name}.`);
				closeEveryTypeOfDialog();
				showToast(`Component was linked to<br>${destinationItem.name}`);
			} else {
				closeEveryTypeOfDialog();
				showError(`
				Cannot add ${thisItem.name} to ${destinationItem.name} as a component instance.
					<br>
					This is usually because adding the link would create a circular reference.
					`);
			}
		};
	}

	const scrollArea = makeElement({
		tag: 'div',
		className: 'modal-dialog__glyph-chooser-scroll-area',
	});

	const chooserArea = makeAllItemTypeChooserContent(onClick, 'Characters');
	scrollArea.appendChild(chooserArea);
	content.appendChild(scrollArea);
	showModalDialog(content);
	// log(`showDialogChooseOtherItem`, 'end');
}

/**
 * Create a component instance given another item.
 * @param {Glyph} sourceItem - new component root
 * @param {Glyph} destinationItem - where to put the component instance
 */
export function linkComponentFromTo(sourceItem, destinationItem) {
	if (!canAddComponent(destinationItem, sourceItem.id)) return false;
	const newInstance = new ComponentInstance({ link: sourceItem.id });
	destinationItem.addOneShape(newInstance);
	addLinkToUsedIn(sourceItem, destinationItem.id);
	return newInstance;
}

/**
 * Copy paths (and attributes) from one glyph to another
 * @param {Glyph} sourceItem - source to copy paths from
 * @param {Glyph} destinationItem - where to copy paths to
 * @param {Object} updateWidth - should advance width copy as well
 */
export function copyShapesFromTo(sourceItem, destinationItem, updateWidth = false) {
	// log('copyShapesFromTo', 'start');
	// log(`Source item`);
	// log(sourceItem);
	// log(`Destination item`);
	// log(destinationItem);

	const editor = getCurrentProjectEditor();
	let item;
	let newShape;
	let newShapes = [];
	for (let c = 0; c < sourceItem.shapes.length; c++) {
		item = sourceItem.shapes[c];
		if (item.objType === 'ComponentInstance') {
			addLinkToUsedIn(editor.project.getItem(item.link), destinationItem.id);
			item = new ComponentInstance(item);
		} else if (item.objType === 'Path') {
			item = new Path(item);
		}

		newShape = destinationItem.addOneShape(item);
		newShapes.push(newShape);
	}

	if (updateWidth) {
		destinationItem.advanceWidth = sourceItem.advanceWidth;
	}

	// log('Result for destination item:');
	// log(destinationItem);
	// log(`Returning newShapes`);
	// log(newShapes);
	// log('copyShapesFromTo', 'end');
	return newShapes;
}
