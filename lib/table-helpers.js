const AWS = require("aws-sdk");
const { DynamoDB } = AWS;

function validateTableName(s) {
	return (
		typeof s === "string" &&
		s.length > 3 &&
		s.length <= 255 &&
		/[a-zA-Z0-9_.-]+/.test(s)
	);
}

async function getTableStatus(dynamodb, TableName) {
	try {
		let res = await dynamodb.describeTable({ TableName }).promise();
		let table = res.Table;
		return table && table.TableStatus;
	} catch (e) {
		if (e && e.code === "ResourceNotFoundException") return;
		throw e;
	}
}

const retryCount = {};

async function waitForTable(dynamodb, TableName) {
	let retries = retryCount[TableName];
	return new Promise((resolve, reject) => {
		if (retries > 5) {
			return reject("Timeout: Unable to access dynamodb table.");
		}

		checkTableStatus(dynamodb, TableName)
			.then(() => {
				retryCount[TableName] = 0;
				resolve();
			})
			.catch(reject);

		retryCount[TableName] = (retries || 0) + 1;
	});
}

async function checkTableStatus(dynamodb, TableName) {
	let status = await getTableStatus(dynamodb, TableName);

	switch (status) {
		case "DELETING":
		case "ARCHIVING":
			throw new Error(
				`Cannot use table now. beacuse it's being deleted or archived`
			);
		case "INACCESSIBLE_ENCRYPTION_CREDENTIALS":
			throw new Error("the table is inaccessible due to " + status);
		case "CREATING":
			await new Promise((resolve) => {
				setTimeout(() => resolve(waitForTable(dynamodb, TableName)), 1000);
			});
			break;
		default:
			return true;
	}
}

async function createTable(TableName, RCU = 1, WCU = 1, config = {}) {
	if (!validateTableName(TableName)) throw new Error("Invalid DynamoDB table name");

	try {
		const dynamodb = new DynamoDB(config);

		const params = {
			TableName,
			KeySchema: [{ AttributeName: "key", KeyType: "HASH" }],
			AttributeDefinitions: [{ AttributeName: "key", AttributeType: "S" }],
			ProvisionedThroughput: {
				ReadCapacityUnits: RCU,
				WriteCapacityUnits: WCU,
			},
		};

		let res = await dynamodb.createTable(params).promise();
		await waitForTable(dynamodb, TableName);
		return res;
	} catch (e) {
		// ignore prexisting table error
		if (e && e.statusCode == 400) return;
		throw e;
	}
}

module.exports = {
	validateTableName,
	waitForTable,
	createTable,
};
