import cli from 'cli-foundation'
import aws from 'aws-foundation'
import {
    makeInProgressMessage,
    makeSuccessMessage,
    makeErrorMessage
} from './print'

type Resource = {
    id: string
    status: string
    type: string
}

type CheckDeploymentInput = {
    messages: {
        inProcess: string
        fail: string
    }
    region: string
    stackName: string
}

function printStatus(x: string) {
    cli.terminal.endLoadingMessage()
    cli.terminal.startLoadingMessage(x)
}

function getLongestResourceName(resources: Resource[]): number {
    return resources.reduce((acc, r) => {
        return r.id.length > acc ? r.id.length : acc
    }, 0)
}

function formatResourceStatus(nameLength: number, item: Resource) {
    const name = item.id
    const status = item.status

    if (item.status.includes('COMPLETE')) {
        return makeSuccessMessage(name, nameLength, status)
    }

    if (item.status.includes('FAILED') || item.status.includes('ROLLBACK')) {
        return makeErrorMessage(name, nameLength, status)
    }

    return makeInProgressMessage(name, nameLength, status)
}

function onStatusCheck(resources: Resource[]) {
    cli.terminal.clear()
    const nameLength = getLongestResourceName(resources)
    resources.forEach((item: Resource) => {
        const msg = formatResourceStatus(nameLength, item)
        cli.terminal.print(msg)
    })
    cli.terminal.print('')
    printStatus('Deploying CloudFormation Template')
}

export async function checkDeploymentStatus(input: CheckDeploymentInput) {
    cli.terminal.clear()
    printStatus(input.messages.inProcess)

    const res = await aws.cloudformation.getDeployStatus({
        region: input.region,
        config: {
            stackName: input.stackName,
            minRetryInterval: 5000,
            maxRetryInterval: 10000,
            backoffRate: 1.1,
            maxRetries: 200,
            onCheck: onStatusCheck
        }
    })

    cli.terminal.endLoadingMessage()

    if (res.status === 'fail') {
        throw new Error(input.messages.fail)
    }

    if (res.status === 'rollback') {
        throw new Error('Deployment has been rolled back')
    }

    if (res.status === 'inprogress') {
        throw new Error('Deployment is still in progress')
    }
}
