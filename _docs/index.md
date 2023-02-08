# Rise DeployInfra

[Github](https://github.com/rise-cli/rise-deployinfra)

```bash
npm i rise-deployinfra
```

## Usage

### Deploy

```js
import { deployInfra } from 'rise-deployinfra'

const template = {
    Resources: {
        Database: {
            Type: 'AWS::DynamoDB::Table',
            Properties: {
                TableName: 'mydeplyinfratestdb',
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
    Outputs: {
        TABLEARN: {
            Value: {
                Ref: 'Database'
            }
        }
    }
}

const res = await deployInfra({
    name: 'my-stack',
    region: 'us-east-1',
    stage: 'dev',
    template: JSON.stringify(template),
    outputs: ['TABLEARN']
})
```

### Deploy

```js
import { removeInfra } from 'rise-deployinfra'

const res = await removeInfra({
    name: 'my-stack',
    region: 'us-east-1',
    stage: 'dev'
})
```
