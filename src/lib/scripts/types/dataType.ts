import { IncompatibleTypesError } from '../errors';

abstract class DataType {
	name = 'DataType';
	static fromString(input: string): DataType {
		throw new Error('Not implemented');
	}
	static toString(input: DataType): string {
		throw new Error('Not implemented');
	}
}

/*
string
int
float
intVector
floatVector
element
callBack
*/

// export class StringType implements DataType
