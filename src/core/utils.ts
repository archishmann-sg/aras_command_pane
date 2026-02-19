export function parseXML(xmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");

    const parseError = doc.getElementsByTagName("parsererror")[0];

    if (parseError) {
        throw new Error(`XML parsing error: ${parseError.textContent}`);
    }

    return doc;
}

// TODO: Unused function
export function getItems(doc: any) {
    return Array.from(doc.getElementsByTagName("Item"));
}

// export function getItemAttribute()

export async function getCurrentUser() {
    const innovator = top?.Innovator();
    if (!innovator) {
        throw new Error("Could not find innovator on top");
    }

    var user = innovator.newItem("User", "get");
    user.setID(innovator.getUserID());
    user.setAttribute("select", "login_name");

    var identities = innovator.newItem("Identity", "get");
    identities.setAttribute("select", "name");

    var alias = innovator.newItem("Alias");
    alias.setRelatedItem(identities);
    alias.setAttribute("select", "id");

    user.addRelationship(alias);

    user = await user.apply();

    return user;
}
