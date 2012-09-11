
/* description: Parses end executes mathematical expressions. */

/* lexical grammar */
%lex
%%

\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return 'NUMBER'
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"!"                   return '!'
"%"                   return '%'
"("                   return '('
")"                   return ')'
"pi"                  return 'PI'
"i"                   return 'I'
"e"                   return 'E'
"z"                   return 'Z'
"mouse"               return 'MOUSE'
"conj"                return 'CONJ'
"exp"                 return 'EXP'
"sin"                 return 'SIN'
"cos"                 return 'COS'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%right '!'
%right '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : e EOF
        { typeof console !== 'undefined' ? console.log($1) : print($1);
          return Function('real','imag',$1.code + 'return [' + $1.real + ',' + $1.imag + '];'); }
    ;

e
    : e '+' e
        {$$ = $1.add($3);}
    | e '-' e
        {$$ = $1.subtract($3);}
    | e '*' e
        {$$ = $1.multiply($3);}
    | e '/' e
        {$$ = $1.divide($3);}
    | e '^' e
        {$$ = $1.power($3);}
    | '-' e %prec UMINUS
        {$$ = $1.negate();}
    | '(' e ')'
        {$$ = $2;}
    | CONJ '(' e ')'
        {$$ = $3.conjugate();}
    | EXP '(' e ')'
        {$$ = $3.exp();}
    | SIN '(' e ')'
        {$$ = $3.sin();}
    | COS '(' e ')'
        {$$ = $3.cos();}
    | NUMBER
        {$$ = new StraightLineProgram(parseFloat(yytext),0);}
    | E
        {$$ = new StraightLineProgram(Math.E,0);}
    | PI
        {$$ = new StraightLineProgram(Math.PI,0);}
    | I
        {$$ = new StraightLineProgram(0,1);}
    | Z
        {$$ = new StraightLineProgram('real','imag');}
    | MOUSE
        {$$ = new StraightLineProgram('mouse[0]','mouse[1]');}
    ;


%%

function StraightLineProgram(real,imag)
{
    if ( typeof StraightLineProgram.prefix == 'undefined' ) {
        StraightLineProgram.prefix = 0;
    } else {
	StraightLineProgram.prefix++;
    }
    
    this.prefix = StraightLineProgram.prefix;

    this.code = ''
    this.real = real;
    this.imag = imag;
    this.unused_index = 0;
}

var sub = function(str) {
  return str.replace(/#\{(.*?)\}/g,
    function(whole, expr) {
      return eval(expr)
    })
}

