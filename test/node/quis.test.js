import peggy from 'peggy';
import { readFileSync } from 'fs';
const { generate } = peggy;

// Read grammar.
const grammar = readFileSync('./src/dsl.pegjs', 'utf-8');
// Create parser.
const parser = generate(grammar);

describe('Grammar', () => {
  describe('Conditional Expressions', () => {
    describe('Boolean Values', () => {
      test('Should return "true" when keyword encountered.', () => {
        expect(parser.parse('true')).toBe(true);
      });

      test('Should return "false" when keyword encountered.', () => {
        expect(parser.parse('false')).toBe(false);
      });
    });

    describe('Boolean AND', () => {
      test('Should return true AND true as true.', () => {
        expect(parser.parse('true and true')).toBe(true);
      });

      test('Should return true AND false as false.', () => {
        expect(parser.parse('true and false')).toBe(false);
      });

      test('Should return false AND false as false', () => {
        expect(parser.parse('false and false')).toBe(false);
      });

      test('Should return false AND true as false.', () => {
        expect(parser.parse('false and true')).toBe(false);
      });
    });

    describe('Boolean OR', () => {
      test('Should return true OR true as true.', () => {
        expect(parser.parse('true or true')).toBe(true);
      });

      test('Should return true OR false as true.', () => {
        expect(parser.parse('true or false')).toBe(true);
      });

      test('Should return false OR false as false.', () => {
        expect(parser.parse('false or false')).toBe(false);
      });
    });

    describe('Boolean Negation', () => {
      test('Should return NOT true - exclamation mark.', () => {
        expect(parser.parse('!true')).toBe(false);
      });

      test('Should return NOT false - exclamation mark.', () => {
        expect(parser.parse('!false')).toBe(true);
      });
    });

    describe('Boolean Equality', () => {
      test('Should return true for true == true.', () => {
        expect(parser.parse('true == true')).toBe(true);
      });

      test('Should return true for true is true.', () => {
        expect(parser.parse('true is true')).toBe(true);
      });

      test('Should return false for false == true.', () => {
        expect(parser.parse('false == true')).toBe(false);
      });

      test('Should return false for false is true.', () => {
        expect(parser.parse('false is true')).toBe(false);
      });

      test('Should return false for true == false.', () => {
        expect(parser.parse('true == false')).toBe(false);
      });

      test('Should return false for true is false.', () => {
        expect(parser.parse('true is false')).toBe(false);
      });

      test('Should return true for false == false.', () => {
        expect(parser.parse('false == false')).toBe(true);
      });

      test('Should return true for false is false.', () => {
        expect(parser.parse('false is false')).toBe(true);
      });
    });

    describe('Boolean Inequality', () => {
      test('Should return true for true != false.', () => {
        expect(parser.parse('true != false')).toBe(true);
      });

      test('Should return true for true is not false.', () => {
        expect(parser.parse('true is not false')).toBe(true);
      });

      test('Should return false for false != false.', () => {
        expect(parser.parse('false != false')).toBe(false);
      });

      test('Should return false for false is not false.', () => {
        expect(parser.parse('false is not false')).toBe(false);
      });

      test('Should return true for false != true.', () => {
        expect(parser.parse('false != true')).toBe(true);
      });

      test('Should return true for false is not true.', () => {
        expect(parser.parse('false is not true')).toBe(true);
      });

      test('Should return false for true != true.', () => {
        expect(parser.parse('true != true')).toBe(false);
      });

      test('Should return false for true is not true.', () => {
        expect(parser.parse('true is not true')).toBe(false);
      });
    });

    describe('Boolean less-than', () => {
      test('Should return true for 1 < 2.', () => {
        expect(parser.parse('1 < 2')).toBe(true);
      });

      test('Should return true for 1 lt 2.', () => {
        expect(parser.parse('1 lt 2')).toBe(true);
      });

      test('Should return false for 2 < 1.', () => {
        expect(parser.parse('2 < 1')).toBe(false);
      });

      test('Should return false for 2 lt 1.', () => {
        expect(parser.parse('2 lt 1')).toBe(false);
      });
    });

    describe('Boolean greater-than', () => {
      test('Should return false for 1 > 2.', () => {
        expect(parser.parse('1 > 2')).toBe(false);
      });

      test('Should return false for 1 gt 2.', () => {
        expect(parser.parse('1 gt 2')).toBe(false);
      });

      test('Should return true for 2 > 1.', () => {
        expect(parser.parse('2 > 1')).toBe(true);
      });

      test('Should return true for 2 gt 1.', () => {
        expect(parser.parse('2 gt 1')).toBe(true);
      });
    });

    describe('Boolean less-than or equal', () => {
      test('Should return true for 1 <= 2.', () => {
        expect(parser.parse('1 <= 2')).toBe(true);
      });

      test('Should return true for 1 lte 2.', () => {
        expect(parser.parse('1 lte 2')).toBe(true);
      });

      test('Should return false for 2 <= 1.', () => {
        expect(parser.parse('2 <= 1')).toBe(false);
      });

      test('Should return false for 2 lte 1.', () => {
        expect(parser.parse('2 lte 1')).toBe(false);
      });
    });

    describe('Boolean greater-than or equal', () => {
      test('Should return false for 1 >= 2.', () => {
        expect(parser.parse('1 >= 2')).toBe(false);
      });

      test('Should return false for 1 gte 2.', () => {
        expect(parser.parse('1 gte 2')).toBe(false);
      });

      test('Should return true for 2 >= 1.', () => {
        expect(parser.parse('2 >= 1')).toBe(true);
      });

      test('Should return true for 2 gte 1.', () => {
        expect(parser.parse('2 gte 1')).toBe(true);
      });
    });
  });

  describe('Variable Expressions', () => {
    let options;

    beforeEach(() => {
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

    test('Should parse single variable.', () => {
      expect(parser.parse('$example > 1', options)).toBe(true);
    });

    test('Should parse multiple variables - less than', () => {
      expect(parser.parse('$example < $example2', options)).toBe(true);
    });

    test('Should parse multiple variables - lt', () => {
      expect(parser.parse('$example lt $example2', options)).toBe(true);
    });

    test('Should parse multiple variables - lte', () => {
      expect(parser.parse('$example lte $example2', options)).toBe(true);
    });

    test('Should parse multiple variables - greater than', () => {
      expect(parser.parse('$example > $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - gt', () => {
      expect(parser.parse('$example gt $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - gte', () => {
      expect(parser.parse('$example gte $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - >=', () => {
      expect(parser.parse('$example >= $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - not equal', () => {
      expect(parser.parse('$example != $example2', options)).toBe(true);
    });

    test('Should parse multiple variables - is', () => {
      expect(parser.parse('$example is $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - ==', () => {
      expect(parser.parse('$example == $example2', options)).toBe(false);
    });

    test('Should parse multiple variables - is not', () => {
      expect(parser.parse('$example is not $example2', options)).toBe(true);
    });
  });

  describe('Complex Boolean Expressions', () => {
    let options;

    beforeEach(() => {
      options = {
        values: (label) => {
          const gameState = {
            user: {
              name: 'alice',
              health: 85,
              level: 5,
              magic: 30
            },
            inventory: {
              gold: 150,
              sword: true,
              potion: false
            },
            flags: {
              quest_complete: true,
              boss_defeated: false
            }
          };

          const parts = label.split('.');
          let current = gameState;
          
          for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
              current = current[part];
            } else {
              return null;
            }
          }
          
          return current;
        }
      };
    });

    describe('Symbolic Boolean Operators', () => {
      test('Should handle && (symbolic AND)', () => {
        expect(parser.parse('$user.health > 50 && $user.level >= 5', options)).toBe(true);
      });

      test('Should handle || (symbolic OR)', () => {
        expect(parser.parse('$user.health < 20 || $user.magic > 25', options)).toBe(true);
      });

      test('Should handle complex && chains', () => {
        expect(parser.parse('$user.name == "alice" && $user.health > 50 && $user.level >= 3', options)).toBe(true);
      });

      test('Should handle complex || chains', () => {
        expect(parser.parse('$user.health < 10 || $user.magic < 5 || $inventory.gold >= 100', options)).toBe(true);
      });

      test('Should return false for failing && expressions', () => {
        expect(parser.parse('$user.health < 50 && $user.level < 3', options)).toBe(false);
      });
    });

    describe('Word Boolean Operators', () => {
      test('Should handle AND (uppercase word)', () => {
        expect(parser.parse('$user.health > 50 AND $user.level >= 5', options)).toBe(true);
      });

      test('Should handle OR (uppercase word)', () => {
        expect(parser.parse('$user.health < 20 OR $user.magic > 25', options)).toBe(true);
      });

      test('Should handle and (lowercase word)', () => {
        expect(parser.parse('$user.health > 50 and $user.level >= 5', options)).toBe(true);
      });

      test('Should handle or (lowercase word)', () => {
        expect(parser.parse('$user.health < 20 or $user.magic > 25', options)).toBe(true);
      });
    });

    describe('Mixed Operator Precedence', () => {
      test('Should handle mixed AND/OR with correct precedence', () => {
        // Should evaluate as: (health > 80 AND level >= 5) OR gold >= 200
        expect(parser.parse('$user.health > 80 && $user.level >= 5 || $inventory.gold >= 200', options)).toBe(true);
      });

      test('Should handle mixed OR/AND with correct precedence', () => {
        // Should evaluate as: health < 50 OR (level >= 5 AND has sword)
        expect(parser.parse('$user.health < 50 || $user.level >= 5 && $inventory.sword == true', options)).toBe(true);
      });
    });

    describe('Boolean Operators with Key-Value Access', () => {
      test('Should work with dot notation and &&', () => {
        expect(parser.parse('$user.name == "alice" && $user.health > 80', options)).toBe(true);
      });

      test('Should work with bracket notation and ||', () => {
        expect(parser.parse('$inventory["potion"] == true || $flags["quest_complete"] == true', options)).toBe(true);
      });

      test('Should work with mixed notation and operators', () => {
        expect(parser.parse('$user.level >= 5 AND $inventory["sword"] == true', options)).toBe(true);
      });
    });

    describe('Negation with Boolean Operators', () => {
      test('Should handle negation with &&', () => {
        expect(parser.parse('!$inventory.potion && $user.health > 50', options)).toBe(true);
      });

      test('Should handle negation with ||', () => {
        expect(parser.parse('!$flags.boss_defeated || $user.level >= 5', options)).toBe(true);
      });
    });
  });

  describe('Key-Value Expressions', () => {
    let options;

    beforeEach(() => {
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

    describe('Dot Notation', () => {
      test('Should access object property with dot notation - string value', () => {
        expect(parser.parse('$user.name == "John"', options)).toBe(true);
      });

      test('Should access object property with dot notation - number comparison', () => {
        expect(parser.parse('$user.age > 20', options)).toBe(true);
      });

      test('Should access object property with dot notation - number equality', () => {
        expect(parser.parse('$user.age == 25', options)).toBe(true);
      });

      test('Should return false for non-matching dot notation access', () => {
        expect(parser.parse('$user.name == "Jane"', options)).toBe(false);
      });

      test('Should compare numeric properties using dot notation', () => {
        expect(parser.parse('$numbers.a < $numbers.b', options)).toBe(true);
      });
    });

    describe('Bracket Notation', () => {
      test('Should access object property with bracket notation - unquoted key', () => {
        expect(parser.parse('$user[name] == "John"', options)).toBe(true);
      });

      test('Should access object property with bracket notation - double quoted key', () => {
        expect(parser.parse('$user["age"] > 20', options)).toBe(true);
      });

      test('Should access object property with bracket notation - single quoted key', () => {
        expect(parser.parse('$user[\'age\'] == 25', options)).toBe(true);
      });

      test('Should access hyphenated keys with bracket notation', () => {
        expect(parser.parse('$settings["theme-color"] == "dark"', options)).toBe(true);
      });

      test('Should access keys with spaces using bracket notation', () => {
        expect(parser.parse('$settings["auto save"] == true', options)).toBe(true);
      });

      test('Should compare numeric properties using bracket notation', () => {
        expect(parser.parse('$numbers["a"] < $numbers["b"]', options)).toBe(true);
      });
    });

    describe('Mixed Access Patterns', () => {
      test('Should work with mixed dot and bracket notation in same expression', () => {
        expect(parser.parse('$user.age > $settings["font-size"]', options)).toBe(true);
      });

      test('Should work with inequality comparison using mixed notation', () => {
        expect(parser.parse('$user.name != $settings["theme-color"]', options)).toBe(true);
      });
    });

    describe('Non-existent Keys', () => {
      test('Should handle non-existent dot notation keys gracefully', () => {
        expect(parser.parse('$user.nonexistent == null', options)).toBe(true);
      });

      test('Should handle non-existent bracket notation keys gracefully', () => {
        expect(parser.parse('$user["nonexistent"] == null', options)).toBe(true);
      });
    });
  });
});