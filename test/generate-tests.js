buffer = [];
function describe(name, fn) {
  buffer.push(`
    describe('${name}', () => {`);

  fn();

  buffer.push(`
    });
  `);
}

function getOrigin(url) {
  let index = 0;
  if (url.startsWith('https://')) {
    index = url.indexOf('/', 'https://'.length);
  } else if (url.startsWith('//')) {
    index = url.indexOf('/', '//'.length);
  } else {
    return '';
  }
  if (index === -1) return url;
  return url.slice(0, index);
}

function getProtocol(url) {
  if (url.startsWith('https://')) return 'https:';
  return '';
}

function getPath(base, input) {
  const origin = getOrigin(base);
  if (origin) base = base.slice(origin.length);
  base = base.replace(/(^|\/)[^\/]*$/, '$1');
  let relative = require('path').normalize(base + input);
  if (origin) {
    relative = relative.replace(/^(\.{1,2}\/)+/, '/');
    if (!relative.startsWith('/')) relative = '/' + relative;
  } else if (!relative.startsWith('.') && (base || input).startsWith('.')) {
    return './' + relative;
  }
  return relative;
}

function suite(base) {
  buffer.push(`
      describe(\`base = "${base}"\`, () => {
        describe('with absolute input', () => {
          test('returns input', () => {
            const base = '${base}';
            const input = 'https://absolute.com/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('https://absolute.com/main.js.map');
          });

          test('normalizes input', () => {
            const base = '${base}';
            const input = 'https://absolute.com/foo/./bar/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('https://absolute.com/foo/main.js.map');
          });

          test('normalizes current directory', () => {
            const base = '${base}';
            const input = 'https://absolute.com/./main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('https://absolute.com/main.js.map');
          });

          test('normalizes too many parent accessors', () => {
            const base = '${base}';
            const input = 'https://absolute.com/../../../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('https://absolute.com/main.js.map');
          });

          test('normalizes too many parent accessors, late', () => {
            const base = '${base}';
            const input = 'https://absolute.com/foo/../../../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('https://absolute.com/main.js.map');
          });
        });

        describe('with protocol relative input', () => {
          test('resolves relative to the base protocol', () => {
            const base = '${base}';
            const input = '//protocol-relative.com/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getProtocol(base)}//protocol-relative.com/main.js.map');
          });

          test('normalizes input', () => {
            const base = '${base}';
            const input = '//protocol-relative.com/foo/./bar/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getProtocol(base)}//protocol-relative.com/foo/main.js.map');
          });

          test('normalizes current directory', () => {
            const base = '${base}';
            const input = '//protocol-relative.com/./main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getProtocol(base)}//protocol-relative.com/main.js.map');
          });

          test('normalizes too many parent accessors', () => {
            const base = '${base}';
            const input = '//protocol-relative.com/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getProtocol(base)}//protocol-relative.com/main.js.map');
          });

          test('normalizes too many parent accessors, late', () => {
            const base = '${base}';
            const input = '//protocol-relative.com/foo/../../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getProtocol(base)}//protocol-relative.com/main.js.map');
          });
        });

        describe('with absolute path input', () => {
          test('remains absolute path', () => {
            const base = '${base}';
            const input = '/assets/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}/assets/main.js.map');
          });

          test('normalizes input', () => {
            const base = '${base}';
            const input = '/foo/./bar/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}/foo/main.js.map');
          });

          test('normalizes current directory', () => {
            const base = '${base}';
            const input = '/./main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}/main.js.map');
          });

          test('normalizes too many parent accessors', () => {
            const base = '${base}';
            const input = '/../../../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}/main.js.map');
          });

          test('normalizes too many parent accessors, late', () => {
            const base = '${base}';
            const input = '/foo/../../../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}/main.js.map');
          });
        });

        describe('with leading dot relative input', () => {
          test('resolves relative to current directory', () => {
            const base = '${base}';
            const input = './bar/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, './bar/main.js.map')}');
          });

          test('resolves relative to parent directory', () => {
            const base = '${base}';
            const input = '../bar/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, '../bar/main.js.map')}');
          });

          test('resolves relative to parent multiple directory', () => {
            const base = '${base}';
            const input = '../../../bar/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, '../../../bar/main.js.map')}');
          });

          test('normalizes input', () => {
            const base = '${base}';
            const input = './foo/./bar/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, './foo/./bar/../main.js.map')}');
          });
        });

        describe('with relative input', () => {
          test('resolves relative to current directory', () => {
            const base = '${base}';
            const input = 'bar/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, 'bar/main.js.map')}');
          });

          test('resolves relative to parent multiple directory, later', () => {
            const base = '${base}';
            const input = 'foo/../../../bar/main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, 'foo/../../../bar/main.js.map')}');
          });

          test('normalizes input', () => {
            const base = '${base}';
            const input = 'foo/./bar/../main.js.map';
            const resolved = resolve(input, base);
            expect(resolved).toBe('${getOrigin(base)}${getPath(base, 'foo/./bar/../main.js.map')}');
          });
        });
      });
    `);
}

describe('without base', () => {
  suite('');
});

describe('with absolute base', () => {
  suite('https://foo.com');
  suite('https://foo.com/');
  suite('https://foo.com/file');
  suite('https://foo.com/dir/');
  suite('https://foo.com/dir/file');
});

describe('with protocol relative base', () => {
  suite('//foo.com');
  suite('//foo.com/');
  suite('//foo.com/file');
  suite('//foo.com/dir/');
  suite('//foo.com/dir/file');
});

describe('with path absolute base', () => {
  suite('/');
  suite('/root');
  suite('/root/');
  suite('/root/file');
  suite('/root/dir/');
});

describe('with relative base', () => {
  suite('file');
  suite('dir/');
  suite('dir/file');
  suite('deep/dir/');
  suite('./file');
  suite('./dir/');
  suite('./deep/file');
  suite('./deep/dir/');
  suite('../file');
  suite('../dir/');
  suite('../deep/file');
  suite('../deep/dir/');
});

require('clipboardy').writeSync(buffer.join('\n'));
