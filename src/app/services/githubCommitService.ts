import axios from 'axios';
import * as dotenv from 'dotenv';
import moment from 'moment'; 

const repoOwner = 'ekinomicss';
const repoName = 'volley_toy_dropdown';
const token = process.env.GITHUB_TOKEN;

const url = `https://api.github.com/repos/${repoOwner}/${repoName}/commits`;

// Fetch all commits from the repository for TODAY!
export const fetchCommitsToday = async (): Promise<string> => {
  let concatenatedCommitInfo = '';

  try {
    const today = moment().startOf('day').toISOString();
    
    const response = await axios({
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'commit-fetcher'
      },
      params: {
        since: today, 
      }
    });

    const commits = response.data;

    for (const commit of commits) {
      const commitHash = commit.sha;
      const commitMessage = commit.commit.message;
      
      const diffResponse = await axios({
        url: `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commitHash}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'commit-fetcher'
        }
      });

      const commitDiff = diffResponse.data.files.map((file: any) => file.patch).join('\n');
      
      concatenatedCommitInfo += `Commit Message: ${commitMessage}\n`;
      concatenatedCommitInfo += `Commit Hash: ${commitHash}\n`;
      concatenatedCommitInfo += `Commit Diff:\n${commitDiff}\n`;
      concatenatedCommitInfo += '---------------------------------------------\n';
    }

    return concatenatedCommitInfo;

  } catch (error) {
    console.error('Error fetching commits:', error);
    return '';
  }
};

fetchCommitsToday().then(commitInfo => {
  console.log('Today\'s Commits:\n', commitInfo);
});