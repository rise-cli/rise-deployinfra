# Rise DeployInfra

## Install

```
npm i rise-deployinfra
```

## Usage

```js
import { deployInfra } from 'rise-deployinfra'

const template = {
    // CloudFormation template in JSON format
}

const res = await deployInfra({
    name: 'my-stack',
    region: 'us-east-1',
    stage: 'dev',
    template: JSON.stringify(template),
    outputs: ['URL']
})
```
