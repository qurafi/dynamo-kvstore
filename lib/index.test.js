/* eslint-disable */
const DynamoKVStore = require("./");

const TableName = "test";
const config = {
	endpoint: "http://localhost:7000",
	region: "us-west-2",
};

let db;
beforeAll(async () => {
	db = await new DynamoKVStore(TableName, config);
	console.log(db);
});

it("it should add value to the database", async () => {
	await db.set("foo", "bar");

	const params = { TableName, Key: { key: "foo" } };
	let res = await db.docClient.get(params).promise();

	expect(res).toHaveProperty("Item.value", "bar");
});

it("it should get the value", async () => {
	let v = await db.get("foo");
	expect(v).toBe("bar");
});

it("it should get the value from proxy integrations", async () => {
	let v = await db.foo;
	expect(v).toBe("bar");
});

it("it should delete the value from database", async () => {
	let v = await db.delete("foo");
	const params = { TableName, Key: { key: "foo" } };
	let res = await db.docClient.get(params).promise();

	expect(res).not.toHaveProperty("Item");
});
