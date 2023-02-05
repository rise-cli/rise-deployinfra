import * as cli from 'rise-cli-foundation'
import * as aws from 'rise-aws-foundation'
import { formatCloudformationStatus } from './print.mjs'

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
        /**
         * Start deployment
         */
        await aws.cloudformation.deployStack({
            name: name + stage,
            region,
            template: template
        })

        /**
         * Check status of deployment
         */
        cli.clear()
        cli.endLoadingMessage()
        cli.startLoadingMessage('Deploying CloudFormation Template')

        const res = await aws.cloudformation.getDeployStatus({
            region: region,
            config: {
                stackName: name + stage,
                minRetryInterval: 5000,
                maxRetryInterval: 10000,
                backoffRate: 1.1,
                maxRetries: 200,
                onCheck: (resources) => {
                    cli.clear()
                    const cfStatus = formatCloudformationStatus(resources)
                    cli.print(cfStatus)
                    cli.endLoadingMessage()
                    cli.startLoadingMessage('Deploying CloudFormation Template')
                }
            }
        })

        cli.endLoadingMessage()

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

/**
 * @param props
 * @param {string} props.name
 * @param {string} props.region
 * @param {string} props.stage
 */
export async function removeInfra({ name, region, stage }) {
    try {
        /**
         * Start deployment
         */
        await aws.cloudformation.removeStack({
            name: name + stage,
            region
        })

        /**
         * Check status of deployment
         */
        cli.clear()
        cli.endLoadingMessage()
        cli.startLoadingMessage('Removing CloudFormation Template')

        const res = await aws.cloudformation.getDeployStatus({
            region: region,
            config: {
                stackName: name + stage,
                minRetryInterval: 5000,
                maxRetryInterval: 10000,
                backoffRate: 1.1,
                maxRetries: 200,
                onCheck: (resources) => {
                    cli.clear()
                    const cfStatus = formatCloudformationStatus(resources)
                    cli.print(cfStatus)
                    cli.endLoadingMessage()
                    cli.startLoadingMessage('Deploying CloudFormation Template')
                }
            }
        })

        cli.endLoadingMessage()

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

        cli.clear()
        cli.printSuccessMessage('Deployment Complete')

        return {
            status: 'ok',
            message: 'Template removed successfully'
        }
    } catch (e) {
        if (e.message.includes('does not exist')) {
            cli.endLoadingMessage()
            cli.clear()
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
