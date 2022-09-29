import { getCurrentProject, getCurrentProjectEditor } from "../app/main.js";
import { accentColors } from "../common/colors.js";
import { makeElement } from "../common/dom.js";
import { makeIcon } from "../common/graphics.js";
import { areHexValuesEqual, basicLatinOrder } from "../common/unicode.js";
import { GlyphTile } from "../controls/glyph-tile/glyph-tile.js";


// --------------------------------------------------------------
// Page chooser
// --------------------------------------------------------------

export function makeChooserContent_Pages(){
	// log(`makeChooserContent_Pages`, 'start');

	let content = makeElement();
	let pageButton;
	let toc = getCurrentProjectEditor().nav.tableOfContents;

	Object.keys(toc).forEach((pageName) => {
		if(pageName !== 'Open project' && toc[pageName].pageMaker){
		// if(pageName !== 'Open project'){
			pageButton = makeNavButton_Page(pageName, toc[pageName].iconName);
			content.appendChild(pageButton);
		}
	});

	// log(`makeChooserContent_Pages`, 'end');
	return content;
}

function makeNavButton_Page(pageName, iconName) {
	let button = makeElement({tag: 'button', className: 'nav-dropdown__button'});
	button.innerHTML += makeIcon({name: iconName, color: accentColors.blue.l90});
	button.appendChild(makeElement({content: pageName}));
	button.addEventListener('click', () => getCurrentProjectEditor().navigate(pageName));
	return button;
}


// --------------------------------------------------------------
// Glyph chooser
// --------------------------------------------------------------

export function makeChooserContent_Glyphs(clickHandler, registerSubscriptions = true){
	// log(`makeChooserContent_Glyphs`, 'start');
	const editor = getCurrentProjectEditor();

	// let content = `<div class="glyph-chooser__tile-grid">`;
	let container = makeElement({tag: 'div', className: 'glyph-chooser__tile-grid'});

	basicLatinOrder.forEach(glyphID => {
		let oneTile = (editor.selectedGlyphID === glyphID)?
			new GlyphTile({glyph: glyphID, selected: 'true'}) :
			new GlyphTile({glyph: glyphID});

		oneTile.addEventListener('click', () => clickHandler(glyphID));

		if(registerSubscriptions) {
			editor.subscribe({
				topic:'whichGlyphIsSelected',
				subscriberID: `glyphTile.${glyphID}`,
				callback: (newGlyphID) => {
					// log('whichGlyphIsSelected subscriber callback');
					// log(`checking if ${glyph.id} === ${glyphID}`);
					if(areHexValuesEqual(newGlyphID, glyphID)){
						// log(`Callback: setting ${oneTile.getAttribute('glyph')} attribute to selected`);
						oneTile.setAttribute('selected', '');
					} else {
						// log(`Callback: removing ${oneTile.getAttribute('glyph')} attribute selected`);
						oneTile.removeAttribute('selected');
					}
				}
			});
		}

		container.appendChild(oneTile);
	});

	// log('Project Editor PubSub:');
	// log(editor.subscribers);

	// log(container);
	// log(`makeChooserContent_Glyphs`, 'end');
	return container;
}


// --------------------------------------------------------------
// Panel chooser
// --------------------------------------------------------------

export function makeChooserContent_Panels(){
	// log(`makeChooserContent_Panels`, 'start');

	let content = makeElement();
	let pageButton;
	let panels = listOfPanels();
	let shownPanels = ['Attributes', 'Layers', 'History', 'Guides'];

	shownPanels.forEach((panelName) => {
		pageButton = makeNavButton_Panel(panelName, panels[panelName].iconName);
		content.appendChild(pageButton);
	});

	// log(`makeChooserContent_Panels`, 'end');
	return content;
}

function makeNavButton_Panel(panelName, iconName) {
	let button = makeElement({tag: 'button', className: 'nav-dropdown__button'});
	button.innerHTML += makeIcon({name: iconName, color: accentColors.blue.l90});
	button.appendChild(makeElement({content: panelName}));
	button.addEventListener('click', () => {
		const editor = getCurrentProjectEditor();
		editor.nav.panel = panelName;
		editor.navigate();
	});
	return button;
}

/**
 * List of panels the editor supports
 */
function listOfPanels() {
	return {
		'Chooser': {
			name: 'Chooser',
			panelMaker: false,
			iconName: 'panel_chooser',
		},
		'Layers': {
			name: 'Layers',
			panelMaker: false,
			iconName: 'panel_layers',
		},
		'Guides': {
			name: 'Guides',
			panelMaker: false,
			iconName: 'panel_guides',
		},
		'History': {
			name: 'History',
			panelMaker: false,
			iconName: 'panel_history',
		},
		'Attributes': {
			name: 'Attributes',
			panelMaker: false,
			iconName: 'panel_attributes',
		},
	};
}