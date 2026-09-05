"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const config_1 = __importDefault(require("../../config"));
const client = new client_dynamodb_1.DynamoDBClient({
    region: "us-east-1",
});
const dynamoDb = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const tableName = config_1.default.DYNAMODB_TABLE_NAME;
class DynamoService {
    static async getItems(keys) {
        try {
            // Si no hay PK, trae todo
            if (!keys.PK) {
                return await dynamoDb.send(new lib_dynamodb_1.ScanCommand({
                    TableName: tableName,
                }));
            }
            const queryParams = {
                TableName: tableName,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": keys.PK,
                },
            };
            // Si viene SK, agrega el filtro
            if (keys.SK) {
                queryParams.KeyConditionExpression += " AND SK = :sk";
                queryParams.ExpressionAttributeValues[":sk"] = keys.SK;
            }
            return await dynamoDb.send(new lib_dynamodb_1.QueryCommand(queryParams));
        }
        catch (error) {
            throw error;
        }
    }
    static async setItem(keys, body) {
        return dynamoDb.send(new lib_dynamodb_1.PutCommand({
            TableName: tableName,
            Item: {
                PK: keys.PK,
                SK: keys.SK,
                ...body
            }
        }));
    }
}
exports.default = DynamoService;
//# sourceMappingURL=dynamo.service.js.map