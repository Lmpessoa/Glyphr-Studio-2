import { getCurrentProject } from '../app/main.js';
import { deleteSelectedPaths } from '../panels/actions.js';
import { Glyph } from '../project_data/glyph.js';
import { Path } from '../project_data/path.js';

// --------------------------------------------------------------
// Project-wide .changed()
// --------------------------------------------------------------

/**
 * Calls .changed() on peer glyph objects to this glyph
 * NOTE: .changed() for other glyph elements are on their respective
 * objects. This one is centrally located because it looks across
 * the whole project.
 * @param {Glyph} glyph - glyph to mark as changed
 */
export function glyphChanged(glyph) {
	// log(`glyphChanged`, 'start');
	// log(glyph);
	if (glyph.cache) glyph.cache = {};
	const project = getCurrentProject();
	glyph.usedIn = glyph.usedIn || [];
	glyph.usedIn.forEach((itemID) => {
		const item = project.getItem(itemID);
		if (item) {
			glyphChanged(item);
			if (item.shapes) {
				item.shapes.forEach((shape) => {
					if (shape.objType === 'ComponentInstance') shape.cache = {};
				});
			}
		}
	});
	// log(`glyphChanged`, 'end');
}

// --------------------------------------------------------------
// Make other languages
// --------------------------------------------------------------

