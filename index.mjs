import * as cli from 'rise-cli-foundation'
import * as aws from 'rise-aws-foundation'
import { formatCloudformationStatus } from './print.mjs'

export const deployInfraAction = (io) =>
    async ({ name, region, stage, template, outputs }) => {
        try {
            /**
             * Start deployment
             */
            await io.aws.deployStack({
                name: name + stage,
                region,
                template
            })

            /**
             * Check status of deployment
             */
            io.cli.clear()
            io.cli.endLoadingMessage()
            io.cli.startLoadingMessage('Deploying CloudFormation Template')

            const res = await io.aws.getDeployStatus({
                region: region,
                config: {
                    stackName: name + stage,
                    minRetryInterval: 5000,
                    maxRetryInterval: 10000,
                    backoffRate: 1.1,
                    maxRetries: 200,
                    onCheck: (resources) => {
                        io.cli.clear()
                        const cfStatus = formatCloudformationStatus(resources)
                        io.cli.print(cfStatus)
                        io.cli.endLoadingMessage()
                        io.cli.startLoadingMessage(
                            'Deploying CloudFormation Template'
                        )
                    }
                }
            })

            io.cli.endLoadingMessage()

            if (res.status === 'fail') {
                throw new Error('CloudFormation deployment has failed')
            }

            if (res.status === 'rollback') {
                throw new Error('Deployment has been rolled back')
            }

            if (res.status === 'inprogress') {
                throw new Error('Deployment is still in progress')
            }

            /**
             * Return result
             */
            if (outputs.length === 0) {
                return {
                    status: 'ok',
                    message: 'Template deployed successfully',
                    outputs: {}
                }
            }

            const outputsResult = await io.aws.getOutputs({
                stack: name + stage,
                region: region,
                outputs: outputs
            })

            io.cli.clear()
            io.cli.printSuccessMessage('Deployment Complete')

            return {
                status: 'ok',
                message: 'Template deployed successfully',
                outputs: outputsResult
            }
        } catch (e) {
            let message =
                e instanceof Error
                    ? e.message
                    : 'Something unexpected has occurred'
            return {
                status: 'error',
                message: message
            }
        }
    }
/**
 * @param props
 * @param {string} props.name
 * @param {string} props.region
 * @param {string} props.stage
 * @param {string} props.template
 * @param {Array.of<string>} props.outputs
 */
export async function deployInfra({ name, region, stage, template, outputs }) {
    const io = {
        aws: {
            deployStack: aws.cloudformation.deployStack,
            getDeployStatus: aws.cloudformation.getDeployStatus,
            getOutputs: aws.cloudformation.getOutputs
        },
        cli: {
            clear: cli.clear,
            print: cli.print,
            endLoadingMessage: cli.endLoadingMessage,
            startLoadingMessage: cli.startLoadingMessage,
            printSuccessMessage: cli.printSuccessMessage
        }
    }
    return await deployInfraAction(io)({
        name,
        region,
        stage,
        template,
        outputs
    })
}

export const removeInfraAction = (io) =>
    async ({ name, region, stage }) => {
        try {
            /**
             * Start deployment
             */
            await io.aws.removeStack({
                name: name + stage,
                region
            })

            /**
             * Check status of deployment
             */
            io.cli.clear()
            io.cli.endLoadingMessage()
            io.cli.startLoadingMessage('Removing CloudFormation Template')

            const res = await io.aws.getDeployStatus({
                region: region,
                config: {
                    stackName: name + stage,
                    minRetryInterval: 5000,
                    maxRetryInterval: 10000,
                    backoffRate: 1.1,
                    maxRetries: 200,
                    onCheck: (resources) => {
                        io.cli.clear()
                        const cfStatus = formatCloudformationStatus(resources)
                        io.cli.print(cfStatus)
                        io.cli.endLoadingMessage()
                        io.cli.startLoadingMessage(
                            'Removing CloudFormation Template'
                        )
                    }
                }
            })

            io.cli.endLoadingMessage()

            if (res.status === 'fail') {
                throw new Error('CloudFormation removal has failed')
            }

            if (res.status === 'rollback') {
                throw new Error('Removal has been rolled back')
            }

            if (res.status === 'inprogress') {
                throw new Error('Removal is still in progress')
            }

            /**
             * Return result
             */

            io.cli.clear()
            io.cli.printSuccessMessage('Remove Complete')

            return {
                status: 'ok',
                message: 'Template removed successfully'
            }
        } catch (e) {
            if (e.message.includes('does not exist')) {
                io.cli.endLoadingMessage()
                io.cli.clear()
                return {
                    status: 'ok',
                    message: 'Template removed successfully'
                }
            }

            let message = 'Something unexpected has occurred'
            return {
                status: 'error',
                message: message
            }
        }
    }

/**
 * @param props
 * @param {string} props.name
 * @param {string} props.region
 * @param {string} props.stage
 */
export async function removeInfra({ name, region, stage }) {
    const io = {
        aws: {
            deployStack: aws.cloudformation.removeStack,
            getDeployStatus: aws.cloudformation.getDeployStatus
        },
        cli: {
            clear: cli.clear,
            print: cli.print,
            endLoadingMessage: cli.endLoadingMessage,
            startLoadingMessage: cli.startLoadingMessage,
            printSuccessMessage: cli.printSuccessMessage
        }
    }
    return await removeInfraAction(io)({
        name,
        region,
        stage,
        template,
        outputs
    })
}
