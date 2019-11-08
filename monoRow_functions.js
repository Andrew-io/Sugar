/* 
Read Object from a string path */
const getIthem = (obj, path) => path.split('.').reduce((ob, k)=> ob[k] || '', obj);

/* 
Factorial n! */
const fact = x => x > 1 ? x * fact(--x) : 1;

/* 
Fibonacci */
const fibo = (m, c=[1], l=1) => l == m ? c : fibo(m, [...c, (c[l-2]||0)+c[l-1]], l+1);

/* 
String reverse */
const reverse = (str = '') => [...str].reduce((a, c) => c + a, '');

/*
Sum an ndefinite number of parameters*/
const sum = (...n) => n.reduce((a, x) => a+=x, 0);

/* 
Query string parser */
const parseQstring = str => /\?/.test(str) ?
	str.substr(str.search(/\?/) +1).split('&')
		.map(x => ({k: x.split('=')[0], v: x.split('=')[1]})) : [];
