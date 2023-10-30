Start
  = ConditionalOperators

Value
    = val1:Number { return val1; }
    / val1:GetVariable { return val1; }
    / BooleanValue

ConditionalOperators
    = val1:Value (GreaterThanOrEqual/Shorthand_GreaterThanOrEqual) val2:Value { return val1 >= val2; }
    / val1:Value (LessThanOrEqual/Shorthand_LessThanOrEqual) val2:Value { return val1 <= val2; }
    / val1:Value (LessThan/Shorthand_LessThan) val2:Value { return val1 < val2; }
    / val1:Value (GreaterThan/Shorthand_GreaterThan) val2:Value { return val1 > val2; }
    / val1:Value (Equality/Shorthand_Equality) val2:Value { return val1 == val2; }
    / val1:Value (Inequality/Shorthand_Inequality) val2:Value { return val1 != val2; }
    / val1:Value And val2:Value { return !!val1 && !!val2; }
    / val1:Value Or val2:Value { return !!val1 || !!val2; }
    / Not val1:BooleanValue { return !val1; }
    / Not val1:GetVariable { return val1; }
    / BooleanValue

BooleanValue "Boolean Value"
  = True { return true; }
  / False { return false; }

/* Expression Constants */
Whitespace "Whitespace"              = [ \t\n\r]*
LeftParentheses "Left Parentheses"   = "(" Whitespace
RightParentheses "Right Parentheses" = ")" Whitespace

/* Conditional Constants */
True "True"                      = "true" Whitespace
False "False"                    = "false" Whitespace
And "and"                        = "and" Whitespace
Or "or"                          = "or" Whitespace
Not "Negation"                   = "!" Whitespace
Inequality "Inequality"          = "!=" Whitespace

/* Comparison Constants */
Equality "Equality"                                             = "==" Whitespace
GreaterThan "Greater-than"                                      = ">" Whitespace
GreaterThanOrEqual "Greater-than or equal"                      = ">=" Whitespace
LessThan "Less-than"                                            = "<" Whitespace
LessThanOrEqual "Less-than or equal"                            = "<=" Whitespace
Shorthand_Equality "Equality Shorthand"                         = "is" Whitespace
Shorthand_Inequality "Inequality Shorthand"                     = "is not" Whitespace
Shorthand_GreaterThan "Greater-than Shorthand"                  = "gt" Whitespace
Shorthand_LessThan "Less-than Shorthand"                        = "lt" Whitespace
Shorthand_LessThanOrEqual "Less-than or equal Shorthand"        = "lte" Whitespace
Shorthand_GreaterThanOrEqual "Greater-than or equal Shorthand"  = "gte" Whitespace

/* Numeric Constants */
Digit "Digit"       = [0-9]
Dot "Decimal Point" = "."

/* Numbers */
Number "Number" = Decimal/Integer
Integer "Integer" = digits:(Negative? Digit+) Whitespace { return Number(digits.flat().join("")); }
Decimal "Decimal" = digits:(Negative? Digit+ Dot Digit+) Whitespace { return Number(digits.flat().join("")); }

/* Variable Operations */
Negative "Negative"                         = "-"
Letter "Letter"                             = [a-zA-Z_]

Variable "Variable"
  = char1:"$" chars:(Letter / Digit)* Whitespace {
    // Create variable name.
    return chars.join("");
  }

GetVariable "Variable Retrieval"
  = val1:Variable {
    // Create default null.
    let result = null;

    // Does the data() function exist?
    if(Object.prototype.hasOwnProperty.call(options, 'values')) {
        result = options.values(val1);
    }

    // Return either null or retrieved value.
    return result;
  }
