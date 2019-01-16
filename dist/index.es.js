const defaults = {
  separator: ",",
  decimal: ".",
  errorOnInvalid: false,
  precision: 2
};

const powersOf10 = [
  1,
  10,
  100,
  1000,
  10000,
  100000,
  1000000,
  10000000,
  100000000,
  1000000000
];

const pow10 = p => powersOf10[p] || Math.pow(10, p);

const round = Math.round;

const trunc = Math.trunc;

const parseFloat = Number.parseFloat;

const isNumber = value =>
  typeof value === "number" && Number.isFinite(value) && !Number.isNaN(value);

const isInteger = value => isNumber(value) && Number.isSafeInteger(value);

let settings = Object.assign({}, defaults);

/**
 * Converts numeric value to decimal
 * @param {number|Money} value
 */
function toCents(value) {
  if (value instanceof Money) {
    return value.value;
  }

  const { decimal, errorOnInvalid, precision } = settings;

  let v = 0;
  if (isNumber(value)) {
    v = value;
  } else if (typeof value === "string") {
    let regex = new RegExp("[^-\\d" + decimal + "]", "g"),
      decimalString = new RegExp("\\" + decimal, "g");
    v = value
      .replace(/\((.*)\)/, "-$1") // allow negative e.g. (1.99)
      .replace(regex, "") // replace any non numeric values
      .replace(decimalString, "."); // convert any decimal values // scale number to integer value
    v = v || 0;
  } else {
    if (errorOnInvalid) {
      throw Error("Invalid Input");
    }
    v = 0;
  }

  return centsWithPrecision(v, precision);
}

/**
 * Converts numeric value to cents rounding on most significant cent value.
 * eq. 12.315 => 1232
 * @param {number} value
 * @param {number} precision
 */
function centsWithPrecision(value, precision) {
  const subprecisionMultiplier = pow10(precision + 1);
  return round(trunc(parseFloat(value) * subprecisionMultiplier) / 10);
}

// Money [+/-] Money
function add(lhs, rhs) {
  return Money.cents(toCents(lhs) + toCents(rhs));
}

function subtract(lhs, rhs) {
  return Money.cents(toCents(lhs) - toCents(rhs));
}

// Money - Number
function multiply(lhs, rhs) {
  return Money.cents(round(toCents(lhs) * parseFloat(rhs)));
}

function divide(lhs, rhs) {
  return Money.cents(round(toCents(lhs) / parseFloat(rhs)));
}

function percent(lhs, rhs) {
  return Money.cents(round(toCents(lhs) * (parseFloat(rhs) / 100)));
}

function equal(lhs, rhs) {
  return toCents(lhs) == toCents(rhs);
}

function lessThan(lhs, rhs) {
  return toCents(lhs) < toCents(rhs);
}

function lessThanOrEqual(lhs, rhs) {
  return toCents(lhs) <= toCents(rhs);
}

function greaterThan(lhs, rhs) {
  return toCents(lhs) > toCents(rhs);
}

function greaterThanOrEqual(lhs, rhs) {
  return toCents(lhs) >= toCents(rhs);
}

function floatToAmount(f) {
  return ("" + Math.round(f * 100.0) / 100.0)
    .replace(/^-(\d+)$/, "-$1.00") //-xx
    .replace(/^(\d+)$/, "$1.00") //xx
    .replace(/^-(\d+)\.(\d)$/, "-$1.$20") //-xx.xx
    .replace(/^(\d+)\.(\d)$/, "$1.$20"); //xx.xx
}

/**
 *
 * By default
 *  -> constructor should be in 'cents'
 *  -> Money.parse (or .from) assumes a full value
 *
 */

class Money {
  constructor(cents = undefined) {
    if (!isInteger(cents)) {
      throw new Error(`Integer expected but ${cents} found`);
    }
    this.value = cents;
  }

  /**
   * Sets value in cents.
   * @param {number} number
   */
  set value(value) {
    this.$value = trunc(value);
  }

  /**
   * Returns value in cents
   * @returns {number}
   */
  get value() {
    return this.$value;
  }

