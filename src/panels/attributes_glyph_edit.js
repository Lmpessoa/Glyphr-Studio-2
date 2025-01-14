import { getCurrentProjectEditor } from '../app/main.js';
import { makeCard_componentInstanceAttributes } from './card_component_instance.js';
import { makeCard_glyphAttributes, makeCard_glyphLinks } from './card_glyph.js';
import { makeCard_multiSelectPathAttributes, makeCard_pathAttributes } from './card_path.js';
import {
	makeCard_multiSelectPathPointAttributes,
	makeCard_pathPointAttributes,
} from './card_path_point.js';
import { refreshPanel } from './panels.js';

/**
	Panel > Attributes > Glyph
	Builds a panel of attributes for a Glyph,
	which changes based on Path or Path Point
	selection.
**/

export function makePanel_GlyphAttributes() {
	// log('makePanel_GlyphAttributes', 'start');
	const editor = getCurrentProjectEditor();
	let content = [];
	// log(editor);

	// Path Points
	let selPoints = editor.multiSelect.points;
	// log(selPoints);
	if (selPoints.length === 1) {
		// log(`pushing point card`);
		content.push(makeCard_pathPointAttributes(selPoints.singleton));
	} else if (selPoints.length > 1) {
		let virtualShape = selPoints.virtualShape;
		content.push(makeCard_multiSelectPathPointAttributes(virtualShape));
	}

	// Shapes
	let selShapes = editor.multiSelect.shapes;
	if (selShapes.length === 1) {
		// One shape selected
		// log('One shape selected');
		// log(selShapes.singleton);
		if (selShapes.singleton.objType === 'ComponentInstance') {
			// component selected
			// log("...Component selected");
			content.push(makeCard_componentInstanceAttributes(selShapes.singleton));
		} else {
			// regular path selected
			// log("...Regular path selected");
			content.push(makeCard_pathAttributes(selShapes.singleton));
		}
	} else if (selShapes.length > 1 && selPoints.length === 0) {
		// Many shapes selected
		// log('More than one shape selected');
		content.push(makeCard_multiSelectPathAttributes(selShapes.virtualGlyph));
	}

	// Glyph
	content.push(makeCard_glyphAttributes(editor.selectedItem));
	const linksCard = makeCard_glyphLinks(editor.selectedItem);
	if (linksCard) content.push(linksCard);

	// Subscriber
	editor.subscribe({
		topic: 'whichPathIsSelected',
		subscriberID: 'attributesPanel',
		callback: () => {
			refreshPanel();
		},
	});
	editor.subscribe({
		topic: 'whichPathPointIsSelected',
		subscriberID: 'attributesPanel',
		callback: () => {
			refreshPanel();
		},
	});

	// log(content);
	// log('makePanel_GlyphAttributes', 'end');
	return content;
}
