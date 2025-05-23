type AnyObject = Record<string | symbol | number, unknown>;

type EmptyObject = Record<never, never>;

type FnVoid = () => void;

type FnAny = (...args: unknown[]) => unknown;

//
// Optional
//
type Optional<T> = T | undefined | null;

type Either<T, U> = readonly [T, null] | readonly [null, U];

type Try<T> = Either<T, AiError>;

type TryOptional<T> = Try<Optional<T>>;

type Err<T> = Either<T, Error>;

//
// Utility types
//
type Identity<T> = {[P in keyof T]: T[P]};

type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

//
// XP
//
interface NashornError {
    message: string;
}

//
// Library types
//
interface AiError {
    code: number;
    message: string;
}
