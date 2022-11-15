import cli from 'cli-foundation'

function makeCheckmarkIcon() {
    return cli.terminal.makeGreenText('✔')
}

function makeInProgressIcon() {
    return cli.terminal.makeBlueText('•')
}

function makeErrorIcon() {
    return cli.terminal.makeRedText('•')
}

function makeStatusText(text: string) {
    return cli.terminal.makeDimText(text)
}

function makeName(text: string, cellLength: number) {
    return cli.terminal.setTextWidth(text, cellLength)
}

export function makeSuccessMessage(
    name: string,
    length: number,
    status: string
) {
    return `${makeCheckmarkIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}

export function makeInProgressMessage(
    name: string,
    length: number,
    status: string
) {
    return `${makeInProgressIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}

export function makeErrorMessage(name: string, length: number, status: string) {
    return `${makeErrorIcon()} ${makeName(name, length)} ${makeStatusText(
        status
    )}`
}
