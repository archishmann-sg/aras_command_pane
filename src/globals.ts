type InnovatorObject = {
	newItem: (type: string, action?: string) => Item;
	getUserID: () => string;
};
type Item = {
	setID: (id: string) => void;
	setAttribute: (name: string, value: string) => void;
    getProperty: (name: string) => string;
	setRelatedItem: (relatedItem: Item) => void;
	addRelationship: (relationship: Item) => void;
	apply: () => Promise<Item>;
};

interface Window {
	__ARAS_COMMAND_PANE__: boolean;
	Innovator: () => InnovatorObject;
}
