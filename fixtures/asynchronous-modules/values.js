export const NUMBER_POSITIVE_ZERO = 0
export const NUMBER_NEGATIVE_ZERO = -0
export const NUMBER_ONE = 1
export const NUMBER_POSITIVE_INFINITY = Number.POSITIVE_INFINITY
export const NUMBER_NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY
export const NUMBER_NAN = Number.NaN

export const BIGINT_ZERO = 0n
export const BIGINT_FOUR_HUNDRED_NINES = BigInt('9'.repeat(400))

export const STRING_EMPTY = ''
export const STRING_FOO = 'FOO'

export const BOOLEAN_TRUE = true
export const BOOLEAN_FALSE = false

export const ERROR_SYNTAXERROR = new SyntaxError('message')

export const ARRAY_EMPTY = []
export const ARRAY_TWO_ZEROS = [0, 0]
export const ARRAY_ONE_HUNDRED_ELEMENTS = Array.from(
  {length: 100},
  (_, index) => index,
)

export const OBJECT_UNDEFINED = undefined
export const OBJECT_NULL = null
export const OBJECT_EMPTY = {}
export const OBJECT_NULL_PROTOTYPE = Object.create(null)
export const OBJECT_FISKER_IS_JERK = {fisker: 'jerk'}

export const TIME_NOW = new Date()

export const REGEXP_WITH_LAST_INDEX = Object.assign(/foo/, {lastIndex: 11})

export const NON_DATA_CLONEABLE = Symbol('foo')
