import aws from 'aws-foundation'
import cli from 'cli-foundation'
import { checkDeploymentStatus } from './checkDeploymentStatus'

type Input = {
    name: string
    region: string
    stage: string
    template: string
    outputs: string[]
}

type DeploySuccess = {
    status: 'ok'
    message: 'Template deployed successfully'
    outputs: Record<string, string>
}

type DeployFailure = {
    status: 'error'
    message: string
}

type Result = DeploySuccess | DeployFailure

export async function deployInfra({
    name,
    region,
    stage,
    template,
    outputs
}: Input): Promise<Result> {
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

        cli.terminal.clear()
        cli.terminal.printSuccessMessage('Deployment Complete')

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
