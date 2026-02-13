export function parseXML(xmlString) {
    if (typeof xmlString !== "string") {
        throw new TypeError("Input must be a string");
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const parseError = doc.getElementsByTagName("parsererror")[0];

    if (parseError) {
        throw new Error(`XML parsing error: ${parseError.textContent}`);
    }

    return doc;
}

export function getItems(doc) {
    return Array.from(doc.getElementsByTagName("Item"));
}

// export function getItemAttribute()

export function getCurrentUser() {
    const innovator = top.Innovator();

    var user = innovator.newItem("User", "get");
    user.setID(innovator.getUserID());
    user.setAttribute("select", "login_name");
    var identities = innovator.newItem("Identity", "get");
    identities.setAttribute("select", "name");

    user.addRelationship(identities);
}
