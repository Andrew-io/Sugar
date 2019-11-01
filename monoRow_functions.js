/* 
Read Object from a string path */
const getV = (obj, path) => (path.split('.').
	reduce((o, k)=> typeof o === 'object' ? o[k] : undefined, obj));

/* 
Factorial n! */
const fact = x => x > 1 ? x * fact(--x) : 1;

/* 
Fibonacci */
const fibo = (m, c=[1], l=1) => l == m ? c : fibo(m, [...c, (c[l-2]||0)+c[l-1]], l+1);

/* 
String reverse */
const reverse = str => !str ? null :
	[...str].reduce((acc, chr)=> chr + acc, '');

/* 
Query string parser */
const parseQstring = str => /\?|#/.test(str) ?
	str.substr(str.search(/\?|#/) +1).split('&')
		.map(x => ({k: x.split('=')[0], v: x.split('=')[1]})) : [];