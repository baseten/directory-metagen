/* eslint-env mocha */
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const mockFS = require('mock-fs')
const metagen = require('../')
const assert = require('assert')

describe('metagen', function () {
  this.timeout(15000)

  const jsGen = ext => ({
    [`file1.${ext}`]: `console.log("${ext} file 1")`,
    [`file2.${ext}`]: `console.log("${ext} file 2")`
  })
  const cssGen = ext => ({
    [`file1.${ext}`]: `#titanic.file1${ext} { float: none; }`,
    [`file2.${ext}`]: `#wife.file2${ext} { right: 100%; }`
  })

  beforeEach(() => {
    mockFS({
      'public/publicFiles': {
        js: jsGen('js'),
        jsx: jsGen('jsx'),
        ts: jsGen('ts'),
        coffee: jsGen('coffee'),
        css: cssGen('css'),
        less: cssGen('less'),
        sass: cssGen('sass'),
        'rootjs.js': 'console.log("JS file")',
        'rootcss.css': '.delorean { z-index: -1955; }',
        'file.txt': 'Text file',
        'roothtml.html': '<html>file</html>',
        'empty-dir': {}
      },
      'path/to/some.png': Buffer.from([8, 6, 7, 5, 3, 0, 9]),
      'some/other/path': {/** another empty directory */}
    })
  })

  afterEach(() => {
    mockFS.restore()
  })

  it('Output Option', async () => {
    mockFS({
      'public/publicFiles': {
        'output': {
          'file1.js': 'console.log("JS file")',
          'file2.js': 'console.log("JS file")'
        }
      }
    })

    await metagen({
      output: '__catalog.js',
      path: 'public/publicFiles/output',
      format: metagen.formats.commonJS
    })

    const fileCommonJS = await fs.readFileAsync('public/publicFiles/output/__catalog.js', 'utf8')

    assert.equal(fileCommonJS, `define(function(require) {
    return {
        'file1': require('./file1'),
        'file2': require('./file2')
    };
});`)

    await metagen({
      output: '__catalog.js',
      path: 'public/publicFiles/output',
      format: metagen.formats.es6
    })

    const fileES6 = await fs.readFileAsync('public/publicFiles/output/__catalog.js', 'utf8')

    assert.equal(fileES6, `import file1 from './file1';
import file2 from './file2';
export default {
    file1,
    file2
}`)
  })

  it('commonJS', async () => {
    await metagen({
      path: 'public/publicFiles/',
      format: metagen.formats.commonJS
    })

    const file = await fs.readFileAsync('public/publicFiles/__all.js', 'utf8')

    assert.equal(file, `define(function(require) {
    return {
        'rootcss': require('./rootcss'),
        'roothtml': require('./roothtml'),
        'rootjs': require('./rootjs'),
        'coffee/file1': require('./coffee/file1'),
        'coffee/file2': require('./coffee/file2'),
        'css/file1': require('./css/file1'),
        'css/file2': require('./css/file2'),
        'js/file1': require('./js/file1'),
        'js/file2': require('./js/file2'),
        'jsx/file1': require('./jsx/file1'),
        'jsx/file2': require('./jsx/file2'),
        'less/file1': require('./less/file1'),
        'less/file2': require('./less/file2'),
        'sass/file1': require('./sass/file1'),
        'sass/file2': require('./sass/file2'),
        'ts/file1': require('./ts/file1'),
        'ts/file2': require('./ts/file2')
    };
});`)
  })

  it('amd', async () => {
    await metagen({
      path: 'public/publicFiles/',
      format: metagen.formats.amd
    })

    const file = await fs.readFileAsync('public/publicFiles/__all.js', 'utf8')

    assert.equal(file, `define([
    'rootcss',
    'roothtml',
    'rootjs',
    'coffee/file1',
    'coffee/file2',
    'css/file1',
    'css/file2',
    'js/file1',
    'js/file2',
    'jsx/file1',
    'jsx/file2',
    'less/file1',
    'less/file2',
    'sass/file1',
    'sass/file2',
    'ts/file1',
    'ts/file2'
], function() {
    return {
        'rootcss': arguments[0],
        'roothtml': arguments[1],
        'rootjs': arguments[2],
        'coffee/file1': arguments[3],
        'coffee/file2': arguments[4],
        'css/file1': arguments[5],
        'css/file2': arguments[6],
        'js/file1': arguments[7],
        'js/file2': arguments[8],
        'jsx/file1': arguments[9],
        'jsx/file2': arguments[10],
        'less/file1': arguments[11],
        'less/file2': arguments[12],
        'sass/file1': arguments[13],
        'sass/file2': arguments[14],
        'ts/file1': arguments[15],
        'ts/file2': arguments[16]
    }
});`)
  })

  it('es6', async () => {
    await metagen({
      path: 'public/publicFiles/',
      format: metagen.formats.es6
    })

    const file = await fs.readFileAsync('public/publicFiles/__all.js', 'utf8')

    assert.equal(file, `import rootcss from './rootcss';
import roothtml from './roothtml';
import rootjs from './rootjs';
import coffee_file1 from './coffee/file1';
import coffee_file2 from './coffee/file2';
import css_file1 from './css/file1';
import css_file2 from './css/file2';
import js_file1 from './js/file1';
import js_file2 from './js/file2';
import jsx_file1 from './jsx/file1';
import jsx_file2 from './jsx/file2';
import less_file1 from './less/file1';
import less_file2 from './less/file2';
import sass_file1 from './sass/file1';
import sass_file2 from './sass/file2';
import ts_file1 from './ts/file1';
import ts_file2 from './ts/file2';
export default {
    rootcss,
    roothtml,
    rootjs,
    coffee_file1,
    coffee_file2,
    css_file1,
    css_file2,
    js_file1,
    js_file2,
    jsx_file1,
    jsx_file2,
    less_file1,
    less_file2,
    sass_file1,
    sass_file2,
    ts_file1,
    ts_file2
}`)
  })

  it('deepCommonJS', async () => {
    await metagen({
      path: 'public/publicFiles/',
      format: metagen.formats.deepCommonJS
    })

    const file = await fs.readFileAsync('public/publicFiles/__all.js', 'utf8')

    assert.equal(file, `define(function(require) {
    return {
        "rootcss": require('./rootcss'),
        "roothtml": require('./roothtml'),
        "rootjs": require('./rootjs'),
        "coffee": {
            "file1": require('./coffee/file1'),
            "file2": require('./coffee/file2')
        },
        "css": {
            "file1": require('./css/file1'),
            "file2": require('./css/file2')
        },
        "js": {
            "file1": require('./js/file1'),
            "file2": require('./js/file2')
        },
        "jsx": {
            "file1": require('./jsx/file1'),
            "file2": require('./jsx/file2')
        },
        "less": {
            "file1": require('./less/file1'),
            "file2": require('./less/file2')
        },
        "sass": {
            "file1": require('./sass/file1'),
            "file2": require('./sass/file2')
        },
        "ts": {
            "file1": require('./ts/file1'),
            "file2": require('./ts/file2')
        }
    };
});`)
  })

  it('deepAMD', async () => {
    await metagen({
      path: 'public/publicFiles/',
      format: metagen.formats.deepAMD
    })

    const file = await fs.readFileAsync('public/publicFiles/__all.js', 'utf8')

    assert.equal(file, `define([
    'rootcss',
    'roothtml',
    'rootjs',
    'coffee/file1',
    'coffee/file2',
    'css/file1',
    'css/file2',
    'js/file1',
    'js/file2',
    'jsx/file1',
    'jsx/file2',
    'less/file1',
    'less/file2',
    'sass/file1',
    'sass/file2',
    'ts/file1',
    'ts/file2'
], function() {
    return {
        "rootcss": "arguments[0]",
        "roothtml": "arguments[1]",
        "rootjs": "arguments[2]",
        "coffee": {
            "file1": "arguments[3]",
            "file2": "arguments[4]"
        },
        "css": {
            "file1": "arguments[5]",
            "file2": "arguments[6]"
        },
        "js": {
            "file1": "arguments[7]",
            "file2": "arguments[8]"
        },
        "jsx": {
            "file1": "arguments[9]",
            "file2": "arguments[10]"
        },
        "less": {
            "file1": "arguments[11]",
            "file2": "arguments[12]"
        },
        "sass": {
            "file1": "arguments[13]",
            "file2": "arguments[14]"
        },
        "ts": {
            "file1": "arguments[15]",
            "file2": "arguments[16]"
        }
    };
});`)
  })
})
