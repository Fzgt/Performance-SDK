import PerfSDK from '../../src/index';

const perfSDK = new PerfSDK({
  elementTiming: true,
  logUrl: 'http://123.com/test',
});

console.log('🐻', perfSDK);
// 模拟一个长任务
const start = Date.now();
while (Date.now() - start < 1000) {}
