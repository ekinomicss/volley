export const getDeploymentInfo = async () => {
    // This can be replaced with an actual deployment tracking system (e.g., Git, CI/CD system)
    return {
        deployId: 'abc123',  // Example deploy ID
        deployDetails: 'Deployment from branch main, commit 45fd3'  // Example details
    };
};


/* Github Actions */ 
// import axios from 'axios';

// export const getDeploymentInfo = async () => {
//     const { data } = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/actions/runs?status=success&per_page=1`, {
//         headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
//     });

//     return {
//         deployId: data.workflow_runs[0].id.toString(),
//         deployDetails: `${data.workflow_runs[0].head_commit.message} - ${data.workflow_runs[0].html_url}`
//     };
// };