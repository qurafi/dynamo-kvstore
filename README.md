# Dynamo KVStore

Simple DynamoDB key-value promise-based store for Node.js  with in-memory caching.


## Installation
`npm i dynamo-kvstore`

## Quick Start
```javascript
// intitialize new instance with table name and documentClient Configs
const db = await new DynamoKVStore("test", config);
// New table will be created if not exists
// Don't forget to check region also

store.cacheTimeout = -1; // always use cache
store.cacheTimeout = 0; // always get the new value from databse
store.cacheTimeout = 1000; // custom timeout in ms

// the value should be a valid DynamoDB Attribute
await db.set("foo", "bar");

let v = await db.get("foo");
console.log(v);

// or directly
await db.foo;

await db.delete("foo");
// or db.remove

// documentClient instance
store.docClient

// AWS module from aws-sdk
store.AWS
```