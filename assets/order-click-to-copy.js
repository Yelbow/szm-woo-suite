/*
 * SZM Woo Suite - click-to-copy on the WooCommerce order edit screen.
 * Wraps name, street line, "Huisnummer" value and e-mail in inline spans (no
 * styling, so nothing moves at rest). Click = select that text + copy it.
 * Skipped while the address is in edit mode and after a drag-select.
 * No network calls, nothing is logged.
 */
(function () {
	'use strict';

	var cfg = window.szmWooCtc || {};
	var CLS = 'szm-ctc';
	var rangeTargets = [];
	var NL_POSTCODE = /^\s*(\d{4}\s?[A-Za-z]{2})(?=\s|$)/;

	function norm(s) {
		return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
	}

	function inputVal(col, name) {
		var el = col.querySelector('input[name="' + name + '"]');
		return el ? el.value : '';
	}

	function wrapRange(node, start, end) {
		// Split a text node into before / span / after. Rendering is unchanged.
		var text = node.nodeValue;
		var span = document.createElement('span');
		span.className = CLS;
		if (cfg.title) {
			span.title = cfg.title;
		}
		span.textContent = text.slice(start, end);
		var parent = node.parentNode;
		var after = text.slice(end);
		node.nodeValue = text.slice(0, start);
		parent.insertBefore(span, node.nextSibling);
		if (after) {
			parent.insertBefore(document.createTextNode(after), span.nextSibling);
		}
		if (!node.nodeValue) {
			parent.removeChild(node);
		}
		return span;
	}

	function wrapWhole(node) {
		var text = node.nodeValue;
		var lead = text.length - text.replace(/^\s+/, '').length;
		var trimmed = text.replace(/\s+$/, '');
		if (trimmed.length <= lead) {
			return null;
		}
		return wrapRange(node, lead, trimmed.length);
	}

	// Split the children of a <p> into lines at <br>. Only text-only lines are used.
	function linesOf(p) {
		var lines = [[]];
		for (var n = p.firstChild; n; n = n.nextSibling) {
			if (n.nodeType === 1 && n.nodeName === 'BR') {
				lines.push([]);
			} else {
				lines[lines.length - 1].push(n);
			}
		}
		return lines.filter(function (l) {
			return l.length === 1 && l[0].nodeType === 3 && l[0].nodeValue.trim() !== '';
		});
	}

	function prefixOf(col) {
		return col.classList.contains('order_data_column_shipping') ? '_shipping_' : '_billing_';
	}

	function processAddress(col) {
		var addr = col.querySelector('.address');
		if (!addr) {
			return;
		}
		var pre = prefixOf(col);
		var fullName = norm(inputVal(col, pre + 'first_name') + ' ' + inputVal(col, pre + 'last_name'));
		var company = norm(inputVal(col, pre + 'company'));
		var postcodeInput = norm(inputVal(col, pre + 'postcode'));

		// Address <p>: the first child <p> that does not start with a <strong> label.
		var p = null;
		for (var c = addr.firstElementChild; c; c = c.nextElementSibling) {
			if (c.nodeName === 'P' && !(c.firstElementChild && c.firstElementChild.nodeName === 'STRONG')) {
				p = c;
				break;
			}
		}
		if (p) {
			var lines = linesOf(p);
			var nameLine = null;
			var i;
			if (fullName) {
				for (i = 0; i < lines.length; i++) {
					if (norm(lines[i][0].nodeValue) === fullName) {
						nameLine = lines[i];
						break;
					}
				}
			}
			if (!nameLine && lines.length) {
				// Fallback: first line, or the second when the first is the company.
				nameLine = lines[0];
				if (company && norm(nameLine[0].nodeValue) === company && lines[1]) {
					nameLine = lines[1];
				}
			}
			if (nameLine) {
				wrapWhole(nameLine[0]);
			}
			for (i = 0; i < lines.length; i++) {
				var node = lines[i][0];
				if (!node.parentNode || node.parentNode !== p) {
					continue; // already wrapped (name line)
				}
				var text = node.nodeValue;
				var m = NL_POSTCODE.exec(text);
				var s = -1;
				var e = -1;
				if (m) {
					s = text.indexOf(m[1]);
					e = s + m[1].length;
				} else if (postcodeInput && norm(text).indexOf(postcodeInput) === 0) {
					// Non-Dutch postcode as stored in the order, at the start of the line.
					s = text.search(/\S/);
					e = s + postcodeInput.length;
				}
				if (s >= 0) {
					// Street line (street + house number) = the text line right before the postcode line.
					// Wrapped whole as a plain inline span (a full line, so no sub-pixel shift).
					var prev = i > 0 ? lines[i - 1][0] : null;
					if (prev && prev.parentNode === p) {
						wrapWhole(prev);
					}
					// Not wrapped: splitting the "postcode city" line into two inline boxes
					// shifts the city by sub-pixel anti-aliasing. Hit-tested by range instead.
					rangeTargets.push({ node: node, start: s, end: e });
					break;
				}
			}
		}

		// E-mail: wrap the link text, the link itself keeps its look.
		var mails = col.querySelectorAll('.address a[href^="mailto:"]');
		for (var k = 0; k < mails.length; k++) {
			var a = mails[k];
			if (a.children.length === 0 && a.firstChild && a.firstChild.nodeType === 3) {
				wrapWhole(a.firstChild);
			}
		}
	}

	// "Huisnummer:" custom field, tolerant of markup. Core prints
	// <p><strong>Label:</strong> value</p>; plugins may use <br>, wrapper span/div,
	// <label>, &nbsp;, or put the value in the next sibling element.
	var LABEL_ONLY = /^\s*huisnummer\s*:?\s*$/i;
	var LABEL_INLINE = /^(\s*huisnummer\s*:?\s+)(\S[\s\S]*)$/i;

	function skipText(n) {
		var el = n.parentNode;
		return !el || !el.closest || el.closest('div.edit_address, select, textarea, input, script, style, .' + CLS);
	}

	function textNodesIn(root) {
		var out = [];
		var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		for (var n = w.nextNode(); n; n = w.nextNode()) {
			if (n.nodeValue.trim() !== '' && !skipText(n)) {
				out.push(n);
			}
		}
		return out;
	}

	// First non-blank text of a following sibling; null = nothing here, false = stop (next label or mail link).
	function valueIn(sib) {
		if (sib.nodeType === 3) {
			return sib.nodeValue.trim() === '' ? null : sib;
		}
		if (sib.nodeType !== 1 || sib.nodeName === 'BR' || sib.nodeName === 'SCRIPT' || sib.nodeName === 'STYLE') {
			return null;
		}
		if (sib.matches('div.edit_address') || sib.querySelector('input, select, textarea')) {
			return false;
		}
		var txt = sib.textContent.trim();
		if (txt === '') {
			return null;
		}
		if (/^(strong|b|label|h\d)$/i.test(sib.nodeName) || /:$/.test(txt) || sib.closest('a[href^="mailto:"]') || sib.querySelector('a[href^="mailto:"]')) {
			return false;
		}
		var nodes = textNodesIn(sib);
		return nodes.length ? nodes[0] : false;
	}

	function processHuisnummer(col) {
		var nodes = textNodesIn(col);
		for (var i = 0; i < nodes.length; i++) {
			var n = nodes[i];
			if (!n.parentNode || n.parentNode.closest('.' + CLS)) {
				continue;
			}
			var inline = LABEL_INLINE.exec(n.nodeValue);
			if (inline) {
				// "Huisnummer: 35" in one text node.
				var st = inline[1].length;
				var en = n.nodeValue.replace(/\s+$/, '').length;
				if (en > st) {
					wrapRange(n, st, en);
				}
				continue;
			}
			if (!LABEL_ONLY.test(n.nodeValue)) {
				continue;
			}
			// Label found. Look at the following siblings, climbing at most 4 levels (not above the column).
			var cur = n;
			var target = null;
			for (var depth = 0; depth < 4 && cur && cur !== col && !target; depth++) {
				for (var sib = cur.nextSibling; sib; sib = sib.nextSibling) {
					var v = valueIn(sib);
					if (v === false) {
						cur = null;
						break;
					}
					if (v) {
						target = v;
						break;
					}
				}
				if (cur) {
					cur = cur.parentNode;
				}
			}
			if (target) {
				// Adjacent text nodes (split by comments) are merged first so the value is one node.
				var par = target.parentNode;
				var prevSib = target.previousSibling;
				par.normalize();
				target = prevSib && prevSib.nodeType === 3 && prevSib.parentNode === par ? target : (target.parentNode === par ? target : null);
				if (target && target.parentNode) {
					wrapWhole(target);
				}
			}
		}
	}

	function inEditMode(el) {
		var col = el.closest('.order_data_column');
		var form = col && col.querySelector('div.edit_address');
		return !!(form && form.offsetParent !== null && window.getComputedStyle(form).display !== 'none');
	}

	// A target is {el} (wrapped span) or {node,start,end} (part of a text node).
	function rangeOf(t) {
		var r = document.createRange();
		if (t.el) {
			r.selectNodeContents(t.el);
		} else {
			r.setStart(t.node, t.start);
			r.setEnd(t.node, t.end);
		}
		return r;
	}

	function selectTarget(t) {
		var sel = window.getSelection && window.getSelection();
		if (!sel) {
			return;
		}
		sel.removeAllRanges();
		sel.addRange(rangeOf(t));
	}

	function legacyCopy(text, t) {
		var ta = document.createElement('textarea');
		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;pointer-events:none;';
		document.body.appendChild(ta);
		ta.select();
		var ok = false;
		try {
			ok = document.execCommand('copy');
		} catch (err) {
			ok = false;
		}
		document.body.removeChild(ta);
		selectTarget(t); // restore the visible highlight
		return ok;
	}

	var toastEl = null;
	var toastTimer = null;
	function toast(msg) {
		if (!toastEl) {
			toastEl = document.createElement('div');
			toastEl.setAttribute('role', 'status');
			toastEl.setAttribute('aria-live', 'polite');
			toastEl.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:100000;max-width:320px;' +
				'padding:8px 12px;border-radius:4px;background:#1d2327;color:#fff;font:13px/1.4 sans-serif;' +
				'box-shadow:0 2px 8px rgba(0,0,0,.3);pointer-events:none;opacity:0;transition:opacity .2s;' +
				'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
			document.body.appendChild(toastEl);
		}
		toastEl.textContent = msg;
		toastEl.style.opacity = '1';
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () {
			toastEl.style.opacity = '0';
		}, 1200);
	}

	function copy(target) {
		var text = rangeOf(target).toString();
		selectTarget(target);
		var done = function (ok) {
			toast(ok ? (cfg.copied || 'Gekopieerd:') + ' ' + text : (cfg.failed || 'Kopiëren mislukt'));
		};
		if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(function () {
				done(true);
			}, function () {
				done(legacyCopy(text, target));
			});
		} else {
			done(legacyCopy(text, target));
		}
	}

	function init() {
		var root = document.getElementById('order_data');
		if (!root) {
			return;
		}
		var cols = root.querySelectorAll('.order_data_column_billing, .order_data_column_shipping');
		for (var i = 0; i < cols.length; i++) {
			processAddress(cols[i]);
			processHuisnummer(cols[i]);
		}

		var downX = 0;
		var downY = 0;
		var selBefore = '';
		root.addEventListener('mousedown', function (e) {
			downX = e.clientX;
			downY = e.clientY;
			selBefore = String(window.getSelection ? window.getSelection() : '');
		}, true);

		// Capture phase so the mailto link never gets to navigate.
		root.addEventListener('click', function (e) {
			var t = e.target;
			if (!t || !t.closest) {
				return;
			}
			var target = null;
			var span = t.closest('.' + CLS);
			var mail = t.closest('a[href^="mailto:"]');
			if (!span && mail && mail.closest('.address')) {
				span = mail.querySelector('.' + CLS);
			}
			if (span && root.contains(span)) {
				target = { el: span };
			} else {
				// Postcode: part of a text node, found by where the click landed.
				for (var j = 0; j < rangeTargets.length && !target; j++) {
					var rt = rangeTargets[j];
					if (!rt.node.parentNode || !root.contains(rt.node)) {
						continue;
					}
					var rects = rangeOf(rt).getClientRects();
					for (var q = 0; q < rects.length; q++) {
						var rc = rects[q];
						if (e.clientX >= rc.left && e.clientX <= rc.right && e.clientY >= rc.top && e.clientY <= rc.bottom) {
							target = rt;
							break;
						}
					}
				}
			}
			if (!target) {
				return;
			}
			if (mail && mail.closest('.address')) {
				e.preventDefault(); // copy only, never open mailto
			}
			var host = target.el || target.node.parentNode;
			if (inEditMode(host)) {
				return;
			}
			var sel = window.getSelection && window.getSelection();
			var want = rangeOf(target).toString();
			var dragged = Math.abs(e.clientX - downX) > 4 || Math.abs(e.clientY - downY) > 4;
			var selNow = sel ? String(sel) : '';
			// A drag (or double-click) changes the selection between mousedown and click.
			// A selection that was already there before mousedown (e.g. our own highlight) is not a drag.
			if (dragged || (selNow.trim() !== '' && selNow !== selBefore && selNow !== want)) {
				return;
			}
			copy(target);
		}, true);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
