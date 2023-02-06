# Rise DeployInfra

## Project Status

-   ✅ tests
-   ✅ docs
-   ✅ examples
-   🔲 CICD

## Install

```
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
    Outputs: {}
}

const res = await deployInfra({
    name: 'my-stack',
    region: 'us-east-1',
    stage: 'dev',
    template: JSON.stringify(template),
    outputs: ['URL']
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
