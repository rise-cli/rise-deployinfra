import test from 'node:test'
import assert from 'assert'
import { deployInfraAction } from '../index.mjs'

test('will return ok if deployment status is successfully', async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn(() => ({ status: 'success' })),
            getOutputs: t.mock.fn()
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    const result = await deployInfraAction(io)({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev',
        template: JSON.stringify({}),
        outputs: []
    })
    assert.strictEqual(result.status, 'ok')
    assert.strictEqual(result.message, 'Template deployed successfully')
    assert.strictEqual(Object.keys(result.outputs).length, 0)
})

test('will return outputs', async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn(() => ({ status: 'success' })),
            getOutputs: t.mock.fn(() => {
                return {
                    URL: 'endpoint'
                }
            })
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    const result = await deployInfraAction(io)({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev',
        template: JSON.stringify({}),
        outputs: ['URL']
    })
    assert.strictEqual(result.status, 'ok')
    assert.strictEqual(result.message, 'Template deployed successfully')
    assert.strictEqual(Object.keys(result.outputs).length, 1)
    assert.strictEqual(result.outputs.URL, 'endpoint')
})

test('will throw error if deploy status returns failure', async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn(() => ({ status: 'fail' })),
            getOutputs: t.mock.fn()
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    try {
        await deployInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev',
            template: JSON.stringify({}),
            outputs: []
        })
    } catch (e) {
        assert.strictEqual(e.message, 'CloudFormation deployment has failed')
    }
})

test('will throw error if deploy status returns rollback', async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn(() => ({ status: 'rollback' })),
            getOutputs: t.mock.fn()
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    try {
        await deployInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev',
            template: JSON.stringify({}),
            outputs: []
        })
    } catch (e) {
        assert.strictEqual(e.message, 'Deployment has been rolled back')
    }
})

test('will throw error if deploy status returns inprogress', async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn(() => ({ status: 'inprogress' })),
            getOutputs: t.mock.fn()
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    try {
        await deployInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev',
            template: JSON.stringify({}),
            outputs: []
        })
    } catch (e) {
        assert.strictEqual(e.message, 'Deployment is still in progress')
    }
})

/**
 * The Node test runner does not currently support some ascii characters.
 * Github Issue: https://github.com/nodejs/node/issues/46159
 */
test('will print status', { skip: true }, async (t) => {
    const io = {
        aws: {
            deployStack: t.mock.fn(),
            getDeployStatus: t.mock.fn((config) => {
                const resources = [
                    { id: 'db', status: 'COMPLETE' },
                    { id: 'api', status: 'FAILED' },
                    { id: 'function', status: 'ROLLBACK' },
                    { id: 'longnamedfunction', status: 'UPDATING' }
                ]
                config.config.onCheck(resources)
                return { status: 'success' }
            }),
            getOutputs: t.mock.fn()
        },
        cli: {
            clear: t.mock.fn(),
            print: t.mock.fn(),
            endLoadingMessage: t.mock.fn(),
            startLoadingMessage: t.mock.fn(),
            printSuccessMessage: t.mock.fn()
        }
    }

    const res = await deployInfraAction(io)({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev',
        template: JSON.stringify({}),
        outputs: []
    })
    const printedStatus = io.cli.print.mock.calls[0]
    const expectedLines = [
        '\x1b[32m✔\x1b[37m db                \x1b[2mCOMPLETE\x1b[0m\n',
        '\x1b[31m•\x1b[37m api               \x1b[2mFAILED\x1b[0m\n',
        '\x1b[31m•\x1b[37m function          \x1b[2mROLLBACK\x1b[0m\n',
        '\x1b[34m•\x1b[37m longnamedfunction \x1b[2mUPDATING\x1b[0m\n'
    ]
    assert.strictEqual(
        printedStatus,
        `${expectedLines[0]}${expectedLines[1]}${expectedLines[2]}${expectedLines[3]}`
    )
})
