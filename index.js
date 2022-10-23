const core = require('@actions/core');
const aws = require('aws-sdk');
const fs = require('fs');
const tmp = require('tmp');

async function run() {
    try {
        const taskDefinitionFamily = core.getInput('task-definition-family');
        const temporaryFile = tmp.fileSync({
            tmpdir: process.env.RUNNER_TEMP,
            keep: true,
            postfix: taskDefinitionFamily + ".json"
        });
        const ecs = new aws.ECS();

        let describeTaskDefinitionResponse
        try {
            describeTaskDefinitionResponse = await ecs.describeTaskDefinition({taskDefinition: taskDefinitionFamily}).promise();
        } catch (error) {
            core.setFailed("Failed to describe task definition in ECS: " + error.message);
            core.debug("Task definition family:");
            core.debug(taskDefinitionFamily);
            core.debug(error.stack);
            throw(error);
        }
        const serializedTaskDefinition = JSON.stringify(describeTaskDefinitionResponse.taskDefinition, undefined, 2);
        fs.writeSync(temporaryFile.fd, serializedTaskDefinition);
        core.setOutput("task-definition", temporaryFile.name);
    } catch (error) {
        core.setFailed(error.message);
        core.debug(error.stack);
    }
}

module.exports = run;

if (require.main === module) {
    run();
}
