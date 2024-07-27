function SafeExecutor<T extends any[], U>(fn: (...args: T) => U): (...args: T) => Error | U {
	return (...args): Error | U => {
		try {
			return fn(...args);
		} catch (err) {
			return err as Error;
		}
	};
}

function AsyncSafeExecutor<T extends any[], U>(
	fn: (...args: T) => Promise<U>
): (...args: T) => Promise<Error | U> {
	return async (...args): Promise<Error | U> => {
		try {
			return await fn(...args);
		} catch (err) {
			return err as Error;
		}
	};
}

export { SafeExecutor, AsyncSafeExecutor };
