"use strict";

/**
 * Class providing simple filtering for collection of objects
 * @constructor
 * @param {Array} [conditions] A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 */
var DataFilter = function(conditions) {
  this.conditions = [];

  if (Array.isArray(conditions)) {
    for (var i = 0; i < conditions.length; i++) {
      this.add(conditions[i][0], conditions[i][1], conditions[i][2]);
    }
  }
};

DataFilter.notRegexp = /^(!|not )/i;
DataFilter.operatorList = [];

DataFilter.prototype.conditions = null;

/**
 * Add a condition to the filter
 * @param {string} field Field name or path of the value to filter on (ie : 'id', 'user.screenname', ...)
 * @param {string} operator Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} value Value
 * @returns {DataFilter}
 */
DataFilter.prototype.add = function(field, operator, value) {
  this.conditions.push({
    field: field,
    operator: operator,
    value: value
  });

  return this;
};

/**
 * Remove from the filter any conditions matching the arguments
 * @param {string} field Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @param {string} [operator] Operator (ie: contains, equal, less than, regexp, ...)
 * @param {*} [value] Value
 * @returns {DataFilter}
 */
DataFilter.prototype.remove = function(field, operator, value) {
  var conditions = [];

  for (var i = 0; i < this.conditions.length; i++) {
    var condition = this.conditions[i];

    var toRemove =
      (condition.field === field) &&
      (operator === undefined || operator === null || condition.operator === operator) &&
      (value === undefined || condition.value === value);

    if (!toRemove) {
      conditions.push(condition);
    }
  }

  this.conditions = conditions;

  return this;
};

/**
 * Remove all the conditions from the filter
 * @returns {DataFilter}
 */
DataFilter.prototype.clear = function() {
  this.conditions = [];

  return this;
};

/**
 * Obtain the value of an element (object or other) for the given field name or path
 * @param {*} element Element (object or other)
 * @param {string} field Field name or path of the value (ie : 'id', 'user.screenname', ...)
 * @returns {*} Field value
 * @protected
 */
DataFilter.prototype.evaluateFieldValue = function(element, field) {
  var a = field.replace(/\[(\w+)\]/g, '.$1').split('.');
  while (a.length) {
    var n = a.shift();
    if (n in element) {
      element = element[n];
    } else {
      return;
    }
  }
  return element;
};

/**
 * Check whether an atomic condition is true
 * @param {*} sourceValue Value to test
 * @param {string|function} operator Operator
 * @param {*} conditionValue Value to compare with / filter on
 * @returns {boolean}
 * @protected
 */
DataFilter.prototype.evaluatePartialExpression = function(sourceValue, operator, conditionValue) {
  var result = false;

  if (typeof operator === 'function') {
    result = !!(operator(sourceValue, conditionValue));
  } else if (DataFilter.operatorList.hasOwnProperty(operator)) {
    result = !!(DataFilter.operatorList[operator](sourceValue, conditionValue));
  }

  return result;
};

/**
 * Check whether a conditions is true
 * @param {*} sourceValue Value to test
 * @param {string|function} operator Operator
 * @param {*} conditionValues Value to compare with / filter on (may be an array of values)
 * @returns {boolean}
 * @protected
 */
DataFilter.prototype.evaluateExpression = function(sourceValue, operator, conditionValues) {
  var result = false,
    operatorPolarity = true;

  if (typeof operator !== 'function') {
    operator = String(operator).trim();

    if (DataFilter.notRegexp.test(operator)) {
      operatorPolarity = false;
      operator = operator.replace(DataFilter.notRegexp, '');
    }
  }

  if (!Array.isArray(conditionValues)) {
    conditionValues = [conditionValues];
  }

  for (var i = 0; i < conditionValues.length; i++) {
    result = this.evaluatePartialExpression(sourceValue, operator, conditionValues[i]);

    if (result) {
      break;
    }
  }

  return operatorPolarity ? result : !result;
};

/**
 * Apply the conditions of the filter on a single object and returns whether the element passes all the conditions
 * @param {Object} element Object to test
 * @returns {boolean} Whether the object passes all the conditions
 */
DataFilter.prototype.test = function(element) {
  var result = true;

  for (var i = 0; i < this.conditions.length; i++) {
    var condition = this.conditions[i];

    var sourceValue = this.evaluateFieldValue(element, condition.field);

    result = this.evaluateExpression(sourceValue, condition.operator, condition.value);

    if (!result) {
      break;
    }
  }

  return result;
};

/**
 * Apply the conditions of the filter on a collection of objects and returns all the matching elements as an array
 * @param {Array} elements A collection of objects to filter
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Array}
 */
DataFilter.prototype.match = function(elements, polarity) {
  var filtered = [];
  var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

  if (Array.isArray(elements)) {
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (this.test(element) === filterPolarity) {
        filtered.push(element);
      }
    }
  }

  return filtered;
};

/**
 * Apply the conditions of the filter on a collection of objects and returns the first matching element, if any
 * @param {Array} elements A collection of object to filter
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Object|null}
 */
