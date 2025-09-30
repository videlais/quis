import { expect } from 'chai';
import peggy from 'peggy';
import { readFileSync } from 'fs';
const { generate } = peggy;

// Read grammar.
const grammar = readFileSync('./src/dsl.pegjs', 'utf-8');
// Create parser.
const parser = generate(grammar);

describe('Grammar', function () {
  describe('Conditional Expressions', function () {
    describe('Boolean Values', function () {
      it('Should return "true" when keyword encountered.', function () {
        expect(parser.parse('true')).to.equal(true);
      });

      it('Should return "false" when keyword encountered.', function () {
        expect(parser.parse('false')).to.equal(false);
      });
    });

    describe('Boolean AND', function () {
      it('Should return true AND true as true.', function () {
        expect(parser.parse('true and true')).to.equal(true);
      });

      it('Should return true AND false as false.', function () {
        expect(parser.parse('true and false')).to.equal(false);
      });

      it('Should return false AND false as false', function () {
        expect(parser.parse('false and false')).to.equal(false);
      });

      it('Should return false AND true as false.', function () {
        expect(parser.parse('false and true')).to.equal(false);
      });
    });

    describe('Boolean OR', function () {
      it('Should return true OR true as true.', function () {
        expect(parser.parse('true or true')).to.equal(true);
      });

      it('Should return true OR false as true.', function () {
        expect(parser.parse('true or false')).to.equal(true);
      });

      it('Should return false OR false as false.', function () {
        expect(parser.parse('false or false')).to.equal(false);
      });
    });

    describe('Boolean Negation', function () {
      it('Should return NOT true - exclamation mark.', function () {
        expect(parser.parse('!true')).to.equal(false);
      });

      it('Should return NOT false - exclamation mark.', function () {
        expect(parser.parse('!false')).to.equal(true);
      });
    });

    describe('Boolean Equality', function () {
      it('Should return true for true == true.', function () {
        expect(parser.parse('true == true')).to.equal(true);
      });

      it('Should return true for true is true.', function () {
        expect(parser.parse('true is true')).to.equal(true);
      });

      it('Should return false for false == true.', function () {
        expect(parser.parse('false == true')).to.equal(false);
      });

      it('Should return false for false is true.', function () {
        expect(parser.parse('false is true')).to.equal(false);
      });

      it('Should return false for true == false.', function () {
        expect(parser.parse('true == false')).to.equal(false);
      });

      it('Should return false for true is false.', function () {
        expect(parser.parse('true is false')).to.equal(false);
      });

      it('Should return false for false == false.', function () {
        expect(parser.parse('false == false')).to.equal(true);
      });

      it('Should return false for false is false.', function () {
        expect(parser.parse('false is false')).to.equal(true);
      });
    });

    describe('Boolean Inequality', function () {
      it('Should return true for true != false.', function () {
        expect(parser.parse('true != false')).to.equal(true);
      });

      it('Should return true for true is not false.', function () {
        expect(parser.parse('true is not false')).to.equal(true);
      });

      it('Should return false for false != false.', function () {
        expect(parser.parse('false != false')).to.equal(false);
      });

      it('Should return false for false is not false.', function () {
        expect(parser.parse('false is not false')).to.equal(false);
      });

      it('Should return true for false != true.', function () {
        expect(parser.parse('false != true')).to.equal(true);
      });

      it('Should return true for false is not true.', function () {
        expect(parser.parse('false is not true')).to.equal(true);
      });

      it('Should return false for true != true.', function () {
        expect(parser.parse('true != true')).to.equal(false);
      });

      it('Should return false for true is not true.', function () {
        expect(parser.parse('true is not true')).to.equal(false);
      });
    });

    describe('Boolean less-than', function () {
      it('Should return true for 1 < 2.', function () {
        expect(parser.parse('1 < 2')).to.equal(true);
      });

      it('Should return true for 1 lt 2.', function () {
        expect(parser.parse('1 lt 2')).to.equal(true);
      });

      it('Should return false for 2 < 1.', function () {
        expect(parser.parse('2 < 1')).to.equal(false);
      });

      it('Should return false for 2 lt 1.', function () {
        expect(parser.parse('2 lt 1')).to.equal(false);
      });
    });

    describe('Boolean greater-than', function () {
      it('Should return false for 1 > 2.', function () {
        expect(parser.parse('1 > 2')).to.equal(false);
      });

      it('Should return false for 1 gt 2.', function () {
        expect(parser.parse('1 gt 2')).to.equal(false);
      });

      it('Should return true for 2 > 1.', function () {
        expect(parser.parse('2 > 1')).to.equal(true);
      });

      it('Should return true for 2 gt 1.', function () {
        expect(parser.parse('2 gt 1')).to.equal(true);
      });
    });

    describe('Boolean less-than or equal', function () {
      it('Should return true for 1 <= 2.', function () {
        expect(parser.parse('1 <= 2')).to.equal(true);
      });

      it('Should return true for 1 lte 2.', function () {
        expect(parser.parse('1 lte 2')).to.equal(true);
      });

      it('Should return false for 2 <= 1.', function () {
        expect(parser.parse('2 <= 1')).to.equal(false);
      });

      it('Should return false for 2 lte 1.', function () {
        expect(parser.parse('2 lte 1')).to.equal(false);
      });
    });

    describe('Boolean greater-than or equal', function () {
      it('Should return false for 1 >= 2.', function () {
        expect(parser.parse('1 >= 2')).to.equal(false);
      });

      it('Should return false for 1 gte 2.', function () {
        expect(parser.parse('1 gte 2')).to.equal(false);
      });

      it('Should return true for 2 >= 1.', function () {
        expect(parser.parse('2 >= 1')).to.equal(true);
      });

      it('Should return true for 2 gte 1.', function () {
        expect(parser.parse('2 gte 1')).to.equal(true);
      });
    });
  });

  describe('Variable Expressions', function () {
    let options;

    beforeEach(function () {
      options = {
        values: (label) => {
          if (label === 'example') {
            return 2;
          }
          if (label === 'example2') {
            return 5;
          }
        }
      };
    });

    it('Should parse single variable.', function () {
      expect(parser.parse('$example > 1', options)).to.equal(true);
    });

    it('Should parse multiple variables - less than', function () {
      expect(parser.parse('$example < $example2', options)).to.equal(true);
    });

    it('Should parse multiple variables - lt', function () {
      expect(parser.parse('$example lt $example2', options)).to.equal(true);
    });

    it('Should parse multiple variables - lte', function () {
      expect(parser.parse('$example lte $example2', options)).to.equal(true);
    });

    it('Should parse multiple variables - greater than', function () {
      expect(parser.parse('$example > $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - gt', function () {
      expect(parser.parse('$example gt $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - gte', function () {
      expect(parser.parse('$example gte $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - >=', function () {
      expect(parser.parse('$example >= $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - not equal', function () {
      expect(parser.parse('$example != $example2', options)).to.equal(true);
    });

    it('Should parse multiple variables - is', function () {
      expect(parser.parse('$example is $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - ==', function () {
      expect(parser.parse('$example == $example2', options)).to.equal(false);
    });

    it('Should parse multiple variables - is not', function () {
      expect(parser.parse('$example is not $example2', options)).to.equal(true);
    });
  });

  describe('Key-Value Expressions', function () {
    let options;

    beforeEach(function () {
      options = {
        values: (label) => {
          if (label === 'user') {
            return {
              name: 'John',
              age: 25,
              profile: {
                score: 100,
                level: 'advanced'
              }
            };
          }
          if (label === 'settings') {
            return {
              'theme-color': 'dark',
              'font-size': 14,
              'auto save': true
            };
          }
          if (label === 'numbers') {
            return {
              a: 10,
              b: 20
            };
          }
        }
      };
    });

    describe('Dot Notation', function () {
      it('Should access object property with dot notation - string value', function () {
        expect(parser.parse('$user.name == "John"', options)).to.equal(true);
      });

      it('Should access object property with dot notation - number comparison', function () {
        expect(parser.parse('$user.age > 20', options)).to.equal(true);
      });

      it('Should access object property with dot notation - number equality', function () {
        expect(parser.parse('$user.age == 25', options)).to.equal(true);
      });

      it('Should return false for non-matching dot notation access', function () {
        expect(parser.parse('$user.name == "Jane"', options)).to.equal(false);
      });

      it('Should compare numeric properties using dot notation', function () {
        expect(parser.parse('$numbers.a < $numbers.b', options)).to.equal(true);
      });
    });

    describe('Bracket Notation', function () {
      it('Should access object property with bracket notation - unquoted key', function () {
        expect(parser.parse('$user[name] == "John"', options)).to.equal(true);
      });

      it('Should access object property with bracket notation - double quoted key', function () {
        expect(parser.parse('$user["age"] > 20', options)).to.equal(true);
      });

      it('Should access object property with bracket notation - single quoted key', function () {
        expect(parser.parse('$user[\'age\'] == 25', options)).to.equal(true);
      });

      it('Should access hyphenated keys with bracket notation', function () {
        expect(parser.parse('$settings["theme-color"] == "dark"', options)).to.equal(true);
      });

      it('Should access keys with spaces using bracket notation', function () {
        expect(parser.parse('$settings["auto save"] == true', options)).to.equal(true);
      });

      it('Should compare numeric properties using bracket notation', function () {
        expect(parser.parse('$numbers["a"] < $numbers["b"]', options)).to.equal(true);
      });
    });

    describe('Mixed Access Patterns', function () {
      it('Should work with mixed dot and bracket notation in same expression', function () {
        expect(parser.parse('$user.age > $settings["font-size"]', options)).to.equal(true);
      });

      it('Should work with inequality comparison using mixed notation', function () {
        expect(parser.parse('$user.name != $settings["theme-color"]', options)).to.equal(true);
      });
    });

    describe('Non-existent Keys', function () {
      it('Should handle non-existent dot notation keys gracefully', function () {
        expect(parser.parse('$user.nonexistent == null', options)).to.equal(true);
      });

      it('Should handle non-existent bracket notation keys gracefully', function () {
        expect(parser.parse('$user["nonexistent"] == null', options)).to.equal(true);
      });
    });
  });
});
