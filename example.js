const DynamoKVStore = require("./lib/");

const config = {
	endpoint: "http://localhost:7000",
	region: "us-east-2",
};

async function main() {
	try {
		// New table will be created if not exists
		// configs are passed to DocumentClient
		// Don't forget to check region also
		const db = await new DynamoKVStore("test", config);

		db.cacheTimeout = 1000;

		// the value should be a valid DynamoDB Attribute
		await db.set("foo", { hello: "world", key: "value" });

		let v = await db.get("foo");
		console.log(v);

		setTimeout(async () => {
			console.log(await db.foo);

			//or directly
			console.log(await db.foo);

			await db.delete("foo");
			// or db.remove

			console.log(await db.get("foo")); // undefined
		}, 2000);
	} catch (e) {
		console.error(e);
	}
}

main();