DataFilter.prototype.first = function(elements, polarity) {
  var first = null;
  var filterPolarity = !!(polarity === undefined ? DataFilter.WHITELIST : polarity);

  if (Array.isArray(elements)) {
    for (var i = 0; i < elements.length && first === null; i++) {
      var element = elements[i];
      if (this.test(element) === filterPolarity) {
        first = element;
      }
    }
  }

  return first;
};

/**
 * Shorthand syntax to filter a collection of objects
 * @param {Array} elements A collection of objects to filter
 * @param {Array} conditions A collection of conditions (ie: [['age', 'less than', 30], ['age', 'greater than', 20]])
 * @param {boolean} [polarity=true] True for whitelisting, false for blacklisting
 * @returns {Array} Matching elements
 */
DataFilter.filter = function(elements, conditions, polarity) {
  var filter = new DataFilter(conditions);

  return filter.match(elements, polarity);
};


DataFilter.Operators = {};

/**
 * Add an operator to the global operator list
 * @param {string} name Name of the operator (must not match the negation pattern or already be in use)
 * @param {function} evaluationFunction Evaluation function comparing the field value (its first argument) and
 *        the filter value (its second argument)
 * @returns {boolean} Whether the operation succeed
 */
DataFilter.Operators.add = function(name, evaluationFunction) {
  var result = false;

  name = name.trim();

  if (typeof evaluationFunction === 'function' && !DataFilter.notRegexp.test(name) && !DataFilter.operatorList.hasOwnProperty(name)) {
    DataFilter.operatorList[name] = evaluationFunction;
    result = true;
  }

  return result;
};

/**
 * Create an alias for an existing operator (by effectively creating a copy of the operator).
 * @param {string} name Name of the existing operator
 * @param {string} alias Name of the alias (must not match the negation pattern or already be in use)
 * @returns {boolean} Whether the operation succeed
 */
DataFilter.Operators.alias = function(name, alias) {
  var result = false;

  name = name.trim();
  alias = alias.trim();

  if (DataFilter.operatorList.hasOwnProperty(name) && !DataFilter.notRegexp.test(alias) && !DataFilter.operatorList.hasOwnProperty(alias)) {
    DataFilter.operatorList[alias] = DataFilter.operatorList[name];
    result = true;
  }

  return result;
};

DataFilter.WHITELIST = true;
DataFilter.BLACKLIST = false;

//Default Operators

DataFilter.Operators.add(
  'greater than',
  function(fieldValue, conditionValue) {
    return (fieldValue > conditionValue);
  }
);

DataFilter.Operators.add(
  'greater than or equal',
  function(fieldValue, conditionValue) {
    return (fieldValue >= conditionValue);
  }
);

DataFilter.Operators.add(
  'less than',
  function(fieldValue, conditionValue) {
    return (fieldValue < conditionValue);
  }
);

DataFilter.Operators.add(
  'less than or equal',
  function(fieldValue, conditionValue) {
    return (fieldValue <= conditionValue);
  }
);

DataFilter.Operators.add(
  'equal',
  function(fieldValue, conditionValue) {
    /* jshint eqeqeq: false */
    return (fieldValue == conditionValue);
    /* jshint eqeqeq: true */
  }
);

DataFilter.Operators.add(
  'strict equal',
  function(fieldValue, conditionValue) {
    return (fieldValue === conditionValue);
  }
);

DataFilter.Operators.add(
  'contains',
  function(fieldValue, conditionValue) {
    return (typeof fieldValue === 'string' && fieldValue.indexOf(conditionValue) >= 0);
  }
);

DataFilter.Operators.add(
  'has',
  function(fieldValue, conditionValue) {
    return (Array.isArray(fieldValue) && fieldValue.indexOf(conditionValue) >= 0);
  }
);

DataFilter.Operators.add(
  'matches',
  function(fieldValue, conditionValue) {
    if (typeof conditionValue === 'string') {
      conditionValue = new RegExp(conditionValue);
    }

    return (typeof conditionValue.test === 'function' && conditionValue.test(fieldValue));
  }
);

DataFilter.Operators.add(
  'starts with',
  function(fieldValue, conditionValue) {
    fieldValue = String(fieldValue);
    conditionValue = String(conditionValue);
    return (fieldValue.indexOf(conditionValue) === 0);
  }
);

DataFilter.Operators.add(
  'ends with',
  function(fieldValue, conditionValue) {
    fieldValue = String(fieldValue);
    conditionValue = String(conditionValue);
    return (fieldValue.indexOf(conditionValue) === (fieldValue.length - conditionValue.length));
  }
);

DataFilter.Operators.alias('greater than', '>');
DataFilter.Operators.alias('greater than or equal', '>=');
DataFilter.Operators.alias('less than', '<');
DataFilter.Operators.alias('less than or equal', '<=');
DataFilter.Operators.alias('equal', '==');
DataFilter.Operators.alias('strict equal', '===');
