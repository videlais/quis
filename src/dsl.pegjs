Start
  = ConditionalOperators

Value
    = val1:Number { return val1; }
    / val1:StringLiteral { return val1; }
    / val1:GetKeyValue { return val1; }
    / val1:GetVariable { return val1; }
    / val1:NullValue { return val1; }
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

NullValue "Null Value"
  = "null" Whitespace { return null; }

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
  = char1:"$" chars:(Letter / Digit)* {
    // Create variable name.
    return chars.join("");
  }

VariableWithWhitespace "Variable With Whitespace"
  = varname:Variable Whitespace { return varname; }

GetVariable "Variable Retrieval"
  = val1:VariableWithWhitespace {
    // Create default null.
    let result = null;

    // Does the data() function exist?
    if(Object.prototype.hasOwnProperty.call(options, 'values')) {
        result = options.values(val1);
    }

    // Return either null or retrieved value.
    return result;
  }

GetKeyValue "Key-Value Retrieval"
  = val1:DotNotation { return val1; }
  / val1:BracketNotation { return val1; }

DotNotation "Dot Notation"
  = obj:Variable key:DotKey Whitespace {
    // Create default null.
    let result = null;

    // Does the values() function exist?
    if(Object.prototype.hasOwnProperty.call(options, 'values')) {
        let objValue = options.values(obj);
        if (objValue && typeof objValue === 'object' && key in objValue) {
            result = objValue[key];
        }
    }

    // Return either null or retrieved value.
    return result;
  }

BracketNotation "Bracket Notation"
  = obj:Variable "[" key:BracketKey "]" Whitespace {
    // Create default null.
    let result = null;

    // Does the values() function exist?
    if(Object.prototype.hasOwnProperty.call(options, 'values')) {
        let objValue = options.values(obj);
        if (objValue && typeof objValue === 'object' && key in objValue) {
            result = objValue[key];
        }
    }

    // Return either null or retrieved value.
    return result;
  }

DotKey "Dot Key"
  = "." first:Letter rest:(Letter / Digit)* {
    return first + rest.join("");
  }

BracketKey "Bracket Key"
  = chars:(Letter / Digit / "_" / "-")+ { return chars.join(""); }
  / "\"" chars:(Letter / Digit / "_" / " " / "-")* "\"" { return chars.join(""); }
  / "'" chars:(Letter / Digit / "_" / " " / "-")* "'" { return chars.join(""); }

StringLiteral "String Literal"
  = "\"" chars:(Letter / Digit / "_" / " " / "-")* "\"" Whitespace { return chars.join(""); }
  / "'" chars:(Letter / Digit / "_" / " " / "-")* "'" Whitespace { return chars.join(""); }
