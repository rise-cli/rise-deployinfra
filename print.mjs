import * as cli from 'rise-cli-foundation'

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

export function printResourceStatus(nameLength, resource) {
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

function getLongestResourceName(resources) {
    return resources.reduce((acc, r) => {
        return r.id.length > acc ? r.id.length : acc
    }, 0)
}

export function formatCloudformationStatus(resources) {
    let text = ''
    const nameLength = getLongestResourceName(resources)
    resources.forEach((resource) => {
        const msg = printResourceStatus(nameLength, resource)
        text = text + msg + '\n'
    })
    return text
}
