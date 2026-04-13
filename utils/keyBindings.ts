/**
 * Keybinding interface representing a keyboard shortcut and its associated action.
 */
interface Keybinding {
    /**
     * The key to be pressed (e.g., 'a', 'Enter', 'F1', etc.).
     */
    key: string;
    /**
     * Whether the Ctrl key should be pressed (optional).
     */
    ctrlKey?: boolean;
    /**
     * Whether the Shift key should be pressed (optional).
     */
    shiftKey?: boolean;
    /**
     * Whether the Alt key should be pressed (optional).
     */
    altKey?: boolean;
    /**
     * The action to be executed when the keybinding is triggered.
     */
    action: () => void;
}

/**
 * Manages keybindings and handles keyboard events.
 */
export default class Keybindings {
    /**
     * Array of registered keybindings.
     * @private
     */
    private bindings: Keybinding[] = [];

    /**
     * Adds a new keybinding to the manager.
     * @param {Keybinding} binding - The keybinding to add.
     */
    public addBinding(binding: Keybinding): void {
        this.bindings.push(binding);
    }

    /**
     * Handles a keyboard event and checks if it matches a registered keybinding.
     * @param {KeyboardEvent} e - The keyboard event to handle.
     * @private
     */
    private handleKeydown(e: KeyboardEvent): void {
        const binding = this.bindings.find((b) => {
            return (
                b.key === e.key &&
                (b.ctrlKey === undefined || b.ctrlKey === e.ctrlKey) &&
                (b.shiftKey === undefined || b.shiftKey === e.shiftKey) &&
                (b.altKey === undefined || b.altKey === e.altKey)
            );
        });

        if (binding) {
            e.preventDefault();
            binding.action();
        }
    }

    /**
     * Initializes the keybindings manager by adding an event listener to the document.
     */
    public init(): void {
        document.addEventListener("keydown", (e) => this.handleKeydown(e));
    }
}
