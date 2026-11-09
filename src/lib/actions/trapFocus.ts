/**
 * Contain focus inside a dialog-like surface, close on Escape, and return focus
 * to whatever was focused before. Attach with `use:trapFocus`.
 */
export function trapFocus(
	node: HTMLElement,
	options: { onEscape?: () => void } = {}
): { destroy: () => void } {
	const previous = typeof document === 'undefined' ? null : document.activeElement;
	const selector =
		'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

	const focusables = (): HTMLElement[] =>
		Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(
			(element) => !element.hasAttribute('hidden')
		);

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			options.onEscape?.();
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

	if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
	node.addEventListener('keydown', onKeydown);
	(focusables()[0] ?? node).focus();

	return {
		destroy() {
			node.removeEventListener('keydown', onKeydown);
			if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
		}
	};
}
