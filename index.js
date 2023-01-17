import * as cli from 'rise-cli-foundation'
import * as aws from 'rise-aws-foundation'

/**
 * Logs
 */
function makeCheckmarkIcon() {
    return cli.makeGreenText('✔')
}

function makeInProgressIcon() {
    return cli.makeBlueText('•')
}

function makeErrorIcon() {
    return cli.makeRedText('•')
}

function makeStatusText(text) {
    return cli.makeDimText(text)
}

function makeName(text, cellLength) {
    return cli.setTextWidth(text, cellLength)
}

function makeSuccessMessage(name, length, status) {
    return `${makeCheckmarkIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}

function makeInProgressMessage(name, length, status) {
    return `${makeInProgressIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}

function makeErrorMessage(name, length, status) {
    return `${makeErrorIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}

function printStatus(x) {
    cli.endLoadingMessage()
    cli.startLoadingMessage(x)
}

/**
 * Check Deployment Status
 */
function getLongestResourceName(resources) {
    return resources.reduce((acc, r) => {
        return r.id.length > acc ? r.id.length : acc
    }, 0)
}

function formatResourceStatus(nameLength, resource) {
    const name = resource.id
    const status = resource.status

    if (resource.status.includes('COMPLETE')) {
        return makeSuccessMessage(name, nameLength, status)
    }

    if (
        resource.status.includes('FAILED') ||
        resource.status.includes('ROLLBACK')
    ) {
        return makeErrorMessage(name, nameLength, status)
    }

    return makeInProgressMessage(name, nameLength, status)
}

function onStatusCheck(resources) {
    cli.clear()
    const nameLength = getLongestResourceName(resources)
    resources.forEach((resource) => {
        const msg = formatResourceStatus(nameLength, resource)
        cli.print(msg)
    })
    cli.print('')
    printStatus('Deploying CloudFormation Template')
}

async function checkDeploymentStatus(input) {
    cli.clear()
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

    cli.endLoadingMessage()

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

/**
 * Deploy Infra
 */

/**
 * @param props
 * @param {string} props.name
 * @param {string} props.region
 * @param {string} props.stage
 * @param {string} props.template
 * @param {Array.of<string>} props.outputs
 */
export async function deployInfra({ name, region, stage, template, outputs }) {
    try {
        await aws.cloudformation.deployStack({
            name: name + stage,
            region,
            template: template
        })

        await checkDeploymentStatus({
            messages: {
                inProcess: 'Deploying CloudFormation Template',
                fail: 'CloudFormation deployment has failed'
            },
            stackName: name + stage,
            region
        })

        if (outputs.length === 0) {
            return {
                status: 'ok',
                message: 'Template deployed successfully',
                outputs: {}
            }
        }

        const outputsResult = await aws.cloudformation.getOutputs({
            stack: name + stage,
            region: region,
            outputs: outputs
        })

        cli.clear()
        cli.printSuccessMessage('Deployment Complete')

        return {
            status: 'ok',
            message: 'Template deployed successfully',
            outputs: outputsResult
        }
    } catch (e) {
        let message =
            e instanceof Error ? e.message : 'Something unexpected has occurred'
        return {
            status: 'error',
            message: message
        }
    }
}
