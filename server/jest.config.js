export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/seeders/**'
  ],
  coverageDirectory: 'coverage'
};
