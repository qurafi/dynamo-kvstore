const AWS = require("aws-sdk");
const { DynamoDB } = AWS;
const { createTable, validateTableName } = require("./table-helpers");

// TODO: more testing and then publish

class DynamoKVStore {
	constructor(TableName, config = {}) {
		return (async () => {
			if (!validateTableName(TableName))
				throw new Error("Invalid DynamoDB table name");

			await createTable(TableName, 1, 1, config);

			this.docClient = new DynamoDB.DocumentClient(config);
			this.TableName = TableName;
			this.values = {};
			this.cacheTimeout = 5000;

			return new Proxy(this, {
				get(t, k, r) {
					let val = Reflect.get(t, k, r);
					if (["then", "catch", "finally"].some((v) => v == k)) return;
					if (val === undefined || val === null) return t.get(k);
					return val;
				},
			});
		})();
	}

	async get(k) {
		let v = this.values[k];
		let ctimeout = this.cacheTimeout;
		let useCache = v && (ctimeout < 0 || Date.now() - v.timeout < ctimeout);
		if (v && useCache) return v.value;

		const params = { TableName: this.TableName, Key: { key: k } };
		const res = await this.docClient.get(params).promise();
		if (res && res.Item) {
			let item = res.Item;
			let v = item && item.value;
			this.values[k] = { value: v, timeout: Date.now() };

			return v;
		}
	}

	set(k, v) {
		this.values[k] = { value: v, timeout: Date.now() };
		return this.docClient
			.put({ TableName: this.TableName, Item: { key: k, value: v } })
			.promise();
	}

	delete(k) {
		delete this.values[k];

		return this.docClient
			.delete({ TableName: this.TableName, Key: { key: k } })
			.promise();
	}

	remove(k) {
		return this.delete(k);
	}
}

DynamoKVStore.prototype.AWS = AWS;

module.exports = DynamoKVStore;
