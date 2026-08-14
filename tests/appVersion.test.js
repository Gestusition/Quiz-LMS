const { normalizeVersion, resolveAppVersion } = require('../utils/appVersion');

describe('application version resolution', () => {
  test('normalizes release tags and the npm SemVer fallback', () => {
    expect(normalizeVersion('1.1.0.3')).toBe('1.1.0.3');
    expect(normalizeVersion('v1.1.0.3')).toBe('1.1.0.3');
    expect(normalizeVersion('1.1.0+3')).toBe('1.1.0.3');
    expect(normalizeVersion('invalid')).toBeNull();
  });

  test('prefers an explicit deployment version', () => {
    const git = jest.fn();
    expect(resolveAppVersion({
      env: { APP_VERSION: '1.2.0.0' },
      git,
      packageVersion: '1.0.0'
    })).toBe('1.2.0.0');
    expect(git).not.toHaveBeenCalled();
  });

  test('uses the exact release tag when HEAD is tagged', () => {
    const git = jest.fn(() => '1.1.0.3');
    expect(resolveAppVersion({ env: {}, git, packageVersion: '1.0.0' }))
      .toBe('1.1.0.3');
  });

  test('advertises the next revision from the latest tag on an untagged commit', () => {
    const git = jest.fn(args => {
      if (args.includes('--exact-match')) throw new Error('not tagged');
      return '1.1.0.2';
    });
    expect(resolveAppVersion({ env: {}, git, packageVersion: '1.0.0' }))
      .toBe('1.1.0.3');
  });

  test('falls back to package metadata when Git is unavailable', () => {
    const git = jest.fn(() => { throw new Error('git unavailable'); });
    expect(resolveAppVersion({ env: {}, git, packageVersion: '1.1.0+3' }))
      .toBe('1.1.0.3');
  });
});