export function makeGlyphSVGforExport(glyph) {
	// log('Glyph.makeSVGforExport', 'start');
	// log(glyph);
	let size = Math.max(glyph.maxes.height, glyph.maxes.width);
	let svg = glyph.svgPathData;
	// log(svg);

	let re = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `;
	re += `width="${size}" height="${size}" viewBox="0,0,${size},${size}">\n`;
	re += `\t<g transform="translate(100,${size})">\n`;
	re += `\t\t<path d="${svg}"/>\n`;
	re += `\t</g>\n</svg>`;

	// log(re);
	// log('Glyph.makeSVGforExport', 'end');
	return re;
}

/**
 * Make a PostScript path from this path
 * PostScript paths use relative MoveTo commands, so
 * this path must know about where the last path left off
 * @param {Number} lastX - x from previous path
 * @param {Number} lastY - y from previous path
 * @returns {String} - PostScript path data
 */
export function makeGlyphPostScript(glyph, lastX, lastY) {
	const g = glyph.transformedGlyph;
	let re;
	let part;
	g.shapes.forEach((shape) => {
		part = shape.makePostScript(lastX, lastY);
		lastX = part.lastX;
		lastY = part.lastY;
		re += part.re;
	});
	return {
		re: re,
		lastX: lastX,
		lastY: lastY,
	};
}

// --------------------------------------------------------------
// Component links and usedin array stuff
// --------------------------------------------------------------

/**
 * Converts all the Component Instances in this Glyph to stand-alone paths
 * @returns {Glyph}
 */
export function makeGlyphWithResolvedLinks(sourceGlyph) {
	// log(`makeGlyphWithResolvedLinks`, 'start');
	let newPaths = [];
	sourceGlyph.shapes.forEach((shape) => {
		if (shape.objType === 'Path') {
			newPaths.push(new Path(shape));
		} else if (shape.objType === 'ComponentInstance') {
			const transformedGlyph = shape.transformedGlyph;
			if (transformedGlyph && transformedGlyph.shapes) {
				const resolvedGlyph = makeGlyphWithResolvedLinks(transformedGlyph);
				newPaths = newPaths.concat(resolvedGlyph.shapes);
			}
		}
	});

	// log(`makeGlyphWithResolvedLinks`, 'end');
	return new Glyph({ shapes: newPaths, parent: getCurrentProject() });
}

/**
 * Component Instances contain links to other Glyphs, or
 * other Component Instances.  Circular links cause the world
 * to explode, so let's check for those before we add a new link.
 * @param {String} componentID - ID of component to look for
 * @returns {Boolean}
 */
export function canAddComponent(destinationItem, componentID) {
	// log('Glyph.canAddComponent', 'start');
	// log('adding ' + componentID + ' to (me) ' + destinationItem.id);
	if (destinationItem.id === componentID) return false;
	if (!destinationItem.usedIn || destinationItem.usedIn.length === 0) return true;
	let downlinks = collectAllDownstreamLinks(destinationItem, [], true);
	downlinks = downlinks.filter(function (elem, pos) {
		return downlinks.indexOf(elem) === pos;
	});
	let uplinks = collectAllUpstreamLinks(destinationItem, []);
	uplinks = uplinks.filter(function (elem, pos) {
		return uplinks.indexOf(elem) === pos;
	});
	// log('downlinks: ' + downlinks);
	// log('uplinks: ' + uplinks);
	if (downlinks.indexOf(componentID) > -1) return false;
	if (uplinks.indexOf(componentID) > -1) return false;

	return true;
}

/**
 * Look "down" through component instances, collecting IDs
 * @param {Array} result - collection of item IDs
 * @param {Boolean} excludePeers - At the top level, no need to collect IDs
 * @returns {Array}
 */
function collectAllDownstreamLinks(item, result = [], excludePeers = false) {
	item.shapes.forEach((shape) => {
		if (shape.objType === 'ComponentInstance') {
			const linkedShape = getCurrentProject().getItem(shape.link);
			result = result.concat(collectAllDownstreamLinks(linkedShape, result));
			if (!excludePeers) result.push(shape.link);
		}
	});
	return result;
}

/**
 * Look "up" through the usedIn array to collect IDs
 * @param {Array} result - collection of item IDs
 * @returns {Array}
 */
function collectAllUpstreamLinks(item, result = []) {
	item.usedIn.forEach((itemID) => {
		const linkedItem = getCurrentProject().getItem(itemID);
		result = result.concat(collectAllUpstreamLinks(linkedItem, result));
		result.push(itemID);
	});
	return result;
}

/**
 * This method is called on Glyphs just before they are deleted
 * to clean up all the component instance linking
 * @param {Glyph} item - item being deleted
 */
export function deleteLinks(item) {
	// log('Glyph.deleteLinks', 'start');
	// log('passed this as id: ' + item.id);
	// Delete upstream Component Instances
	let upstreamGlyph;
	const project = getCurrentProject();
	for (let c = 0; c < item.usedIn.length; c++) {
		upstreamGlyph = project.getItem(item.usedIn[c]);
		// log('removing from ' + upstreamGlyph.name);
		// log(upstreamGlyph.shapes);
		for (let u = 0; u < upstreamGlyph.shapes.length; u++) {
			if (
				upstreamGlyph.shapes[u].objType === 'ComponentInstance' &&
				upstreamGlyph.shapes[u].link === item.id
			) {
				upstreamGlyph.shapes.splice(u, 1);
				u--;
			}
		}
		// log(upstreamGlyph.shapes);
	}
	// Delete downstream usedIn array values
	for (let s = 0; s < item.shapes.length; s++) {
		if (item.shapes[s].objType === 'ComponentInstance') {
			removeLinkFromUsedIn(project.getItem(item.shapes[s].link), item.id);
		}
	}
}

// --------------------------------------------------------------
// Used-In array
// --------------------------------------------------------------

/**
 * When an Item is linked-to from another ComponentInstance, track
 * where it's being used by adding it to item.usedIn
 * @param {Glyph} item - reference to the item (Glyph, Component, Ligature)
 * @param {String} linkID - itemID where the item is being used as a Component Instance
 */
export function addLinkToUsedIn(item, linkID) {
	// log(`addLinkToUsedIn`, 'start');
	// log(`linkID: ${linkID}`);
	// log(`usedIn BEFORE:`);
	// log(item.usedIn);
	// log(item);
	item.usedIn.push('' + linkID);
	// sort numerically as opposed to alpha
	item.usedIn.sort(function (a, b) {
		return a - b;
	});
	// log(`usedIn AFTER:`);
	// log(item.usedIn);
	// log(`addLinkToUsedIn`, 'end');
}

/**
 * Removes a link from an item's usedIn array
 * @param {Glyph} item - reference to the item (Glyph, Component, Ligature)
 * @param {String} linkID - itemID where the item is being used as a Component Instance
 */
export function removeLinkFromUsedIn(item, linkID) {
	// log(`removeLinkFromUsedIn`, 'start');
	// log(`linkID: ${linkID}`);
	// log(item.usedIn);

	const idIndex = item.usedIn.indexOf('' + linkID);
	// log(`idIndex: ${idIndex}`);

	if (idIndex !== -1) {
		// log(`Removing ${idIndex}`);

		item.usedIn.splice(idIndex, 1);
	}
	// log(item.usedIn);
	// log(`removeLinkFromUsedIn`, 'end');
}

/**
 * Called before a glyph is deleted. if this glyph is used as a
 * component root, then we also have to delete the component instances
 * from other glyphs.
 * @param {Glyph} rootGlyph - glyph where the usedIn array is the delete list
 */
/*
NOT ALLOWED
export function deleteComponentInstancesBasedOnRootList(rootGlyph) {
	// log(`deleteComponentInstancesBasedOnRootList`, 'start');

	let project = getCurrentProject();
	if (rootGlyph.usedIn.length) {
		rootGlyph.usedIn.forEach((id) => {
			// log(`rootGlyph.usedIn id: ${id}`);

			let parent = project.getItem(id);
			for (let p = 0; p < parent.shapes.length; p++) {
				// log(`path ${p} link = ${parent.shapes[p]?.link}`);
				if (parent.shapes[p]?.link === rootGlyph.id) {
					// log(`>>>HIT<<<`);
					if (p > -1) parent.shapes.splice(p, 1);
					parent.changed();
					break;
				}
			}
		});
	}
	// log(`deleteComponentInstancesBasedOnRootList`, 'end');
}
*/
