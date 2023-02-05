import { deployInfra } from '../index.mjs'

const template = {
    Resources: {
        Database: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: 'mydeployinfratestdb',
                AttributeDefinitions: [
                    {
                        AttributeName: 'pk',
                        AttributeType: 'S'
                    },
                    {
                        AttributeName: 'sk',
                        AttributeType: 'S'
                    }
                ],
                KeySchema: [
                    {
                        AttributeName: 'pk',
                        KeyType: 'HASH'
                    },
                    {
                        AttributeName: 'sk',
                        KeyType: 'RANGE'
                    }
                ],

                BillingMode: 'PAY_PER_REQUEST'
            }
        }
    },
    Outputs: {}
}
async function main() {
    const x = await deployInfra({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev',
        template: JSON.stringify(template),
        outputs: ['URL']
    })
    console.log(x)
}
main()
