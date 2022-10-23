const core = require('@actions/core');
const aws = require('aws-sdk');
const fs = require('fs/promises');
const tmp = require('tmp');

async function run() {
    try {
        const taskDefinitionFamily = core.getInput('task-definition-family');
        const temporaryFile = tmp.fileSync({keep: true});
        const ecs = new aws.ECS();

        let describeTaskDefinitionResponse
        try {
            describeTaskDefinitionResponse = await ecs.describeTaskDefinition({family: taskDefinitionFamily}).promise();
        } catch (error) {
            core.setFailed("Failed to describe task definition in ECS: " + error.message);
            core.debug("Task definition family:");
            core.debug(taskDefinitionFamily);
            core.debug(error.stack);
            throw(error);
        }
        const serializedTaskDefinition = JSON.stringify(describeTaskDefinitionResponse.taskDefinition, undefined, 4);
        const file = await fs.open(temporaryFile.name);
        await file.writeFile(serializedTaskDefinition);
    } catch (error) {
        core.setFailed(error.message);
        core.debug(error.stack);
    }
}

module.exports = run;

if (require.main === module) {
    run();
}
