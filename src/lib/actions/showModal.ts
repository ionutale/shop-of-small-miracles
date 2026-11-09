/**
 * Open a native modal dialog on mount, focus its first control, and close it on
 * destroy. Pair with `use:trapFocus` for deterministic containment in tests.
 */
export function showModal(node: HTMLDialogElement): { destroy: () => void } {
	if (typeof node.showModal === 'function') {
		try {
			node.showModal();
		} catch {
			node.setAttribute('open', '');
		}
	} else {
		node.setAttribute('open', '');
	}

	node.querySelector<HTMLElement>('button')?.focus();

	return {
		destroy() {
			try {
				node.close();
			} catch {
				// Already closed by the browser.
			}
		}
	};
}
