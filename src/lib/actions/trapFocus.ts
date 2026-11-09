/**
 * Contain focus inside a dialog-like surface, close on Escape, and return focus
 * to whatever was focused before. Attach with `use:trapFocus`.
 */
export function trapFocus(
	node: HTMLElement,
	options: { onEscape?: () => void } = {}
): { destroy: () => void; update: (next: { onEscape?: () => void }) => void } {
	const previous = typeof document === 'undefined' ? null : document.activeElement;
	const selector =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
	let current = options;

	const visible = (element: HTMLElement): boolean => {
		if (element.hasAttribute('hidden') || element.closest('[inert]')) return false;
		const style = getComputedStyle(element);
		return style.display !== 'none' && style.visibility !== 'hidden';
	};

	const focusables = (): HTMLElement[] =>
		Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(visible);

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			current.onEscape?.();
			return;
		}
		if (event.key !== 'Tab') return;

		const items = focusables();
		if (items.length === 0) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	// If focus somehow lands outside (e.g. a tab from the browser chrome), pull it back.
	function onFocusIn(event: FocusEvent): void {
		if (event.target instanceof Node && !node.contains(event.target)) {
			(focusables()[0] ?? node).focus();
		}
	}

	if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
	node.addEventListener('keydown', onKeydown);
	document.addEventListener('focusin', onFocusIn);
	(focusables()[0] ?? node).focus();

	return {
		update(next: { onEscape?: () => void }) {
			current = next;
		},
		destroy() {
			node.removeEventListener('keydown', onKeydown);
			document.removeEventListener('focusin', onFocusIn);
			if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
		}
	};
}
