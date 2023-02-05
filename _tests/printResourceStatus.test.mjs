import test from 'node:test'
import assert from 'assert'
import { printResourceStatus, formatCloudformationStatus } from '../print.mjs'

test('complete resource status logs correctly', async (t) => {
    const text = printResourceStatus(20, {
        id: 'Database',
        status: 'COMPLETE'
    })

    assert.strictEqual(
        text,
        '\x1b[32m✔\x1b[37m Database             \x1b[2mCOMPLETE\x1b[0m'
    )
})

test('failed resource status logs correctly', async (t) => {
    const text = printResourceStatus(20, {
        id: 'Database',
        status: 'FAILED'
    })

    assert.strictEqual(
        text,
        '\x1b[31m•\x1b[37m Database             \x1b[2mFAILED\x1b[0m'
    )
})

test('rollback resource status logs correctly', async (t) => {
    const text = printResourceStatus(20, {
        id: 'Database',
        status: 'ROLLBACK'
    })

    assert.strictEqual(
        text,
        '\x1b[31m•\x1b[37m Database             \x1b[2mROLLBACK\x1b[0m'
    )
})

test('inprogress resource status logs correctly and is the default status', async (t) => {
    const text = printResourceStatus(20, {
        id: 'Database',
        status: 'UPDATING'
    })

    assert.strictEqual(
        text,
        '\x1b[34m•\x1b[37m Database             \x1b[2mUPDATING\x1b[0m'
    )
})

/**
 * The Node test runner does not currently support some ascii characters.
 * Github Issue: https://github.com/nodejs/node/issues/46159
 */
test('can format a list of cf resource statuses', { skip: true }, () => {
    const resources = [
        { id: 'db', status: 'COMPLETE' },
        { id: 'api', status: 'FAILED' },
        { id: 'function', status: 'ROLLBACK' },
        { id: 'longnamedfunction', status: 'UPDATING' }
    ]
    const res = formatCloudformationStatus(resources)
    const expectedLines = [
        '\x1b[32m✔\x1b[37m db                \x1b[2mCOMPLETE\x1b[0m\n',
        '\x1b[31m•\x1b[37m api               \x1b[2mFAILED\x1b[0m\n',
        '\x1b[31m•\x1b[37m function          \x1b[2mROLLBACK\x1b[0m\n',
        '\x1b[34m•\x1b[37m longnamedfunction \x1b[2mUPDATING\x1b[0m\n'
    ]
    assert.strictEqual(
        res,
        `${expectedLines[0]}${expectedLines[1]}${expectedLines[2]}${expectedLines[3]}`
    )
})
