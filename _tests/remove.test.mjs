import test from 'node:test'
import assert from 'assert'
import { removeInfraAction } from '../index.mjs'

test('will return ok if remove status is successfully', async (t) => {
    const io = {
        aws: {
            removeStack: t.mock.fn(),
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

    const result = await removeInfraAction(io)({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev'
    })
    assert.strictEqual(result.status, 'ok')
    assert.strictEqual(result.message, 'Template removed successfully')
})

test('will throw error if deploy status returns failure', async (t) => {
    const io = {
        aws: {
            removeStack: t.mock.fn(),
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
        await removeInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev'
        })
    } catch (e) {
        assert.strictEqual(e.message, 'CloudFormation removal has failed')
    }
})

test('will throw error if deploy status returns rollback', async (t) => {
    const io = {
        aws: {
            removeStack: t.mock.fn(),
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
        await removeInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev'
        })
    } catch (e) {
        assert.strictEqual(e.message, 'Removal has been rolled back')
    }
})

test('will throw error if deploy status returns inprogress', async (t) => {
    const io = {
        aws: {
            removeStack: t.mock.fn(),
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
        await removeInfraAction(io)({
            name: 'my-infradeploy-stack',
            region: 'us-east-1',
            stage: 'dev'
        })
    } catch (e) {
        assert.strictEqual(e.message, 'Removal is still in progress')
    }
})
