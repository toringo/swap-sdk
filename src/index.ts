import JSBI from 'jsbi'
export { JSBI }

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};


export * from './functions'
export * from './libs'
// export * from './router'
// export * from './fetcher'
