const DynamoKVStore = require("./lib/");

const config = {
	endpoint: "http://localhost:7000",
	region: "us-east-2",
};

async function main() {
	try {
		// Configs are passed to DocumentClient
		// New table will be created if not exists
		// Don't forget to check region also
		const db = await new DynamoKVStore("test", config);

		db.cacheTimeout = 50;

		// the value should be a valid DynamoDB Attribute
		await db.set("foo", "bar");

		let v = await db.get("foo");
		console.log(v);

		// or directly
		console.log(await db.foo);

		await db.delete("foo");
		// or db.remove
	} catch (e) {
		console.error(e);
	}
}

main();
