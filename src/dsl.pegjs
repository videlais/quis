Start
  = OrExpression

// OR has lowest precedence
OrExpression
  = left:AndExpression right:(OrOperator AndExpression)* {
      return right.reduce((acc, curr) => acc || curr[1], left);
    }

// AND has higher precedence than OR
AndExpression
  = left:ComparisonExpression right:(AndOperator ComparisonExpression)* {
      return right.reduce((acc, curr) => !!acc && !!curr[1], left);
    }

// Comparison expressions have highest precedence  
ComparisonExpression
  = left:Value operator:(Shorthand_Inequality/GreaterThanOrEqual/Shorthand_GreaterThanOrEqual/LessThanOrEqual/Shorthand_LessThanOrEqual/LessThan/Shorthand_LessThan/GreaterThan/Shorthand_GreaterThan/Equality/Shorthand_Equality/Inequality) right:Value {
      // Handle different operator formats
      let opText;
      if (Array.isArray(operator)) {
        opText = operator.join('').trim();
      } else if (typeof operator === 'string') {
        opText = operator.trim();
      } else {
        opText = String(operator).trim();
      }
      
      if (opText === '>=' || opText === 'gte') return left >= right;
      if (opText === '<=' || opText === 'lte') return left <= right;  
      if (opText === '<' || opText === 'lt') return left < right;
      if (opText === '>' || opText === 'gt') return left > right;
      if (opText === '!=' || opText.includes('is not')) return left != right;
      if (opText === '==' || opText === 'is') return left == right;
      return false;
    }
  / NotExpression
  / ParenthesizedExpression
  / Value

// Negation expression
NotExpression
  = Not expr:ComparisonExpression { return !expr; }

// Parenthesized expressions for grouping
ParenthesizedExpression
  = LeftParentheses expr:OrExpression RightParentheses { return expr; }

Value
    = val1:Number { return val1; }
    / val1:StringLiteral { return val1; }
    / val1:GetKeyValue { return val1; }
    / val1:GetVariable { return val1; }
    / val1:NullValue { return val1; }
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

/* Boolean Operators */
AndOperator "And Operator"       = ("&&" / "AND" / "and") Whitespace
OrOperator "Or Operator"         = ("||" / "OR" / "or") Whitespace

/* Comparison Constants */
Equality "Equality"                                             = "==" Whitespace { return "=="; }
GreaterThan "Greater-than"                                      = ">" Whitespace { return ">"; }
GreaterThanOrEqual "Greater-than or equal"                      = ">=" Whitespace { return ">="; }
LessThan "Less-than"                                            = "<" Whitespace { return "<"; }
LessThanOrEqual "Less-than or equal"                            = "<=" Whitespace { return "<="; }
Inequality "Inequality"                                         = "!=" Whitespace { return "!="; }
Shorthand_Inequality "Inequality Shorthand"                     = "is not" Whitespace { return "is not"; }
Shorthand_Equality "Equality Shorthand"                         = "is" Whitespace { return "is"; }
Shorthand_GreaterThan "Greater-than Shorthand"                  = "gt" Whitespace { return "gt"; }
Shorthand_LessThan "Less-than Shorthand"                        = "lt" Whitespace { return "lt"; }
Shorthand_LessThanOrEqual "Less-than or equal Shorthand"        = "lte" Whitespace { return "lte"; }
Shorthand_GreaterThanOrEqual "Greater-than or equal Shorthand"  = "gte" Whitespace { return "gte"; }

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
