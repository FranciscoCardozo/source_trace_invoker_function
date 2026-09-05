import { DynamoRequestKeys } from "./models/dynamoRequestKeys.interface";

export default class Utils {
    public static validateParamas(id: string, pk: string): DynamoRequestKeys {
        return {
            PK: pk,
            ...(id && { SK: `${pk}#${id}` })
        }
    }
}