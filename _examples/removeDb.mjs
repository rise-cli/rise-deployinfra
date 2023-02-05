import { removeInfra } from '../index.mjs'

async function main() {
    const x = await removeInfra({
        name: 'my-infradeploy-stack',
        region: 'us-east-1',
        stage: 'dev'
    })
    console.log(x)
}
main()