StraightLineProgram.prototype = {
    new_variable: function() {
	var variable_name = 'v' + this.prefix + '_' + this.unused_index;
	this.unused_index++;
	return variable_name;
    },

    add: function(other) {
	this.code = this.code + other.code;
	this.real = ['(',this.real,'+',other.real,')'].join('')
	this.imag = ['(',this.imag,'+',other.imag,')'].join('')
	return this;
    },

    subtract: function(other) {
	this.code = this.code + other.code;
	this.real = '(' + this.real + '-' + other.real + ')';
	this.imag = '(' + this.imag + '-' + other.imag + ')';
	return this;
    },

    negate: function() {
	this.real = '-(' + this.real + ')';
	this.imag = '-(' + this.imag + ')';
	return this;
    },

    conjugate: function() {
	this.imag = '-(' + this.imag + ')';
	return this;
    },

    exp: function() {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var this_exp = this.new_variable();
	
	this.code = this.code + 'var ' + this_real + ' = ' + this.real + ';';
	this.code = this.code + 'var ' + this_imag + ' = ' + this.imag + ';';
	this.code = this.code + 'var ' + this_exp + ' = Math.exp(' + this.real + ');';

	this.real = '(' + this_exp + '*' + 'Math.cos(' + this_imag + '))';
	this.imag = '(' + this_exp + '*' + 'Math.sin(' + this_imag + '))';

	return this;
    },

   cos: function() {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var this_exp_i = this.new_variable();
	var this_exp_minus_i = this.new_variable();

	this.code = this.code + 'var ' + this_real + ' = ' + this.real + ';';
	this.code = this.code + 'var ' + this_imag + ' = ' + this.imag + ';';
	this.code = this.code + 'var ' + this_exp_i + ' = Math.exp(' + this.imag + ');';
	this.code = this.code + 'var ' + this_exp_minus_i + ' = Math.exp(-(' + this.imag + '));';

	this.real = '(Math.cos(' + this_real + ')*(' + this_exp_minus_i + '-' + this_exp_i + ')/2.0)';
	this.imag = '(Math.sin(' + this_real + ')*(' + this_exp_minus_i + '+' + this_exp_i + ')/2.0)';

	return this;
    },

    sin: function() {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var this_exp_i = this.new_variable();
	var this_exp_minus_i = this.new_variable();

	this.code = this.code + 'var ' + this_real + ' = ' + this.real + ';';
	this.code = this.code + 'var ' + this_imag + ' = ' + this.imag + ';';
	this.code = this.code + 'var ' + this_exp_i + ' = Math.exp(' + this.imag + ');';
	this.code = this.code + 'var ' + this_exp_minus_i + ' = Math.exp(-(' + this.imag + '));';

	this.real = '(Math.sin(' + this_real + ')*(' + this_exp_i + '+' + this_exp_minus_i + ')/2.0)';
	this.imag = '(Math.cos(' + this_real + ')*(' + this_exp_i + '-' + this_exp_minus_i + ')/2.0)';


	return this;
    },

    power: function(other) {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var this_log_modulus = this.new_variable();
	var this_argument = this.new_variable();
	var this_new_log_modulus = this.new_variable();
	var this_new_argument = this.new_variable();
	var other_real = this.new_variable();
	var other_imag = this.new_variable();

	new_code = ''
	new_code = new_code + 'var ' + this_real + ' = ' + this.real + ';';
	new_code = new_code + 'var ' + this_imag + ' = ' + this.imag + ';';
	new_code = new_code + 'var ' + this_log_modulus + ' = Math.log(Math.sqrt(' + this_real + '*' + this_real + '+' + this_imag + '*' + this_imag + '));';
	new_code = new_code + 'var ' + this_argument + ' = Math.atan2(' + this_imag + ',' + this_real + ');';
	new_code = new_code + 'var ' + other_real + ' = ' + other.real + ';';
	new_code = new_code + 'var ' + other_imag + ' = ' + other.imag + ';';
	new_code = new_code + 'var ' + this_new_log_modulus + ' = ' + other_real + '*' + this_log_modulus + '-' + other_imag + '*' + this_argument + ';';
	new_code = new_code + 'var ' + this_new_argument + ' = ' + other_real + '*' + this_argument + '+' + other_imag + '*' + this_log_modulus + ';';

	this.code = this.code + other.code + new_code;
	this.real = '(Math.exp(' + this_new_log_modulus + ') * Math.cos(' + this_new_argument + '))';
	this.imag = '(Math.exp(' + this_new_log_modulus + ') * Math.sin(' + this_new_argument + '))';

	return this;
    },


    multiply: function(other) {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var other_real = this.new_variable();
	var other_imag = this.new_variable();

	new_code = ''
	new_code = new_code + 'var ' + this_real + ' = ' + this.real + ';';
	new_code = new_code + 'var ' + this_imag + ' = ' + this.imag + ';';
	new_code = new_code + 'var ' + other_real + ' = ' + other.real + ';';
	new_code = new_code + 'var ' + other_imag + ' = ' + other.imag + ';';

	this.code = this.code + other.code + new_code;
	this.real = '(' + this_real + '*' + other_real + '-' + this_imag + '*' + other_imag + ')';
	this.imag = '(' + this_real + '*' + other_imag + '+' + this_imag + '*' + other_real + ')';

	return this;
    },

    divide: function(other) {
	var this_real = this.new_variable();
	var this_imag = this.new_variable();
	var other_real = this.new_variable();
	var other_imag = this.new_variable();
	var denominator = this.new_variable();

	new_code = ''
	new_code = new_code + 'var ' + this_real + ' = ' + this.real + ';';
	new_code = new_code + 'var ' + this_imag + ' = ' + this.imag + ';';
	new_code = new_code + 'var ' + other_real + ' = ' + other.real + ';';
	new_code = new_code + 'var ' + other_imag + ' = ' + other.imag + ';';
	new_code = new_code + 'var ' + denominator + ' = ' + other_real + '*' + other_real + '+' + other_imag + '*' + other_imag + ';'

	this.code = this.code + other.code + new_code;
	this.real = '((' + this_real + '*' + other_real + '+' + this_imag + '*' + other_imag + ') / (' + denominator + '))' ;
	this.imag = '((' + this_imag + '*' + other_real + '-' + this_real + '*' + other_imag + ') / (' + denominator + '))' ;

	return this;
    }
}