  /**
   * Sets value in cents.
   * @param {number} number
   */
  set cents(value) {
    this.value = value;
  }

  /**
   * Returns value in cents
   * @returns {number}
   */
  get cents() {
    return this.value;
  }

  /**
   *  Sets new value
   * @param {(Money|string|number)} value
   */
  set(value) {
    this.cents = toCents(value);
  }

  /**
   * Returns new negated value.
   * @returns {Money}
   */
  negated() {
    return Money.cents(-this.value);
  }

  /**
   * Adds values together.
   * @param {number|Money} number
   * @returns {Money}
   */
  add(number) {
    return add(this, number);
  }

  /**
   * Adds values together. (alias for `add`)
   * @param {number|Money} number
   * @returns {Money}
   */
  plus(number) {
    return add(this, number);
  }

  /**
   * Subtracts value.
   * @param {number|Money} number
   * @returns {Money}
   */
  subtract(number) {
    return subtract(this, number);
  }

  /**
   * Subtracts value. (alias for `subtract`)
   * @param {number|Money} number
   * @returns {Money}
   */
  minus(number) {
    return subtract(this, number);
  }

  /**
   * Multiplies values.
   * @param {number} number
   * @returns {Money}
   */
  multiply(number) {
    return multiply(this, number);
  }

  /**
   * Multiplies values. (alias for `multiply`)
   * @param {number} number
   * @returns {Money}
   */
  times(number) {
    return multiply(this, number);
  }

  /**
   * Divides value.
   * @param {number} number
   * @returns {Money}
   */
  divide(number) {
    return divide(this, number);
  }

  /**
   * Divides value. (alias for `divide`)
   * @param {number} number
   * @returns {Money}
   */
  dividedBy(number) {
    return divide(this, number);
  }

  /**
   * Checks if values are equal
   * @returns {boolean}
   */
  equals(value) {
    return equal(this, value);
  }

  /**
   * Checks if value is 0
   * @returns {boolean}
   */
  isZero() {
    return this.value == 0;
  }

  /**
   * Checks if value is negative
   * @returns {boolean}
   */
  isNegative() {
    return this.value < 0;
  }

  /**
   * Checks if value is possitive
   * @returns {boolean}
   */
  isPositive() {
    return this.value > 0;
  }

  /**
   * Checks if value is less then given value.
   * @returns {boolean}
   */
  lessThan(value) {
    return lessThan(this, value);
  }

  /**
   * Checks if value is less then or equal to given value.
   * @returns {boolean}
   */
  lessThanOrEqualTo(value) {
    return lessThanOrEqual(this, value);
  }

  /**
   * Checks if value is greater then given value.
   * @returns {boolean}
   */
  greaterThan(value) {
    return greaterThan(this, value);
  }

  /**
   * Checks if value is greater then or equal to given value.
   * @returns {boolean}
   */
  greaterThanOrEqualTo(value) {
    return greaterThanOrEqual(this, value);
  }

  /**
   * Calculates a percent value
   * @param {number} number
   * @returns {Money}
   */
  percent(value) {
    return percent(this, value);
  }

  /**
   * Asserts value is a valid number
   */
  assertFinate() {
    if (!isFinite(this.value)) throw new Error("Invalid value");
    return this;
  }

  /**
   * Returns string representation in format (-)xx.xx
   */
  toString() {
    const precision = Money.settings.precision;
    return floatToAmount(this.value / pow10(precision));
  }

  /**
   * Alias for `toString` precision is ignored
   */
  toFixed() {
    return this.toString();
  }

  /**
   * @returns {Money}
   */
  clone() {
    return Money.from(this);
  }

  /**
   * New instance from value in cents
   * @returns {boolean}
   */
  static cents(value) {
    return new Money(value);
  }

  /**
   * New value from numeric value
   * @param {number|string|Money}
   * @returns {boolean}
   */
  static from(value) {
    return new Money(toCents(value));
  }

  /**
   * Settings
   * @returns {boolean}
   */
  static get settings() {
    return settings;
  }

  /**
   * Settings
   * @param {object}
   */
  static set settings(value) {
    settings = Object.assign({}, defaults, value);
  }
}

export default Money;
