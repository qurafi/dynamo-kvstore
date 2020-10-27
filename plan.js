// eslint-disable-next-line no-undef
let store = new DynamoKVStore("user-settings");

store.set("key", "key2", "value");

// alternatively
store.set("key.key2", "value");

store.get("key", "key2");

// to get all allowed items in a single query
// Nax 1Kb
store.get("key");

// delete item with specific second key
store.delete("key", "key2");

// to delete all items associated with the key
store.delete("key");

// or
let user = store.Key("user");

user.set("key2", "value");
store.get("key", "key2");

// to get all allowed items in a single query
// Nax 1Kb
store.get();

// delete item with specific second key
store.delete("key2");

// to delete all items associated with the key
store.delete("key2");

store.delete();

// Filters

store.where("k>=10");
